const express = require("express");
const router = express.Router();
const logger = require("../logger");
const { tokenGetUserId } = require("../utils/auth");
const Project = require("../models/Project");
const Resource = require("../models/Resource");
const Text = require("../models/Text");
const Token = require("../models/Token");
const projectUtils = require("../utils/project");
const User = require("../models/User");
const project = require("../utils/project");
const { createTokens } = require("../services/project");

const REPLACEMENT_COLOR = "#03a9f4";

router.post("/create", async (req, res) => {
  try {
    logger.info("Creating project", { route: "/api/project/create" });
    const userId = tokenGetUserId(req.headers["authorization"]);

    const isParallelCorpusProject = req.body.corpusType === "parallel";

    let mapSets = {};
    const enMap = await Resource.findOne({ type: "en" }).lean();
    mapSets["en"] = new Set(enMap.tokens);

    const rpMap = await Resource.create({
      type: "rp",
      replacements: req.body.replacementDictionary,
      color: REPLACEMENT_COLOR,
    });

    /**
     * Load English lexicon (map shared for all projects) and
     * create map sets used for pre-annotation of tokens
     */

    console.log("rpMap", rpMap);

    const mapResponse = await Resource.insertMany(req.body.tags);
    // const rpMap = mapResponse.filter((map) => map.type === "rp")[0]; // this should always be present in the maps

    // console.log("mapResponse", mapResponse);

    // Convert maps to Sets
    if (0 < mapResponse.length) {
      mapSets = Object.assign(
        ...mapResponse.map((map) => ({ [map.type]: new Set(map.tokens) }))
      ); // TODO: include construction of rp map instead of doing separately. use ternary.
    }

    // console.log("mapSets", mapSets);

    // Create object from array of replacement tokens
    // (this is done as Mongo cannot store keys with . or $ tokens)
    const rpObj = isParallelCorpusProject
      ? {}
      : rpMap.replacements.reduce(
          (obj, item) => ({ ...obj, [item.original]: item.normed }),
          {}
        );

    console.log("rpObj", rpObj);
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
      maps: mapResponse.map((map) => map._id),
    });
    project.save();

    console.log("base project created:", project);

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

      console.log("texts", texts);

      allTokens = texts.flatMap((text) => {
        return createTokens(
          project._id,
          text._id,
          text.original.split(" "),
          mapSets,
          rpObj,
          req.body.preannotationDigitsIV
        );
      });

      console.log("allTokens", allTokens);
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

      console.log("normalisedTexts", normalisedTexts);

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
        return createTokens(
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

    console.log("allTokensRes", allTokensRes);

    // Add texts and metrics to project
    project.texts = texts.map((text) => text._id);

    const textTokens = texts.flatMap((text) => text.original.split(" "));
    project.metrics.startTokenCount = textTokens.length;
    project.metrics.startVocabSize = new Set(allTokens).size;

    const candidateTokens = allTokensRes
      .filter(
        (token) =>
          Object.values(token.tags).filter((tagBool) => tagBool).length === 0 &&
          !token.replacement
      )
      .map((token) => token.value);
    project.metrics.startCandidateVocabSize = candidateTokens.length;
    project.save();

    console.log("project with metrics", project);

    // Update texts with tokens
    const textUpdateObjs = texts.flatMap((text) => ({
      updateOne: {
        filter: { _id: text._id },
        update: {
          tokens: allTokensRes
            .filter((token) => token.textId === text._id)
            .map((token) => ({ index: token.index, token: token._id })),
        },
        options: { new: true },
      },
    }));
    await Text.bulkWrite(textUpdateObjs);

    /**
     * Calculate mean, masked, TF-IDF for each text
     */
    // Compute average document tf-idf
    // - 1. get set of candidate tokens (derived up-stream)
    // - 2. filter texts for only candidate tokens
    // - 3. compute filtered text average tf-idf score/weight
    const tfidfs = projectUtils.calculateTFIDF(texts); // Token tf-idfs

    const candidateTokensUnique = new Set(candidateTokens);
    console.log("candidateTokensUnique", candidateTokensUnique);

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

          console.log(project);

          return {
            _id: project._id,
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
    const updatedProject = await Project.updateOne(
      { _id: req.body.projectId, user: userId },
      { $set: { title: req.body.title } }
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
    const response = await Project.findOne(
      {
        _id: req.params.projectId,
        user: userId,
      },
      { texts: 0 }
    ).lean();
    res.json(response);
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

// Get count of tokens and saved text for a single project
router.get("/counts/:projectId", async (req, res) => {
  // utils.authenicateToken,
  try {
    logger.info("Get project token counts", {
      route: `/api/project/counts/${req.params.projectId}`,
    });
    const textRes = await Text.find({ projectId: req.params.projectId })
      .populate("tokens.token")
      .lean();

    const uniqueTokens = new Set(
      textRes
        .map((text) =>
          text.tokens.map((token) =>
            token.token.replacement
              ? token.token.replacement
              : token.token.value
          )
        )
        .flat()
    );

    // Unlike on project creation, the other meta-tags need to be checked such as removed, noise, etc.
    const allTokens = textRes
      .map((text) => text.tokens.map((token) => token.token))
      .flat();
    const candidateTokens = allTokens
      .filter(
        (token) =>
          Object.values(token.tags).filter((tagBool) => tagBool).length === 0 &&
          !token.replacement
      )
      .map((token) => token.value);
    logger.info("vocab counts", {
      vocab_size: uniqueTokens.size,
      candidateTokens: candidateTokens.length,
    });

    // Get saved text counts
    logger.info("Getting project text annotation progress", {
      route: `/api/project/counts/${req.params.projectId}`,
    });
    const textsSaved = textRes.filter((text) => text.saved).length;
    const textsTotal = textRes.length;
    logger.info("annotation progress", { text_saved: textsSaved });

    res.json({
      token: {
        vocab_size: uniqueTokens.size,
        oov_tokens: candidateTokens.length,
      },
      text: {
        saved: textsSaved,
        total: textsTotal,
      },
    });
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to get project token counts", {
      route: `/api/project/counts/${req.params.projectId}`,
    });
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
        detail: `${vocabSize} / ${project.metrics.starting_vocab_size}`,
        value: `${Math.round(
          (1 - vocabSize / project.metrics.starting_vocab_size) * 100
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

router.post("/download/result", async (req, res) => {
  // utils.authenicateToken,
  // Download normalisation results as seq2seq or tokenclf
  try {
    logger.info("Downloading project results", {
      route: "/api/project/download/result",
    });
    let texts;

    if (req.body.preview) {
      if (req.body.saved) {
        texts = await Text.find({
          projectId: req.body.projectId,
          saved: req.body.saved,
        })
          .limit(10)
          .populate("tokens.token")
          .lean();
      } else {
        texts = await Text.find({ projectId: req.body.projectId })
          .limit(10)
          .populate("tokens.token")
          .lean();
      }
    } else {
      if (req.body.saved) {
        texts = await Text.find({
          projectId: req.body.projectId,
          saved: req.body.saved,
        })
          .populate("tokens.token")
          .lean();
      } else {
        texts = await Text.find({ projectId: req.body.projectId })
          .populate("tokens.token")
          .lean();
      }
    }

    let count;

    if (req.body.saved) {
      count = await Text.count({
        projectId: req.body.projectId,
        saved: req.body.saved,
      });
    } else {
      count = await Text.count({ projectId: req.body.projectId });
    }

    if (req.body.type === "seq2seq") {
      const results = texts.map((text) => ({
        tid: text._id,
        identifiers: text.identifiers,
        input: text.original.split(" "),
        output: text.tokens
          .map((tokenInfo) =>
            tokenInfo.token.replacement
              ? tokenInfo.token.replacement.split(" ")
              : tokenInfo.token.value
          )
          .flat(),
        class: text.tokens
          .map((tokenInfo, index) => {
            if (
              tokenInfo.token.replacement &&
              tokenInfo.token.replacement.split(" ").length > 1
            ) {
              const tokenCount = tokenInfo.token.replacement.split(" ").length;

              return Array(tokenCount).fill(text.tokens[index].token.tags);
            } else {
              return tokenInfo.token.tags;
            }
          })
          .flat(),
      }));

      res.json({ results: results, count: count });
    } else if (req.body.type === "tokenclf") {
      // Use tokenization history to format output as n:n
      const results = texts.map((text) => {
        const tokenizationHist = text.tokenization_hist;
        if (tokenizationHist.length > 0) {
          const oTextTokenLen = text.original.split(" ").length;
          const tokenizationHistObj = Object.assign(...tokenizationHist);
          let output = text.tokens.map((tokenInfo, index) => {
            return tokenInfo.token.replacement
              ? tokenInfo.token.replacement
              : tokenInfo.token.value;
          });
          let metaTags = text.tokens.map((tokenInfo) => tokenInfo.token.tags);
          // Add white space (and empty metaTags)
          Object.keys(tokenizationHistObj)
            .slice()
            .reverse()
            .map((val) => {
              const numWS = tokenizationHistObj[val].length - 1;
              // add white space
              const indexWS = tokenizationHistObj[val][1].index;
              const ws = Array(numWS).fill(" ");
              // add empty meta tag dicts
              const mtDicts = Array(numWS).fill({});
              if (indexWS > output.length - 1) {
                // minus 1 to account for 0 indexing
                // Extend array (ws at the end)
                output = [...output, ...ws];
                metaTags = [...metaTags, ...mtDicts];
              } else {
                // Otherwise insert
                output.splice(indexWS, 0, ...ws);
                metaTags.splice(indexWS, 0, ...mtDicts);
              }
            });
          return {
            tid: text._id,
            identifiers: text.identifiers,
            input: text.original.split(" "),
            output: output,
            class: metaTags,
          };
        }

        return {
          tid: text._id,
          input: text.original.split(" "),
          output: text.tokens.map((tokenInfo) =>
            tokenInfo.token.replacement
              ? tokenInfo.token.replacement
              : tokenInfo.token.value
          ),
          class: text.tokens.map((tokenInfo) => tokenInfo.token.tags),
        };
      });
      res.json({ results: results, count: count });
    } else {
      // Error invalid type...
      res.sendStatus(500);
    }
  } catch (err) {
    res.json({ message: err });
    logger.error("Failed to download project results", {
      route: "/api/project/download/result",
    });
  }
});

// Download tokenization history across project
router.post(
  "/download/tokenizations",

  async (req, res) => {
    // utils.authenicateToken,
    try {
      const response = await Text.find({ projectId: req.body.projectId })
        .populate("tokens.token")
        .lean();

      // Reduce all of the tokenization histories
      let tHist = response
        .filter((text) => text.tokenization_hist.length > 0)
        .map((text) => {
          const histObj = Object.assign(...text.tokenization_hist);
          const history = Object.keys(histObj).map((key) => ({
            token: histObj[key]
              .map((tokenInfo) => tokenInfo.info.value)
              .join(""),
            pieces: histObj[key].map((tokenInfo) => tokenInfo.info.value),
          }));
          return {
            _id: text._id,
            history: history,
          };
        });

      if (req.body.preview) {
        tHist = tHist.slice(0, 10);
      }

      res.json(tHist);
    } catch (err) {
      res.json({ message: err });
    }
  }
);

module.exports = router;
