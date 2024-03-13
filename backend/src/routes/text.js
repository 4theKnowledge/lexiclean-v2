import express from "express";
import logger from "../logger/index.js";
import Text from "../models/Text.js";
import Token from "../models/Token.js";
import Project from "../models/Project.js";
import Resource from "../models/Resource.js";
import Annotations from "../models/Annotations.js";
import {
  formatTextOutput,
  filterTextsBySearchTerm,
  processAnnotations,
} from "../utils/text.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Filters project texts for client pagination.
 * TODO: limit the texts based on the user being the `user` on the project or in the projects `annotators` array.
 */
router.post("/filter", async (req, res) => {
  logger.info("Paginating texts.", {
    route: `/api/text/filter`,
    body: req.body,
  });

  try {
    const userId = req.userId;

    const skip = parseInt((req.query.page - 1) * req.query.limit);
    const limit = parseInt(req.query.limit);
    const rank = req.body.filters.rank;

    const saveState = req.body.filters.saved || "all";
    const searchTerm = req.body.filters.searchTerm || "";
    const referenceSearchTerm = req.body.filters.referenceSearchTerm || "";
    const hasReferenceSearchTerm = referenceSearchTerm !== "";

    // Find textIds from reference search term matches
    let referenceTextIds;
    if (hasReferenceSearchTerm) {
      referenceTextIds = await Text.find(
        {
          projectId: req.body.projectId,
          reference: {
            $regex: referenceSearchTerm.replace(
              /[-\/\\^$*+?.()|[\]{}]/g,
              "\\$&"
            ),
            $options: "i",
          },
        },
        { _id: 1 }
      ).lean();
      referenceTextIds = referenceTextIds.map((t) => t._id);

      console.log("referenceTextIds", referenceTextIds);
    }

    // Get textIds associated with project
    const project = await Project.findOne(
      { _id: req.body.projectId },
      { texts: 1 }
    ).lean();

    const textIds = project.texts;

    const textsMatchingSearchTerm = await filterTextsBySearchTerm({
      projectId: req.body.projectId,
      userId,
      textIds,
      searchTerm: searchTerm,
    });

    console.log("textsMatchingSearchTerm: ", textsMatchingSearchTerm);

    // Find texts by _id and populate with Annotations etc.
    // TODO: Handle save state... These should be found by themselves and used to filter out (or not) textId results.

    const textSaveAnnotations = await Annotations.find({
      userId,
      textId: { $in: project.texts },
      type: "save",
    }).lean();
    console.log("textSaveAnnotations: ", textSaveAnnotations);

    let savedTextIds = textSaveAnnotations.map((a) => a.textId);
    console.log("savedTextIds: ", savedTextIds);

    let matchedTexts;
    try {
      matchedTexts = await Text.aggregate([
        {
          $match: {
            _id: { $in: textsMatchingSearchTerm },
          },
        },
        {
          $lookup: {
            from: "annotations",
            let: { textId: "$_id" }, // Define the local variable textId to use in the pipeline
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$textId", "$$textId"] }, // Ensure the document's textId matches the text's _id
                      { $eq: ["$userId", mongoose.Types.ObjectId(userId)] }, // Filter by userId
                    ],
                  },
                },
              },
            ],
            as: "annotations",
          },
        },
        { $sort: { rank } },
        { $skip: skip },
        { $limit: limit },
      ]);
    } catch (error) {
      console.log(error);
      matchedTexts = [];
    }
    console.log(matchedTexts);

    // Process annotations
    const processedTexts = processAnnotations(matchedTexts);

    console.log("processedTexts: ", processedTexts);

    // Total Texts are the ENTIRE set of matches, not just the set returned.
    let totalTexts;
    try {
      totalTexts = await Text.count({
        _id: { $in: textsMatchingSearchTerm },
        // saved:
        //   saveState === "all"
        //     ? { $in: [true, false] }
        //     : saveState === "yes"
        //     ? true
        //     : false,
      });
    } catch (error) {
      console.log(error);
    }

    savedTextIds = savedTextIds.map((tId) => tId.toString());

    const payload = Object.assign(
      {},
      ...processedTexts.map((text) => ({
        [text._id]: {
          ...text,
          saved: savedTextIds.includes(text._id.toString()),
          tokens: Object.assign(
            {},
            ...Object.values(text.tokens).map((token) => ({
              [token.index]: {
                ...token,
              },
            }))
          ),
        },
      }))
    );

    res.json({ texts: payload, totalTexts });
  } catch (error) {
    logger.error("Failed to get text pagination results", {
      route: `/api/text/filter/${req.body.projectId}`,
    });
    res.status(500).send({ detail: error });
  }
});

