const express = require("express");
const router = express.Router();
const logger = require("../logger");
const { tokenGetUserId } = require("../utils/auth");
const Project = require("../models/Project");
const Resource = require("../models/Resource");
const Text = require("../models/Text");
const Token = require("../models/Token");
const projectUtils = require("../utils/project");
const project = require("../utils/project");
const { createAnnotatedTokens } = require("../services/project");
const { normaliseSpecialTokens } = require("../utils/project");
const {
  getReplacementFrequencies,
  formatOutputTexts,
} = require("../utils/download");

const REPLACEMENT_COLOR = "#03a9f4";

router.post("/create", async (req, res) => {
  try {
    logger.info("Creating project", { route: "/api/project/create" });
    const userId = tokenGetUserId(req.headers["authorization"]);

    const isParallelCorpusProject = req.body.corpusType === "parallel";
    const tags = req.body.tags;
    console.log("tags: ", tags);

    let mapSets = {};
    const enMap = await Resource.findOne({ type: "en" }).lean();
    console.log(`loaded en map with ${enMap.tokens.length} tokens`);
    mapSets["en"] = new Set(enMap.tokens);

    let specialTokens = req.body.specialTokens.trim();
    if (specialTokens) {
      // Add special tokens to en map set
      specialTokens = normaliseSpecialTokens(specialTokens);
      specialTokens.forEach((st) => mapSets["en"].add(st));
    } else {
      console.log("No special tokens provided or special tokens are empty.");
    }

    // replacementDictionary

    const rpMap = await Resource.create({
      type: "rp",
      replacements: req.body.replacementDictionary,
      color: REPLACEMENT_COLOR,
    });
    console.log("rpMap", rpMap);

    /**
     * Load English lexicon (map shared for all projects) and
     * create map sets used for pre-annotation of tokens
     */

    const mapResponse = await Resource.insertMany(
      tags.map((t) => ({ ...t, type: t.name }))
    );
    // const rpMap = mapResponse.filter((map) => map.type === "rp")[0]; // this should always be present in the maps

    console.log("mapResponse: ", mapResponse);

    // Convert maps to Sets
    if (0 < mapResponse.length) {
      // mapSets = Object.assign(
      //   ...mapResponse.map((map) => ({ [map.type]: new Set(map.tokens) }))
      // ); // TODO: include construction of rp map instead of doing separately. use ternary.

      const newMapSets = mapResponse.reduce((acc, map) => {
        // acc[map.type] = new Set(map.tokens);
        acc[map._id] = new Set(map.tokens);
        return acc;
      }, {});

      // Merge newMapSets with existing mapSets, preserving the 'en' map set
      mapSets = { ...mapSets, ...newMapSets };
    }

    // console.log("mapSets", mapSets);
    logger.info("[CREATE PROJECT] resources created");

    // Create object from array of replacement tokens
    // (this is done as Mongo cannot store keys with . or $ tokens)
    const rpObj = isParallelCorpusProject
      ? {}
      : rpMap.replacements.reduce(
          (obj, item) => ({ ...obj, [item.original]: item.normed }),
          {}
        );

    // console.log("rpObj", rpObj);
    mapSets["rp"] = new Set(Object.keys(rpObj));

    console.log("mapSets", Object.keys(mapSets));

    // Create base project
    const project = new Project({
      user: userId,
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
      maps: [...mapResponse.map((map) => map._id), rpMap._id],
      tags: req.body.tags.map((t) => ({ name: t.name, color: t.color })),
    });

    if (specialTokens) {
      // Add special tokens array to project
      project.specialTokens = specialTokens;
    }

    project.save();

    logger.info("[CREATE PROJECT] base project created");

    // console.log("base project created:", project);

    let textObjs;
    let texts;
    let allTokens;

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

      // console.log("textObjs", textObjs);
      texts = await Text.insertMany(
        textObjs.map((obj) => ({ ...obj, projectId: project._id }))
      );

      // console.log("texts", texts);

      allTokens = texts.flatMap((text) => {
        return createAnnotatedTokens(
          project._id,
          text._id,
          text.original.split(" "),
          mapSets,
          rpObj,
          req.body.preannotationDigitsIV
        );
      });

      // console.log("allTokens", allTokens);
    } else {
      // Process texts they are an Object {id:text}. For users who did not select texts with ids, the id is a placeholder.
      const normalisedTexts = Object.assign(
        {},
        ...Object.keys(req.body.corpus).map((textId) => {
          let text = req.body.corpus[textId];
          text = projectUtils.removeTabs(text);
          text = projectUtils.removeCasing(req.body.preprocessLowerCase, text);
          text = projectUtils.removeSpecialChars(
            req.body.preprocessRemoveCharSet,
            text
          );
          text = projectUtils.removeWhiteSpace(text);
          return { [textId]: text };
        })
      );

      // console.log("normalisedTexts", normalisedTexts);

      // Duplication removal
      const filteredTexts = projectUtils.removeDuplicates(
        req.body.preprocessRemoveDuplicates,
        normalisedTexts
      );

      // Create base texts
      textObjs = filteredTexts.map((obj) => {
        return {
          original: obj.text,
          weight: 0,
          rank: 0,
          saved: false,
          identifiers: obj.ids,
        };
      });

      texts = await Text.insertMany(
        textObjs.map((obj) => ({ ...obj, projectId: project._id }))
      );

      allTokens = texts.flatMap((text) => {
        return createAnnotatedTokens(
          project._id,
          text._id,
          text.original.split(" "),
          mapSets,
          rpObj,
          req.body.preannotationDigitsIV
        );
      });
    }

    const allTokensRes = await Token.insertMany(allTokens);

    logger.info("[CREATE PROJECT] text and tokens added to database");

    // console.log("allTokensRes", allTokensRes);

    // Add texts and metrics to project
    project.texts = texts.map((text) => text._id);

    const textTokens = texts.flatMap((text) => text.original.split(" "));
    project.metrics.startTokenCount = textTokens.length;
    project.metrics.startVocabSize = new Set(textTokens).size;

    const candidateTokens = allTokensRes
      .filter(
        (token) =>
          Object.values(token.tags).filter((tagBool) => tagBool).length === 0 &&
          !token.replacement
      )
      .map((token) => token.value);
    project.metrics.startCandidateVocabSize = candidateTokens.length;
    project.save();

    logger.info("[CREATE PROJECT] base metrics added to project");

    // console.log("project with metrics", project);

    // Update texts with tokens
    // First create a map over tokens
    const textTokenIds = allTokensRes.reduce((value, object) => {
      if (value[object.textId]) {
        value[object.textId].push({
          index: object.index,
          token: object._id.toString(),
        });
      } else {
        value[object.textId] = [
          { index: object.index, token: object._id.toString() },
        ];
      }
      return value;
    }, {});

    // console.log("textTokenIds", textTokenIds);
    const textUpdateObjs = texts.flatMap((text) => ({
      updateOne: {
        filter: { _id: text._id },
        update: {
          tokens: textTokenIds[text._id],
          // allTokensRes
          //   .filter((token) => token.textId === text._id)
          //   .map((token) => ({ index: token.index, token: token._id })),
        },
        options: { new: true },
      },
    }));
    await Text.bulkWrite(textUpdateObjs);

    logger.info("[CREATE PROJECT] tokens added to texts");

    /**
     * Calculate mean, masked, TF-IDF for each text
     */
    // Compute average document tf-idf
    // - 1. get set of candidate tokens (derived up-stream)
    // - 2. filter texts for only candidate tokens
    // - 3. compute filtered text average tf-idf score/weight
    const tfidfs = projectUtils.calculateTFIDF(texts); // Token tf-idfs

    logger.info("[CREATE PROJECT] calculated inverse TF-IDF scores");

    const candidateTokensUnique = new Set(candidateTokens);
    // console.log("candidateTokensUnique", candidateTokensUnique);

    // Fetch texts and populate tokens (they aren't returned from the bulkInsert); TODO: Find better method.
    texts = await Text.find({ projectId: project._id })
      .populate({
        path: "tokens.token",
        select: { _id: 1, value: 1 },
      })
      .lean();

    //  Calculate mean, weighted, tf-idfs scores (TODO: Review values)
    texts = texts.map((text) => {
      const tokenWeights = text.original
        .split(" ")
        .filter((token) => candidateTokensUnique.has(token))
        .map((token) => tfidfs[token]);

      const textWeight =
        tokenWeights.length > 0 ? tokenWeights.reduce((a, b) => a + b) : -1;

      return {
        ...text,
        weight: textWeight,
      };
    });

    // Rank texts by their weight
    texts = texts
      .sort((a, b) => b.weight - a.weight)
      .map((text, index) => ({ ...text, rank: index }));

    // Add weight and rank to text objects
    const weightedTextUpdateObjs = texts.map((text) => ({
      updateOne: {
        filter: { _id: text._id },
        update: { weight: text.weight, rank: text.rank },
        options: { upsert: true },
      },
    }));
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
  // utils.authenicateToken,
  try {
    logger.info("Fetching all projects", { route: "/api/project/" });
    const userId = tokenGetUserId(req.headers["authorization"]);
    const projects = await Project.find({ user: userId }, { texts: 0 }).lean();

    res.json(projects);
  } catch (error) {
    logger.error("Failed to fetch all projects", { route: "/api/project/" });
    console.log(`error ${error}`);
    res.status(500).send({ detail: error });
  }
});

