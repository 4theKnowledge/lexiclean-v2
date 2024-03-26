import express from "express";
import logger from "../logger/index.js";
import Project from "../models/Project.js";
import Resource from "../models/Resource.js";
import Text from "../models/Text.js";
import User from "../models/User.js";
import {
  removeTabs,
  removeCasing,
  removeSpecialChars,
  removeWhiteSpace,
  removeDuplicates,
  calculateTFIDF,
} from "../utils/project.js";
import { normaliseSpecialTokens } from "../utils/project.js";
import Annotations from "../models/Annotations.js";
import mongoose from "mongoose";
import {
  projectAccessCheck,
  projectManagementCheck,
} from "../middleware/auth.js";
import { textTokenSearchPipeline } from "../aggregations/token.js";
import { annotationsWithTokenDataPipeline } from "../aggregations/annotation.js";
import Notifications from "../models/Notifications.js";
import {
  compileTokens,
  documentLevelIAA,
  getTextsWithUserAnnotations,
  getCompiledTexts,
  getSummaryMetrics,
  getProjectIAA,
} from "../services/project.js";
import fs from "fs/promises";
import path from "path";

const appRoot = process.env.APP_ROOT || ".";
const lexiconPath = path.join(appRoot, "src", "data", "en_lexicon.json");

const router = express.Router();
const REPLACEMENT_COLOR = "#03a9f4";

// Function to count texts with saves meeting a given number
const countTextsWithSavesAtThreshold = (annotations, saveThreshold) => {
  const saveCounts = new Map();

  annotations.forEach(({ textId, type }) => {
    textId = textId.toString();
    saveCounts.set(textId, (saveCounts.get(textId) || 0) + 1);
  });

  let textsMeetingThreshold = 0;
  for (let count of saveCounts.values()) {
    if (count >= saveThreshold) textsMeetingThreshold++;
  }

  return textsMeetingThreshold;
};