/**
 * Updates the saved state of a single, or set of, textId(s)
 */
router.patch("/save", async (req, res) => {
  logger.info("Saving text(s)", {
    route: `/api/text/save`,
    body: req.body,
  });
  try {
    const userId = req.userId;

    let { textIds, saved } = req.body;

    textIds = textIds.map((tId) => mongoose.Types.ObjectId(tId));

    if (saved) {
      // User is trying to add save state
      const bulkOps = textIds.map((id) => ({
        updateOne: {
          filter: { userId, textId: id, type: "save" },
          update: { $setOnInsert: { type: "save", value: true } },
          upsert: true, // Insert document if not exists, but don't update if it does
        },
      }));

      await Annotations.bulkWrite(bulkOps);
    } else {
      // User is trying to remove save state
      await Annotations.deleteMany({
        userId,
        textId: { $in: textIds },
        type: "save",
      });
    }

    res.status(200).send({ updated: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ detail: error });
  }
});

/**
 * Add/remove flag annotation associated with text
 */
router.patch("/flag", async (req, res) => {
  logger.info("Paginating texts.", {
    route: `/api/text/filter`,
    body: req.body,
  });

  try {
    const userId = req.userId;
    let { textId, flagId } = req.body;

    textId = mongoose.Types.ObjectId(textId);
    flagId = mongoose.Types.ObjectId(flagId);

    const annotation = await Annotations.findOne({
      userId,
      textId,
      type: "flag",
      value: flagId,
    });
    console.log("annotation: ", annotation);

    if (annotation) {
      // Remove from text
      console.log("removing flag from text");
      await Annotations.deleteOne({
        userId,
        textId,
        type: "flag",
        value: flagId,
      });
      res.status(200).send({ message: "Successly deleted flag" });
    } else {
      // Add to text
      console.log("adding flag to text");
      await Annotations.create({
        userId,
        textId,
        type: "flag",
        value: flagId,
      });
      res.status(200).send({ message: "Successly added flag" });
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * Joins continguous groups of n-grams on a givent ext.
 * Note: `TK` refers to 'To Keep`
 * TODO: Review how this integrates with new `Annotation` collection
 */
router.patch("/tokenize", async (req, res) => {
  try {
    logger.info("Tokenizing single text", {
      route: `/api/text/tokenize`,
    });

    const text = await Text.findOne({ _id: req.body.textId })
      .populate("tokens.token")
      .lean();
    const textIndexes = text.tokens.map((token) => token.index);

    // Get indexes of all those in token piece groups
    const tokenIndexesTCAll = req.body.indexGroupsTC.flat();

    // TC: Indexes To Change
    // Only looks at the first index of each group as this will be where
    // the new token will be inserted
    const tokenIndexesTC = req.body.indexGroupsTC.map((group) => group[0]);

    // TK: Indexes To Keep
    const tokenIndexesTK = textIndexes.filter(
      (x) => !tokenIndexesTCAll.includes(x)
    );

    // Convert groups of token indexes into strings
    // There may be n groups of token pieces
    let tokenValuesTC = req.body.indexGroupsTC.map((group) =>
      group.map(
        (value) =>
          text.tokens
            .filter((token) => token.index === value)
            .map((token) =>
              token.token.replacement
                ? token.token.replacement
                : token.token.value
            )[0]
      )
    );
    tokenValuesTC = tokenValuesTC.map((valueGroup) => valueGroup.join(""));

    // These are used to update the app store values
    const tokenIdsTC = text.tokens
      .filter((token) => tokenIndexesTCAll.includes(token.index))
      .map((token) => token._id);

    // Create new tokens
    // const enMap = await Resource.findOne({ type: "en" }).lean();
    // const enMapSet = new Set(enMap.tokens);

    // Here all historical info will be stripped from new tokens; however they will
    // be checked if they are in the English lexicon
    const newTokenList = tokenValuesTC.map((token) => {
      return {
        value: token,
        tags: { en: false }, // enMapSet.has(token)
        replacement: null,
        suggestion: null,
        projectId: text.projectId,
      };
    });

    // Insert tokens into Token collection
    const tokenListRes = await Token.insertMany(newTokenList);

    // Build token array, assign indices and update text
    // - these are original tokens that remain unchanged, filtered by
    //   their index
    const oTokens = text.tokens
      .map((token) => token.token)
      .filter((e, i) => {
        return tokenIndexesTK.indexOf(i) !== -1;
      });
    const oTokensPayload = {
      tokens: tokenIndexesTK.map((originalIndex, sliceIndex) => ({
        index: originalIndex,
        token: oTokens[sliceIndex]._id,
      })),
    };

    // Add new tokens
    const nTokensPayload = {
      tokens: tokenIndexesTC.map((originalIndex, sliceIndex) => ({
        index: originalIndex,
        token: tokenListRes[sliceIndex]._id,
      })),
    };

    // Get new token Ids to update app store values
    const newTokenIds = nTokensPayload.tokens.map((token) => token.token);

    // Combine both payloads into single array
    let tokensPayload = {
      tokens: [...oTokensPayload["tokens"], ...nTokensPayload["tokens"]],
    };

    // Sort combined payload by original index
    tokensPayload["tokens"] = tokensPayload["tokens"].sort(
      (a, b) => a.index - b.index
    );

    // update indexes based on current ordering
    tokensPayload["tokens"] = tokensPayload.tokens.map((token, newIndex) => ({
      ...token,
      index: newIndex,
    }));

    // Capture tokenization group mapping
    // {original_index : token_group} where token_group is the original token values

    // Update text tokens array with new tokens
    const newText = await Text.findByIdAndUpdate(
      { _id: req.body.textId },
      tokensPayload,
      {
        upsert: true,
        new: true,
      }
    )
      .populate("tokens.token")
      .lean();

    // const tokenizationMap = req.body.indexGroupsTC.map((group) => ({
    //   [group[0]]: group.map(
    //     (token_index) =>
    //       text.tokens
    //         .filter((token) => token.index === token_index)
    //         .map((token) => ({ index: token.index, info: token.token }))[0]
    //   ),
    // }));

    // Update text tokenization history; TODO: review tokenization history output
    // const updatedTextRes = await Text.findByIdAndUpdate(
    //   { _id: req.body.textId },
    //   { $push: { tokenization_hist: tokenizationMap } },
    //   { upsert: true, new: true }
    // )
    //   .populate("tokens.token")
    //   .lean();

    // delete unused tokens
    const tokenIdsToDelete = text.tokens
      .map((token) => token)
      .filter((token) => req.body.indexGroupsTC.flat().includes(token.index))
      .map((token) => token.token._id);
    await Token.deleteMany({ _id: { $in: tokenIdsToDelete } });

    res.json(formatTextOutput(newText));
  } catch (err) {
    res.json({ message: err });
  }
});

// router.patch("/tokenize/all", async (req, res) => {
//   // For trivial cases like ['hell', 'o', 'world'] this is easy.
//   // However, for hard cases like ['hell', 'o', 'w', 'o', 'rld'] this becomes hard
//   // especially when scanning other documents with different token orders and sizes...
//   try {
//     res.json("success!");
//   } catch (err) {
//     res.json({ message: err });
//   }
// });

export default router;