router.get("/feed", async (req, res) => {
  // utils.authenicateToken,
  // logger.info("Fetching project feed", { route: "/api/project/feed" });

  try {
    const userId = tokenGetUserId(req.headers["authorization"]);
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

router.patch("/", async (req, res) => {
  // utils.authenicateToken,
  try {
    logger.info("Updating single project", { route: "/api/project/" });
    const userId = tokenGetUserId(req.headers["authorization"]);

    // Create an object for the fields to update
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.description) updateFields.description = req.body.description;

    const updatedProject = await Project.updateOne(
      { _id: req.body.projectId, user: userId },
      { $set: updateFields }
    );
    res.json(updatedProject);
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to update single project", { route: "/api/project/" });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    logger.info("Fetching single project", {
      route: `/api/project/${req.params.projectId}`,
    });
    const userId = tokenGetUserId(req.headers["authorization"]);
    const project = await Project.findOne(
      {
        _id: req.params.projectId,
        user: userId,
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

router.delete("/:projectId", async (req, res) => {
  try {
    logger.info("Deleting project", { route: "/api/project/" });
    const userId = tokenGetUserId(req.headers["authorization"]);

    const project = await Project.findOne(
      {
        _id: req.params.projectId,
        user: userId,
      },
      { maps: 1 }
    ).lean();

    console.log(project.maps);

    await Project.deleteOne({ _id: req.params.projectId });
    await Text.deleteMany({ projectId: req.params.projectId });
    await Token.deleteMany({ projectId: req.params.projectId });
    await Resource.deleteMany({ _id: project.maps });
    res.json("Successfully deleted project.");
  } catch (error) {
    logger.error(`Failed to delete project - ${error}`, {
      route: "/api/project/",
    });
    res.json({ details: error });
  }
});

router.get("/progress/:projectId", async (req, res) => {
  try {
    const totalTexts = await Text.count({ projectId: req.params.projectId });
    const savedTexts = await Text.count({
      projectId: req.params.projectId,
      saved: true,
    });

    res.json({
      progress: {
        value: Math.round((savedTexts / totalTexts) * 100),
        title: `${savedTexts}/${totalTexts}`,
      },
    });
  } catch (error) {
    console.log(`Error: ${error}`);
    res.json({ details: error });
  }
});

// Get metrics that are used in the sidebar for a single project
router.get("/metrics/:projectId", async (req, res) => {
  // utils.authenicateToken,
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

router.get("/download/:projectId", async (req, res) => {
  /**
   * TODO: Adapt output to accommodate token classification format - see:
   * LexiClean v1 route https://github.com/nlp-tlp/lexiclean/blob/main/server/routes/project/download.js
   */
  try {
    logger.info("Downloading project results", {
      route: "/api/project/download/:projectId",
    });

    const project = await Project.findById(
      {
        _id: req.params.projectId,
      },
      { _id: 0, user: 0, texts: 0, maps: 0, __v: 0, updatedAt: 0 }
    ).lean();

    const texts = await Text.find(
      { projectId: req.params.projectId },
      { _id: 0, projectId: 0, weight: 0, rank: 0 }
    )
      .populate("tokens.token")
      .lean();

    // TODO: Reduce all of the tokenization histories
    // let tokenizationHistories = response
    //   .filter((text) => text.tokenizationHistory.length > 0)
    //   .map((text) => {
    //     const histObj = Object.assign(...text.tokenizationHistory);
    //     const history = Object.keys(histObj).map((key) => ({
    //       token: histObj[key].map((tokenInfo) => tokenInfo.info.value).join(""),
    //       pieces: histObj[key].map((tokenInfo) => tokenInfo.info.value),
    //     }));
    //     return {
    //       _id: text._id,
    //       history: history,
    //     };
    //   });

    res.json({
      metadata: { ...project, totalTexts: texts.length },
      texts: formatOutputTexts(texts),
      resources: {},
      tokenizations: [], //tokenizationHistories
      replacements: getReplacementFrequencies(texts),
    });
  } catch (error) {
    console.log(`Error: ${error}`);
    res.json({ details: error });
  }
});

router.get("/summary/:projectId", async (req, res) => {
  const userId = tokenGetUserId(req.headers["authorization"]);
  const [project] = await Project.find({
    _id: req.params.projectId,
    user: userId,
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

  const texts = await Text.find(
    { projectId: req.params.projectId },
    { _id: 0, projectId: 0, weight: 0, rank: 0 }
  )
    .populate("tokens.token")
    .lean();

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
      mostFrequentReplacements: getReplacementFrequencies(texts, 50),
    },
  });
});

module.exports = router;