router.post("/create", async (req, res) => {
  logger.info("Creating project", { route: "/api/project/create" });
  try {
    const userId = req.userId;

    const {
      projectName,
      projectDescription,
      corpusType,
      corpusFileName,
      corpus,
      preprocessLowerCase,
      preprocessRemoveDuplicates,
      preprocessRemoveChars,
      preprocessRemoveCharSet,
      replacementDictionary,
      replacementDictionaryFileName,
      preannotationReplacements,
      preannotationSchema,
      preannotationDigits,
      preannotationRanking,
    } = req.body;

    let { tags, flags, specialTokens } = req.body;

    const isParallelCorpusProject = corpusType === "parallel";
    console.log("tags: ", tags);

    /**
     * Load English lexicon (map shared for all projects) and
     * create map sets used for pre-annotation of tokens
     */
    let enMap = await Resource.findOne({ type: "en" });

    if (!enMap) {
      console.log("English lexicon not available...");
      // Insert into db
      try {
        const rawData = await fs.readFile(lexiconPath, "utf8");
        const docs = JSON.parse(rawData);
        // Assuming docs[0] has a 'type' property you want to check
        if (docs[0] && docs[0].type === "en") {
          const lexiconResult = await Resource.create(docs[0]);
          console.log(`Lexicon added with _id: ${lexiconResult.insertedId}`);

          enMap = await Resource.findOne({ type: "en" });
        } else {
          console.log("No 'en' type lexicon found in the provided file.");
        }
      } catch (error) {
        console.error("Failed to read or insert lexicon data:", error);
      }
    } else {
      console.log("An 'en' type lexicon entry already exists in the database.");
    }

    console.log(enMap._id);
    const enMapId = enMap._id;
    console.log(`loaded en map with ${enMap.tokens.length} tokens`);
    enMap = new Set(enMap.tokens);

    specialTokens = specialTokens.trim();
    if (specialTokens) {
      console.log("Project has special tokens.");
      // Add special tokens to in-vocabulary English map. These will be considered in-vocabulary.
      specialTokens = normaliseSpecialTokens(specialTokens);
      specialTokens.forEach((st) => enMap.add(st));
    } else {
      console.log("No special tokens provided or special tokens are empty.");
    }

    let parsedReplacementDictionary;

    try {
      parsedReplacementDictionary = JSON.parse(replacementDictionary);
    } catch (e) {
      // If JSON parsing fails, log the error (optional) and use an empty object
      console.error("Failed to parse replacementDictionary:", e);
      parsedReplacementDictionary = {};
    }

    // Create resource for `parsedReplacementDictionary`
    const rpMap = await Resource.create({
      type: "rp",
      replacements: parsedReplacementDictionary,
      color: REPLACEMENT_COLOR,
    });
    console.log("rpMap", rpMap);

    // Create resources for each user-specific tag. They may or may no have associated tokens/data.

    const tagResponse = await Resource.insertMany(
      tags.map((t) => ({ ...t, type: t.name, tokens: t.data }))
    );

    console.log("tagResponse: ", tagResponse);

    let tagSets = {};
    // Convert maps to Sets
    if (tagResponse.length > 0) {
      tagSets = tagResponse.reduce((acc, map) => {
        acc[map._id] = new Set(map.tokens);
        return acc;
      }, {});
    }

    // console.log("mapSets", mapSets);
    logger.info("[CREATE PROJECT] resources created");

    // Create object from array of replacement tokens
    // (this is done as Mongo cannot store keys with . or $ tokens)
    // const rpObj = isParallelCorpusProject
    //   ? {}
    //   : rpMap.replacements.reduce(
    //       (obj, item) => ({ ...obj, [item.original]: item.normed }),
    //       {}
    //     );

    console.log("tagSets", tagSets);

    // Create base project
    const project = new Project({
      owner: userId,
      name: projectName,
      description: projectDescription,
      parallelCorpus: isParallelCorpusProject,
      corpusFileName,
      annotators: [userId],
      // settings: {}, // TODO: with preannotation settings.
      preprocessing: {
        removeLowerCase: isParallelCorpusProject ? false : preprocessLowerCase,
        removeDuplicates: isParallelCorpusProject
          ? false
          : preprocessRemoveDuplicates,
        digitsIV: isParallelCorpusProject ? false : preannotationDigits,
        removeChars: isParallelCorpusProject ? false : preprocessRemoveChars,
      },
      maps: [enMapId, rpMap._id, ...Object.keys(tagSets)], // Maps are those that are mapped to a fixed system voacb, user-supplied replacement dictionary, and tags which optionally have tokens/data..
      tags: tagResponse.map((t) => ({
        _id: t._id,
        name: t.type,
        color: t.color,
      })), // This is the schema for entity-label tagging.
      flags: flags.map((f) => ({
        name: f.name,
      })), // These will be given an _id when the project is populated.
    });

    console.log(project);

    if (specialTokens) {
      // Add special tokens array to project
      project.specialTokens = specialTokens;
    }

    // project.save();

    logger.info("[CREATE PROJECT] base project created");

    // console.log("base project created:", project);

    let textObjs;
    let texts;
    let allAnnotations = [];
    let candidateTokens = []; // Candidate tokens are those that are out of English vocab and do not have replacements.

    if (isParallelCorpusProject) {
      // User uploads source and target texts; for MT sequence data tokens have no history (original value)
      // TODO: allow users to upload aligned sequences (token clf style) that adds tokens history.

      // corpus: `id: {source: '', target: '', id; ''}`

      // `original` is the source
      // `tokens` are from the target

      // Create base texts
      textObjs = corpus.map((doc) => {
        return {
          original: doc.text,
          reference: doc.reference,
          weight: 0,
          rank: 0,
          saved: false,
          identifiers: [doc.identifier], // Note: No preprocessing, so duplicates cannot have ids merged.
        };
      });

      texts = await Text.insertMany(
        textObjs.map((obj) => ({ ...obj, projectId: project._id }))
      );
    } else {
      // Process texts they are an Object {id:text}. For users who did not select texts with ids, the id is a placeholder.
      const normalisedTexts = Object.assign(
        {},
        ...corpus.map((doc) => {
          let text = doc.text;
          text = removeTabs(text);
          text = removeCasing(preprocessLowerCase, text);
          text = removeSpecialChars(preprocessRemoveCharSet, text);
          text = removeWhiteSpace(text);
          return { [doc.identifier]: text };
        })
      );

      // console.log("normalisedTexts", normalisedTexts);

      // Duplication removal
      const filteredTexts = removeDuplicates(
        preprocessRemoveDuplicates,
        normalisedTexts
      );

      const checkIsDigit = ({ annotateDigits, token }) => {
        return annotateDigits && /^\d+$/g.test(token);
      };

      // Create base texts, get list of tokens in project, and their associated annotations.

      textObjs = filteredTexts.map((obj, textIndex) => {
        // Create tokens for the current text
        const tokens = obj.text.split(" ").map((value, index) => {
          // Check whether token is in English vocabulary
          const tokenIV = enMap.has(value)
            ? true
            : checkIsDigit({
                annotateDigits: preannotationDigits,
                token: value,
              });

          if (!tokenIV) {
            candidateTokens.push(value);
          }

          if (preannotationReplacements) {
            const tokenHasReplacement =
              parsedReplacementDictionary[value] || false;

            if (tokenHasReplacement) {
              candidateTokens.push(value);
              allAnnotations.push({
                type: "replacement",
                userId: userId,
                value: parsedReplacementDictionary[value],
                tokenIndex: index,
                textIndex: textIndex,
              });
            }
          }

          // TODO: Do something with tag dictionaries here to create tags...
          if (preannotationSchema) {
            for (const tag of Object.keys(tagSets)) {
              // Iterate through tags to see whether any tokens match their gazetteers

              const hasTagMatch = tagSets[tag].has(value) || false;

              if (hasTagMatch) {
                try {
                  allAnnotations.push({
                    type: "tag",
                    userId: userId,
                    value: new mongoose.Types.ObjectId(tag),
                    tokenIndex: index,
                    textIndex: textIndex,
                  });
                } catch (error) {
                  console.log("error assigning matched tag...");
                }
              }
            }
          }
          return {
            index,
            value,
            en: tokenIV,
          };
        });

        // Return the object structure for the current text, including its tokens
        return {
          original: obj.text,
          weight: 0,
          rank: 0,
          identifiers: obj.ids,
          projectId: project._id,
          tokens, // Use the tokens created above
        };
      });

      texts = await Text.insertMany(textObjs);

      console.log(texts);

      // Create annotation objects - need to assign token/text ids...
      for (const annotation of allAnnotations) {
        const { type, userId, value, tokenIndex, textIndex } = annotation;
        console.log(type, userId, value, tokenIndex, textIndex);
        const text = texts[textIndex];
        const textId = text._id;
        const tokenId = text.tokens[tokenIndex]._id;

        await Annotations.create({ type, userId, textId, tokenId, value });
      }

      // console.log("texts: ", texts);

      logger.info("[CREATE PROJECT] texts added to database");
      console.log("candidates: ", candidateTokens);
      console.log("allAnnotations:", allAnnotations);
    }

    logger.info("[CREATE PROJECT] text and tokens added to database");

    // Add texts and metrics to project
    project.texts = texts.map((text) => text._id);

    const textTokens = texts.flatMap((text) => text.original.split(" "));
    project.metrics.startTokenCount = textTokens.length;
    project.metrics.startVocabSize = new Set(textTokens).size;

    logger.info("[CREATE PROJECT] metrics added to project");

    project.metrics.startCandidateVocabSize = candidateTokens.length;
    project.save();

    logger.info("[CREATE PROJECT] base metrics added to project");

    if (preannotationRanking) {
      /**
       * Calculate mean, masked, TF-IDF for each text
       */
      // Compute average document tf-idf1
      // - 1. get set of candidate tokens (derived up-stream)
      // - 2. filter texts for only candidate tokens
      // - 3. compute filtered text average tf-idf score/weight
      const tfidfs = calculateTFIDF(texts); // Token tf-idfs

      logger.info("[CREATE PROJECT] calculated inverse TF-IDF scores");
      console.log("tfidfs: ", tfidfs);

      const candidateTokensUnique = new Set(candidateTokens);

      //  Calculate mean, weighted, tf-idfs scores (TODO: Review values)
      texts = texts.map((text) => {
        const tokenWeights = text.tokens
          .filter((token) => candidateTokensUnique.has(token.value))
          .map((token) => tfidfs[token.value]);

        const textWeight =
          tokenWeights.length > 0 ? tokenWeights.reduce((a, b) => a + b) : -1;

        text.weight = textWeight;

        return text;
      });

      // Rank texts by their weight
      texts = texts
        .sort((a, b) => b.weight - a.weight)
        .map((text, index) => {
          text.rank = index;
          return text;
        });

      // Add weight and rank to text objects
      const weightedTextUpdateObjs = texts.map((text) => {
        const { weight, rank, _id } = text;
        delete text.projectId;

        return {
          updateOne: {
            filter: { _id },
            update: { $set: { weight, rank } },
            options: { upsert: true },
          },
        };
      });
      await Text.bulkWrite(weightedTextUpdateObjs);
      logger.info("[CREATE PROJECT] weighted and ranked texts");
    }

    res.json({ details: "Project created successfully." });
  } catch (error) {
    logger.error("Failed to create project", { route: "/api/project/create" });
    console.log(`error ${error}`);
    res.status(500).send({ detail: error });
  }
});

