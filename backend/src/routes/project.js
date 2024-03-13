import express from "express";
import logger from "../logger/index.js";
import Project from "../models/Project.js";
import Resource from "../models/Resource.js";
import Text from "../models/Text.js";
import Token from "../models/Token.js";
import {
  removeTabs,
  removeCasing,
  removeSpecialChars,
  removeWhiteSpace,
  removeDuplicates,
  calculateTFIDF,
} from "../utils/project.js";
import { normaliseSpecialTokens } from "../utils/project.js";
import {
  getReplacementFrequencies,
  formatOutputTexts,
} from "../utils/download.js";
import Annotations from "../models/Annotations.js";
import mongoose from "mongoose";
import {
  projectAccessCheck,
  projectManagementCheck,
} from "../middleware/auth.js";

const router = express.Router();
const REPLACEMENT_COLOR = "#03a9f4";

router.post("/create", async (req, res) => {
  logger.info("Creating project", { route: "/api/project/create" });
  try {
    const userId = req.userId;
    console.log("userId: ", userId);

    const isParallelCorpusProject = req.body.corpusType === "parallel";
    const tags = req.body.tags;
    console.log("tags: ", tags);

    /**
     * Load English lexicon (map shared for all projects) and
     * create map sets used for pre-annotation of tokens
     */
    let enMap = await Resource.findOne({ type: "en" });
    console.log(enMap._id);
    const enMapId = enMap._id;
    console.log(`loaded en map with ${enMap.tokens.length} tokens`);
    enMap = new Set(enMap.tokens);

    let specialTokens = req.body.specialTokens.trim();
    if (specialTokens) {
      // Add special tokens to in-vocabulary English map. These will be considered in-vocabulary.
      specialTokens = normaliseSpecialTokens(specialTokens);
      specialTokens.forEach((st) => enMap.add(st));
    } else {
      console.log("No special tokens provided or special tokens are empty.");
    }

    // Create resource for `replacementDictionary`
    const rpMap = await Resource.create({
      type: "rp",
      replacements: req.body.replacementDictionary,
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
      name: req.body.projectName,
      description: req.body.projectDescription,
      parallelCorpus: isParallelCorpusProject,
      preprocessing: {
        removeLowerCase: isParallelCorpusProject
          ? false
          : req.body.preprocessLowerCase,
        removeDuplicates: isParallelCorpusProject
          ? false
          : req.body.preprocessRemoveDuplicates,
        digitsIV: isParallelCorpusProject
          ? false
          : req.body.preannotationDigitsIV,
        removeChars: isParallelCorpusProject
          ? false
          : req.body.preprocessRemoveChars,
      },
      maps: [enMapId, rpMap._id, ...Object.keys(tagSets)], // Maps are those that are mapped to a fixed system voacb, user-supplied replacement dictionary, and tags which optionally have tokens/data..
      tags: tagResponse.map((t) => ({
        _id: t._id,
        name: t.type,
        color: t.color,
      })), // This is the schema for entity-label tagging.
      flags: req.body.flags.map((f) => ({
        name: f,
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

    if (req.body.corpusType === "parallel") {
      // User uploads source and target texts; for MT sequence data tokens have no history (original value)
      // TODO: allow users to upload aligned sequences (token clf style) that adds tokens history.

      // corpus: `id: {source: '', target: '', id; ''}`

      // `original` is the source
      // `tokens` are from the target

      // Create base texts
      textObjs = Object.keys(req.body.corpus).map((textId) => {
        return {
          original: req.body.corpus[textId].target,
          reference: req.body.corpus[textId].source,
          weight: 0,
          rank: 0,
          saved: false,
          identifiers: [textId], // No preprocessing, so duplicates cannot have ids merged.
        };
      });

      texts = await Text.insertMany(
        textObjs.map((obj) => ({ ...obj, projectId: project._id }))
      );
    } else {
      // Process texts they are an Object {id:text}. For users who did not select texts with ids, the id is a placeholder.
      const normalisedTexts = Object.assign(
        {},
        ...Object.keys(req.body.corpus).map((textId) => {
          let text = req.body.corpus[textId];
          text = removeTabs(text);
          text = removeCasing(req.body.preprocessLowerCase, text);
          text = removeSpecialChars(req.body.preprocessRemoveCharSet, text);
          text = removeWhiteSpace(text);
          return { [textId]: text };
        })
      );

      // console.log("normalisedTexts", normalisedTexts);

      // Duplication removal
      const filteredTexts = removeDuplicates(
        req.body.preprocessRemoveDuplicates,
        normalisedTexts
      );

      function checkIsDigit({ annotateDigits, token }) {
        return annotateDigits && /^\d+$/g.test(token);
      }

      // Create base texts, get list of tokens in project, and their associated annotations.

      textObjs = filteredTexts.map((obj, textIndex) => {
        // Create tokens for the current text
        const tokens = obj.text.split(" ").map((value, index) => {
          // Check whether token is in English vocabulary
          const tokenIV = enMap.has(value)
            ? true
            : checkIsDigit({
                annotateDigits: req.body.preannotationDigitsIV,
                token: value,
              });

          if (!tokenIV) {
            candidateTokens.push(value);
          }

          // TODO: update req.body to other object.
          const tokenHasReplacement =
            req.body.replacementDictionary[value] || false;
          if (tokenHasReplacement) {
            candidateTokens.push(value);
            allAnnotations.push({
              type: "replacement",
              userId: userId,
              value: req.body.replacementDictionary[value],
              tokenIndex: index,
              textIndex: textIndex,
            });
          }

          // TODO: Do something with tag dictionaries here to create tags...
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
    const projects = await Project.find({ owner: userId }, { texts: 0 }).lean();

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

    if (userId) {
      const projects = await Project.find({ user: userId }).lean();

      const feedInfo = await Promise.all(
        projects.map(async (project) => {
          const allTokens = null;
          const savedTexts = await Text.count({
            projectId: project._id,
            saved: true,
          });
          const tokens = await Token.find({ projectId: project._id }).lean();

          const uniqueTokens = new Set(
            tokens
              .map((token) =>
                token.replacement ? token.replacement : token.value
              )
              .flat()
          ).size;

          const currentOOVTokens = tokens
            .filter(
              (token) =>
                Object.values(token.tags).filter((tagBool) => tagBool)
                  .length === 0 && !token.replacement
            )
            .map((token) => token.value).length;

          // console.log(project);

          return {
            _id: project._id,
            isParallelCorpusProject: project.parallelCorpus,
            name: project.name,
            description: project.description,
            startCandidateVocabSize: project.metrics.startCandidateVocabSize,
            startVocabSize: project.metrics.startVocabSize,
            startTokenCount: project.startTokenCount,
            textCount: project.texts.length,
            savedCount: savedTexts,
            vocabReduction:
              ((project.metrics.startVocabSize - uniqueTokens) /
                project.metrics.startVocabSize) *
              100,
            oovCorrections: currentOOVTokens,
            createdAt: project.createdAt,
          };
        })
      );

      res.json(feedInfo);
    } else {
      res.json({ message: "token invalid" });
      logger.error("Failed to fetch project feed - token invalid", {
        route: "/api/project/feed",
      });
    }
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

/**
 * TODO: Handle multi-user scenario.
 */
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
    const project = await Project.findById({
      _id: req.params.projectId,
    }).lean();
    const textsTotal = await Text.count({ projectId: req.params.projectId });
    const textsSaved = await Text.count({
      projectId: req.params.projectId,
      saved: true,
    });
    const tokens = await Token.find({
      projectId: req.params.projectId,
    }).lean();

    // Capture the number of tokens that exist in the original values or
    // introduced through replacements (if a token has one)
    const vocabSize = new Set(
      tokens.map((token) =>
        token.replacement ? token.replacement : token.value
      )
    ).size;

    // Capture the number of tokens that are OOV e.g. have no meta-tags that are true
    // including English and do not have a current replacement.
    const oovTokenLength = tokens
      .filter(
        (token) =>
          Object.values(token.tags).filter((tagBool) => tagBool).length === 0 &&
          !token.replacement
      )
      .map((token) => token.value).length;

    const payload = [
      {
        description: "Texts Annotated",
        detail: `${textsSaved} / ${textsTotal}`,
        value: `${Math.round((textsSaved * 100) / textsTotal)}%`,
        title: "Texts that have had classifications or replacements.",
      },
      {
        description: "Vocabulary Reduction",
        detail: `${vocabSize} / ${project.metrics.startVocabSize}`,
        value: `${Math.round(
          (1 - vocabSize / project.metrics.startVocabSize) * 100
        )}%`,
        title:
          "Comparison between of current vocabulary and starting vocabulary",
      },
      {
        description: "Vocabulary Corrections",
        detail: `${
          project.metrics.startCandidateVocabSize - oovTokenLength
        } / ${project.metrics.startCandidateVocabSize}`,
        value: `${Math.round(
          ((project.metrics.startCandidateVocabSize - oovTokenLength) * 100) /
            project.metrics.startCandidateVocabSize
        )}%`,
        title:
          "Sum of all outstanding out-of-vocabulary tokens. All tokens replaced and/or classified with meta-tags are captured",
      },
    ];

    res.json(payload);
  } catch (err) {
    res.json({ message: err });
  }
});

/**
 * TODO: Adapt output to accommodate token classification format - see:
 * LexiClean v1 route https://github.com/nlp-tlp/lexiclean/blob/main/server/routes/project/download.js
 *
 * Currently limited to a single users own annotations.
 */
router.get("/download/:projectId", projectAccessCheck, async (req, res) => {
  logger.info("Downloading project results", {
    route: "/api/project/download/:projectId",
  });
  try {
    const userId = req.userId;
    const { projectId } = req.params;

    const project = await Project.findById(
      {
        _id: projectId,
      },
      { _id: 0, owner: 0, maps: 0, __v: 0, updatedAt: 0 }
    ).lean();

    const textIds = project.texts;
    console.log("textIds: ", textIds);

    delete project.texts;

    const annotations = await Annotations.find({
      userId,
      textId: { $in: textIds },
    }).lean();

    res.json({
      metadata: { ...project, totalTexts: textIds.length },
      annotations,
      // texts: formatOutputTexts(texts),
      // resources: {},
      // replacements: getReplacementFrequencies(texts),
    });
  } catch (error) {
    console.log(`Error: ${error}`);
    res.json({ details: error });
  }
});

/**
 * Fetch project summary for client dashboard.
 */
router.get("/summary/:projectId", projectAccessCheck, async (req, res) => {
  const [project] = await Project.find({
    _id: req.params.projectId,
  }).lean();

  const savedTexts = await Text.count({
    projectId: req.params.projectId,
    saved: true,
  });

  const currTokens = await Token.find({
    projectId: req.params.projectId,
  }).lean();

  const currVocab = new Set(
    currTokens
      .map((token) => (token.replacement ? token.replacement : token.value))
      .flat()
  ).size;

  const currentOOVTokens = currTokens
    .filter(
      (token) =>
        Object.values(token.tags).filter((tagBool) => tagBool).length === 0 &&
        !token.replacement
    )
    .map((token) => token.value).length;

  res.json({
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
    },
    metrics: [
      { name: "Project Texts", value: project.texts.length },
      { name: "Saved Texts", value: savedTexts },
      {
        name: "Progress",
        value: Math.round((savedTexts / project.texts.length) * 100),
      },
      {
        name: "Starting Vocabulary Size",
        value: project.metrics.startVocabSize,
      },
      { name: "Current Vocabulary Size", value: currVocab },
      {
        name: "Vocabulary Reduction",
        value: Math.round(
          ((project.metrics.startVocabSize - currVocab) /
            project.metrics.startVocabSize) *
            100
        ),
      },
      { name: "Starting Token Count", value: project.metrics.startTokenCount },
      { name: "Current Token Count", value: currTokens.length },
      { name: "Corrections Made", value: currentOOVTokens },
    ],
    lists: {
      mostFrequentWords: {},
      mostFrequentReplacements: {}, //getReplacementFrequencies(texts, 50),
    },
  });
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
    const { flags } = req.body;

    // Separate incoming flags into categories: new, updated, and to determine removed
    const newFlags = flags
      .filter((flag) => typeof flag === "string")
      .map((name) => ({ name }));
    const updatedFlags = flags.filter(
      (flag) => typeof flag === "object" && flag._id
    );

    // Retrieve the current project to get existing flags
    const project = await Project.findById(projectId, { flags: 1 });
    if (!project) return res.status(404).send("Project not found");

    // Determine which existing flags were not mentioned in the update and hence are to be removed
    const removedFlagIds = project.flags
      .filter(
        (oldFlag) =>
          !updatedFlags.some(
            (newFlag) =>
              newFlag._id && newFlag._id.toString() === oldFlag._id.toString()
          )
      )
      .map((flag) => flag._id);

    // Prepare the flags for database update: combine updated flags with new flags
    const flagsToUpdate = [...updatedFlags, ...newFlags];

    // Update the project with combined updated and new flags, removing the old ones and return the updated document
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: { flags: flagsToUpdate } },
      { new: true, fields: { flags: 1 } } // Return the updated document with only flags field
    );

    if (!updatedProject) return res.status(404).send("Project not found");

    if (removedFlagIds.length > 0) {
      await Annotations.deleteMany({ value: { $in: removedFlagIds } });
    }

    res.json(updatedProject.flags);
  } catch (error) {
    console.error("Error updating project flags:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