router.get("/", async (req, res) => {
  try {
    logger.info("Fetching all projects", { route: "/api/project/" });
    const userId = req.userId;
    // TODO: update to check if userId in owner or annotators.
    const projects = await Project.find(
      {
        $or: [
          { owner: userId }, // Checks if the owner is userId
          { annotators: userId }, // Checks if userId is in the annotators array
        ],
      },
      { texts: 0 }
    ).lean();

    res.json(projects);
  } catch (error) {
    logger.error("Failed to fetch all projects", { route: "/api/project/" });
    console.log(`error ${error}`);
    res.status(500).send({ detail: error });
  }
});

router.get("/feed", async (req, res) => {
  logger.info("Fetching project feed", { route: "/api/project/feed" });

  try {
    const userId = req.userId;
    const projects = await Project.find({
      $or: [
        { owner: userId }, // Checks if the owner is userId
        { annotators: userId }, // Checks if userId is in the annotators array
      ],
    }).lean();

    const output = await Promise.all(
      projects.map(async (project) => {
        const annotations = await Annotations.find({
          textId: { $in: project.texts },
          type: "save",
        });

        const numAnnotators = project.annotators.length;
        const numTexts = project.texts.length;

        // Get users progress
        const userSaveCount = annotations.filter(
          (a) => a.userId.toString() === userId.toString()
        ).length;

        const userProgress = (userSaveCount / numTexts) * 100;

        // Get projects progress - all users have saved the doc.
        const projectSaveCount = countTextsWithSavesAtThreshold(
          annotations,
          numAnnotators
        );
        const progress = (projectSaveCount / numTexts) * 100;

        return {
          _id: project._id,
          isParallelCorpusProject: project.parallelCorpus,
          name: project.name,
          description: project.description,
          progress,
          textCount: numTexts,
          saveCount: projectSaveCount,
          userSaveCount,
          userProgress,
          createdAt: project.createdAt,
          annotators: numAnnotators,
        };
      })
    );
    res.json(output);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to fetch project feed", {
      route: "/api/project/feed",
    });
  }
});

router.patch("/", projectManagementCheck, async (req, res) => {
  logger.info("Updating single project", { route: "/api/project/" });
  try {
    const userId = req.userId;
    const { name, description, projectId } = req.body;

    // Create an object for the fields to update
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;

    const updatedProject = await Project.updateOne(
      { _id: projectId, owner: userId },
      { $set: updateFields }
    );
    res.json(updatedProject);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to update single project", { route: "/api/project/" });
  }
});

router.get("/:projectId", projectAccessCheck, async (req, res) => {
  logger.info("Fetching single project", {
    route: `/api/project/${req.params.projectId}`,
  });

  try {
    const { projectId } = req.params;

    const project = await Project.findOne(
      {
        _id: projectId,
      },
      { texts: 0 }
    ).lean();

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const schemaMap = project.tags.reduce((acc, { _id, name, color }) => {
      acc[_id] = { name, color };
      return acc;
    }, {});

    res.json({ ...project, schemaMap });
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to fetch single project", {
      route: `/api/project/${req.params.projectId}`,
    });
  }
});

router.delete("/:projectId", projectManagementCheck, async (req, res) => {
  logger.info("Deleting project", { route: "/api/project/" });
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    const project = await Project.findOne(
      {
        _id: projectId,
        owner: userId,
      },
      { maps: 1, texts: 1 }
    ).lean();

    await Project.deleteOne({ _id: projectId });
    await Text.deleteMany({ projectId: projectId });
    await Annotations.deleteMany({ textId: { $in: project.texts } });
    await Resource.deleteMany({
      _id: { $in: project.maps },
      type: { $ne: "en" },
    });
    await Notifications.deleteMany({ projectId: projectId });

    res.json("Successfully deleted project.");
  } catch (error) {
    logger.error(`Failed to delete project - ${error}`, {
      route: "/api/project/",
    });
    res.json({ details: error });
  }
});

/**
 * Gets the progress for a single user.
 */
router.get("/progress/:projectId", projectAccessCheck, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId, "texts").lean();

    // Ensure project exists
    if (!project) {
      console.log(`Project not found with ID: ${projectId}`);
      return res.status(404).send({ message: "Project not found." });
    }

    const textIds = project.texts;
    const totalTexts = textIds.length;

    // Check if there are any texts to calculate progress from
    if (totalTexts === 0) {
      return res.json({ progress: { value: 0, title: "0/0" } });
    }

    const savedTexts = await Annotations.count({
      userId,
      textId: { $in: textIds },
      type: "save",
      value: true,
    });

    const progress = {
      value: Math.round((savedTexts / totalTexts) * 100),
      title: `${savedTexts}/${totalTexts}`,
    };
    res.json({ progress });
  } catch (error) {
    console.error(`Error fetching progress: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * TODO: Update and make for single user view.
 * Get metrics that are used in the sidebar for a single project
 */
router.get("/metrics/:projectId", projectAccessCheck, async (req, res) => {
  try {
    // const project = await Project.findById({
    //   _id: req.params.projectId,
    // }).lean();
    // const textsTotal = await Text.count({ projectId: req.params.projectId });
    // const textsSaved = await Text.count({
    //   projectId: req.params.projectId,
    //   saved: true,
    // });
    // const tokens = await Token.find({
    //   projectId: req.params.projectId,
    // }).lean();
    // // Capture the number of tokens that exist in the original values or
    // // introduced through replacements (if a token has one)
    // const vocabSize = new Set(
    //   tokens.map((token) =>
    //     token.replacement ? token.replacement : token.value
    //   )
    // ).size;
    // // Capture the number of tokens that are OOV e.g. have no meta-tags that are true
    // // including English and do not have a current replacement.
    // const oovTokenLength = tokens
    //   .filter(
    //     (token) =>
    //       Object.values(token.tags).filter((tagBool) => tagBool).length === 0 &&
    //       !token.replacement
    //   )
    //   .map((token) => token.value).length;
    // const payload = [
    //   {
    //     description: "Texts Annotated",
    //     detail: `${textsSaved} / ${textsTotal}`,
    //     value: `${Math.round((textsSaved * 100) / textsTotal)}%`,
    //     title: "Texts that have had classifications or replacements.",
    //   },
    //   {
    //     description: "Vocabulary Reduction",
    //     detail: `${vocabSize} / ${project.metrics.startVocabSize}`,
    //     value: `${Math.round(
    //       (1 - vocabSize / project.metrics.startVocabSize) * 100
    //     )}%`,
    //     title:
    //       "Comparison between of current vocabulary and starting vocabulary",
    //   },
    //   {
    //     description: "Vocabulary Corrections",
    //     detail: `${
    //       project.metrics.startCandidateVocabSize - oovTokenLength
    //     } / ${project.metrics.startCandidateVocabSize}`,
    //     value: `${Math.round(
    //       ((project.metrics.startCandidateVocabSize - oovTokenLength) * 100) /
    //         project.metrics.startCandidateVocabSize
    //     )}%`,
    //     title:
    //       "Sum of all outstanding out-of-vocabulary tokens. All tokens replaced and/or classified with meta-tags are captured",
    //   },
    // ];
    // res.json(payload);
  } catch (err) {
    res.json({ message: err });
  }
});

router.get("/download/:projectId", projectAccessCheck, async (req, res) => {
  logger.info("Downloading project results", {
    route: "/api/project/download/:projectId",
  });
  try {
    const { projectId } = req.params;

    const project = await Project.findById(
      {
        _id: projectId,
      },
      { _id: 0, owner: 0, maps: 0, __v: 0, updatedAt: 0 }
    )
      .populate("annotators")
      .lean();

    const textIds = project.texts;
    delete project.texts;

    let textsWithUserAnnotations = await getTextsWithUserAnnotations(projectId);

    // Get compiled texts
    const compiledTexts = await getCompiledTexts(projectId);

    // Add compiled texts to `textsWithUserAnnotations` array
    textsWithUserAnnotations = textsWithUserAnnotations.map((text, index) => {
      text.compiledText = compiledTexts[index].map((token) => token.value);
      return text;
    });

    const payload = {
      metadata: {
        ...project,
        annotators: project.annotators.map((a) => a.username),
        totalTexts: textIds.length,
      },
      annotations: textsWithUserAnnotations,
    };

    res.json(payload);
  } catch (error) {
    console.log(`Error: ${error}`);
    res.json({ details: error });
  }
});

router.get(
  "/download/:projectId/replacements",
  projectAccessCheck,
  async (req, res) => {
    try {
      const { projectId } = req.params;

      const project = await Project.findOne({ _id: projectId }, { texts: 1 });
      const textIds = project.texts.map((id) => mongoose.Types.ObjectId(id));

      // Get all replacements that are not suggestions
      const annotations = await Annotations.find({
        textId: { $in: textIds },
        type: "replacement",
        isSuggestion: false,
      }).lean();

      console.log("annotations: ", annotations);

      let tokenReplacementCounts = {};
      for (const annotation of annotations) {
        const tokenIdStr = annotation.tokenId.toString();

        if (tokenReplacementCounts[tokenIdStr]) {
          tokenReplacementCounts[tokenIdStr].count += 1;
        } else {
          tokenReplacementCounts[tokenIdStr] = {
            value: annotation.value,
            count: 1,
          };
        }
      }

      console.log("tokenReplacementCounts: ", tokenReplacementCounts);

      // Find all the respective texts
      const annotatedTextIds = annotations.map((a) => a.textId);
      console.log("annotatedTextIds: ", annotatedTextIds);

      // Fetch texts
      const texts = await Text.find({ _id: { $in: annotatedTextIds } }).lean();
      // console.log(texts);

      let replacements = {};
      const tokenReplacementIds = Object.keys(tokenReplacementCounts);

      for (const text of texts) {
        for (const token of text.tokens) {
          const tokenIdStr = token._id.toString();

          if (tokenReplacementIds.includes(tokenIdStr)) {
            const tokenValue = token.value;
            const replacementEntry = tokenReplacementCounts[tokenIdStr];

            // Check if the replacements object already has an entry for this token value
            if (!replacements[tokenValue]) {
              replacements[tokenValue] = [replacementEntry];
            } else {
              // Find if an entry with the same value already exists
              let existingEntry = replacements[tokenValue].find(
                (entry) => entry.value === replacementEntry.value
              );

              if (existingEntry) {
                // If found, just update the count
                existingEntry.count += replacementEntry.count;
              } else {
                // Otherwise, push the new entry
                replacements[tokenValue].push(replacementEntry);
              }
            }
          }
        }
      }

      res.json(replacements);
    } catch (error) {}
  }
);

/**
 * Fetch project summary for client dashboard.
 */
router.get("/summary/:projectId", projectAccessCheck, async (req, res) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;

    const [project] = await Project.find({
      _id: projectId,
    })
      .populate("annotators")
      .lean();

    const numTexts = project.texts.length;
    const numAnnotators = project.annotators.length;

    // Check if user is owner of project
    const isOwner = project.owner.toString() === userId.toString();

    // Get user details - TODO: extend for all users on the project
    const users = await User.find({
      _id: { $in: [userId, ...project.annotators.map((a) => a._id)] },
    });

    const userDetails = users.reduce((acc, user) => {
      acc[user._id] = user.username;
      return acc;
    }, {});

    // console.log("userDetails: ", userDetails);

    const textIds = project.texts.map((t) => mongoose.Types.ObjectId(t));

    const savedTexts = await Annotations.find({
      textId: { $in: textIds },
      type: "save",
    });

    // Get users progress
    // const userSaveCount = savedTexts.filter(
    //   (a) => a.userId.toString() === userId.toString()
    // ).length;

    // const userProgress = (userSaveCount / numTexts) * 100;

    // Get projects progress - all users have saved the doc.
    const projectSaveCount = countTextsWithSavesAtThreshold(
      savedTexts,
      numAnnotators
    );
    const progress = (projectSaveCount / numTexts) * 100;

    const populatedReplacements = await Annotations.aggregate(
      annotationsWithTokenDataPipeline({
        type: "replacement",
        isSuggestion: false,
        textIds,
      })
    );

    console.log("populatedReplacements: ", populatedReplacements);

    let usedByCount = {};
    for (const replacement of populatedReplacements) {
      const replacementKey = `${replacement.originalValue}->${replacement.currentValue}`;
      console.log("REPLACEMENT", replacement);
      const userIdKey = userDetails[replacement.userId.toString()];

      // Initialize or update the count for the user
      if (!usedByCount[replacementKey]) {
        usedByCount[replacementKey] = {
          id: replacement.annotationId.toString(),
          input: replacement.originalValue,
          output: replacement.currentValue,
          usedBy: { [userIdKey]: 1 },
          new: false,
        };
      } else {
        usedByCount[replacementKey].usedBy[userIdKey] =
          (usedByCount[replacementKey].usedBy[userIdKey] || 0) + 1;
      }
    }

    // Now generate the replacementHistory from the usedByCount object
    let replacementHistory = Object.values(usedByCount);

    console.log("replacementHistory: ", replacementHistory);

    // const replacements = await Annotations.find({
    //   userId,
    //   textId: { $in: textIds },
    //   isSuggestion: false,
    //   type: "replacement",
    // });

    // console.log("replacements: ", replacements);

    // let emptyTokens = 0;

    // let replacementTokenIds = [];
    // let replacementTokens = [];

    // for (const replacement of replacements) {
    //   replacementTokenIds.push(replacement.tokenId);
    //   if (replacement.value !== "") {
    //     replacementTokens.push(replacement.value);
    //   } else {
    //     emptyTokens += 1;
    //   }
    // }
    // console.log("replacementTokens: ", replacementTokens);
    // console.log("emptyTokens replacements: ", emptyTokens);

    // Get all tokens except for those that have been transformed.
    // const allTokens = await Text.aggregate(
    //   textTokenSearchPipeline({
    //     projectId,
    //     excludeTokenIds: replacementTokenIds,
    //   })
    // );
    // console.log("allTokens: ", allTokens);

    // let tokens = [];
    // let enTokens = 0;

    // for (const token of allTokens) {
    //   if (token.value !== "") {
    //     tokens.push(token.value);
    //     enTokens += token.en ? 1 : 0;
    //   } else {
    //     emptyTokens += 1;
    //   }
    // }
    // console.log("tokens:", tokens);
    // console.log("enTokens:", enTokens);
    // console.log("emptyTokens tokens:", emptyTokens);

    // Filter out empty strings (placeholders for removed token values)

    // All 'en' tokens are in-vocabulary, all replacements are assumed in-vocabulary as they are user supplied.
    // const currentIVTokens = enTokens + replacementTokens.length;
    // console.log("currentIVTokens: ", currentIVTokens);

    // const currentOOVTokens =
    //   tokens.length + replacementTokens.length - currentIVTokens;

    // console.log("currentOOVTokens:", currentOOVTokens);

    // Empty strings are considered 'deleted'
    // const currentTokenCount =
    //   tokens.filter((t) => t !== "").length +
    //   replacementTokens.map((t) => t !== "").length;

    // const correctionsMade = replacementTokenIds.length;

    // Get users that have been invited to the project.

    const notifications = await Notifications.find({ projectId })
      .populate("receiverId")
      .lean();

    const projectAnnotatorIds = project.annotators.map((a) => a._id.toString());

    const invitedUsers = notifications
      .filter((n) => !projectAnnotatorIds.includes(n.receiverId._id.toString()))
      .map((n) => ({
        username: n.receiverId.username,
        status: n.status,
        _id: n.receiverId._id,
      }));

    const projectAnnotators = [
      ...project.annotators.map((a) => ({
        username: a.username,
        status: "accepted",
        _id: a._id,
      })),
      ...invitedUsers,
    ];

    // Get compiled texts
    const compiledTexts = await getCompiledTexts(projectId);

    console.log("compiledTexts: ", compiledTexts);

    const { vocabSize, tokenCount, correctionsMade } =
      getSummaryMetrics(compiledTexts);

    // GET project IAA
    const iaa = await getProjectIAA(projectId);

    res.json({
      isOwner,
      details: {
        _id: req.params.projectId,
        name: project.name,
        description: project.description,
        parallelCorpus: project.parallelCorpus,
        specialTokens: project.specialTokens,
        createdAt: project.createdAt,
        preprocessing: project.preprocessing,
        tags: project.tags,
        flags: project.flags,
        ownerUsername: userDetails[project.owner],
        annotators: projectAnnotators,
      },
      metrics: [
        {
          name: "Total Texts",
          value: project.texts.length,
          description: "Total number of texts within the project's corpus.",
        },
        {
          name: "Texts Annotated",
          value: projectSaveCount,
          description:
            "Number of texts where changes have been reviewed and saved by all annotators.",
        },
        {
          name: "Annotation Progress",
          value: progress,
          description:
            "Percentage of the project's texts that have been saved, indicating overall progress.",
        },
        {
          name: "Initial Vocabulary Size",
          value: project.metrics.startVocabSize,
          description:
            "The size of the vocabulary at the start of the project, before any annotations or normalisations.",
        },
        {
          name: "Adjusted Vocabulary Size",
          value: vocabSize,
          description:
            "The current size of the vocabulary after applying corrections and normalisations.",
        },
        {
          name: "Vocabulary Reduction Rate",
          value: `${Math.round(
            ((project.metrics.startVocabSize - vocabSize) /
              project.metrics.startVocabSize) *
              100
          )}%`,
          description:
            "Percentage reduction in vocabulary size from the start of the project to the current state.",
        },
        {
          name: "Initial Token Count",
          value: project.metrics.startTokenCount,
          description:
            "Total number of tokens across all texts at the project's outset.",
        },
        {
          name: "Current Token Count",
          value: tokenCount,
          description:
            "Current total number of tokens across all texts, reflecting any additions or deletions.",
        },
        {
          name: "Corrections Applied",
          value: correctionsMade,
          description:
            "Total number of corrections or normalisations applied to tokens throughout the project.",
        },
        // {
        //   name: "Unnormalised Tokens",
        //   value: currentOOVTokens,
        //   description:
        //     "Under review: Current number of out-of-vocabulary (OOV) tokens that have not yet been normalised or corrected.",
        // },
        {
          name: "Inter-Annotator Agreement",
          value: `${Math.round(iaa)}%`,
          description:
            "The consistency of annotations across different annotators. A higher percentage indicates greater agreement and reliability of the annotations.",
        },
        // {
        //   name: "Greatest Contributor",
        //   value: "TBD",
        //   description:
        //     "Under review: The annotator who has made the most contributions (annotations or corrections) to the project.",
        // },
      ],
      lists: {
        replacementHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching project summary:", error);
    res.status(500).send("Internal server error");
  }
});

/**
 * Add new flags to project, remove existing flags, update existing flags.
 * Deletes flag annotations for any removed existing flags that are used.
 */
router.patch("/:projectId/flags", projectManagementCheck, async (req, res) => {
  logger.info("Patching project flags", {
    route: "/api/project/flags",
    body: req.body,
  });

  try {
    const { projectId } = req.params;
    const { flags, isDelete } = req.body; //flags: [{name: '', _id: ''}, ...]

    // Retrieve the current project to get existing flags
    const project = await Project.findById(projectId, { flags: 1 });
    if (!project) return res.status(404).send("Project not found");

    if (isDelete) {
      // Flags to be deleted and associated annotations.
      // when isDelete is true, flags is just an array of one flag element.

      const [flag] = flags;
      const flagId = mongoose.Types.ObjectId(flag._id); // Ensure correct type for _id

      // Remove flag from project
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { flags: { _id: flagId } } },
        { new: true, fields: { flags: 1 } }
      );
      // Delete annotations for removed flags
      await Annotations.deleteMany({ value: flagId });

      res.json(updatedProject ? updatedProject.flags : []);
    } else {
      // Create/update
      let flagsToUpdate = project.flags; // Assuming this is an array

      // Process each incoming flag
      flags.forEach((flag) => {
        const flagIndex = flagsToUpdate.findIndex(
          (f) => f._id.toString() === flag._id
        );

        if (flagIndex > -1) {
          // Update existing flag
          flagsToUpdate[flagIndex].name = flag.name;
        } else {
          // Add new flag
          flagsToUpdate.push({
            name: flag.name,
            _id: new mongoose.Types.ObjectId(),
          });
        }
      });

      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $set: { flags: flagsToUpdate } },
        { new: true, fields: { flags: 1 } }
      );

      res.json(updatedProject ? updatedProject.flags : []);
    }
  } catch (error) {
    console.error("Error updating project flags:", error);
    res.status(500).send("Internal server error");
  }
});

/**
 * Remove single annotator for a given project
 */
router.patch("/annotator/remove", projectManagementCheck, async (req, res) => {
  try {
    const { annotatorId, projectId } = req.body;

    console.log(annotatorId, projectId);

    // Delete from 'project.annotators'
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $pull: { annotators: annotatorId },
      },
      { new: true } // Returns the document after update
    );

    // Delete any associated notification
    await Notifications.deleteMany({ projectId, receiverId: annotatorId });
    // Delete all annotations.
    await Annotations.deleteMany({ userId: annotatorId });

    res.json(project.annotators);
  } catch (error) {}
});

router.get(
  "/:projectId/adjudication/:page",
  projectAccessCheck,
  async (req, res) => {
    // Limit is 1 document at a time so only need page
    const DOCUMENT_LIMIT = 1;

    try {
      const { projectId, page } = req.params;
      const pageNumber = Math.max(1, parseInt(page)); // Ensure page is at least 1

      const textCount = await Text.count({ projectId });
      const skipCount = (pageNumber - 1) * DOCUMENT_LIMIT; // Calculate skip based on page number

      const textsWithUserAnnotations = await getTextsWithUserAnnotations(
        projectId,
        skipCount
      );

      const adjudicationData = textsWithUserAnnotations.map((text) => {
        let transformed = {
          _id: text.id, // Copy the id to _id
          input: text.sourceTokens, // Copy the sourceTokens directly
          annotations: {},
        };

        // Iterate through the users in the replacements to structure the annotations
        Object.keys(text.replacements).forEach((user) => {
          transformed.annotations[user] = {
            tags: text.tags[user] ? text.tags[user][1] : [], // Second element of tags array or an empty array if not exist
            tokens: text.replacements[user], // Use the tokens from replacements
            flags: text.flags[user] || [], // Copy flags, default to an empty array if not exist
          };
        });

        // GET IAA
        const [iaaScore, pairwiseScores, tokenAverages] = documentLevelIAA(
          transformed.annotations
        );

        const compiledTokens = compileTokens(
          transformed.annotations,
          transformed.input
        );

        console.log("compiledTokens: ", compiledTokens);

        transformed = {
          ...transformed,
          compiled: { tokens: compiledTokens },
          scores: {
            doc: iaaScore,
            pairwise: pairwiseScores,
            tokens: tokenAverages,
          },
        };

        return transformed;
      });

      res.json({ data: adjudicationData[0] || {}, count: textCount });
    } catch (error) {
      console.error("Error fetching adjudication data:", error); // Log or handle error as needed
      res.status(500).json({
        message: "Failed to get adjudication data",
        error: error.message,
      });
    }
  }
);

export default router;
