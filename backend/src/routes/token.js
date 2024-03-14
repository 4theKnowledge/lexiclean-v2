import express from "express";
import logger from "../logger/index.js";
import Text from "../models/Text.js";
import Annotations from "../models/Annotations.js";
import mongoose from "mongoose";
import {
  textTokenSearchPipeline,
  singleTokenFromTextPipeline,
} from "../aggregations/token.js";

const router = express.Router();

/**
 * Route for adding token-level replacmement, e.g. "hllo" -> "hello".
 * Optionality for cascading change across the corpora for matching tokens.
 * TODO: Ensure that when `applyAll` is used, saved texts are not impacted. Filter these out.
 */
router.patch("/add", async (req, res) => {
  logger.info("Applying token replacement(s).", {
    route: `/api/token/add`,
    body: req.body,
  });

  try {
    const userId = req.userId;

    let { textId, tokenId, projectId, applyAll, originalValue, replacement } =
      req.body;

    let annotations = [];
    let textTokenIds = {};
    let updatedFocusToken = false;

    textId = mongoose.Types.ObjectId(req.body.textId);
    tokenId = mongoose.Types.ObjectId(req.body.tokenId);
    projectId = mongoose.Types.ObjectId(req.body.projectId);

    if (applyAll) {
      // Add annotation on "focus token" (token event is triggered from.)
      // TODO: If focus token already has suggested replacement, make it become accepted (isSuggestion=False).

      const focusAnnotation = await Annotations.findOne({
        textId,
        tokenId,
        userId,
        type: "replacement",
      }).lean();

      if (focusAnnotation) {
        if (focusAnnotation.isSuggestion) {
          // Convert replacement suggestion to replacement
          await Annotations.updateOne(
            {
              _id: focusAnnotation._id,
            },
            { $set: { isSuggestion: false } }
          );
          // updatedFocusToken = true;
        }
      } else {
        // No replacement exists, create one.
        await Annotations.create({
          type: "replacement",
          userId,
          textId,
          tokenId,
          value: replacement,
          isSuggestion: false,
        });
        updatedFocusToken = true;
      }

      // Find matching tokens on texts
      let tokensIdsToUpdate;
      let tokensToUpdate;
      try {
        const matchingTokens = await Text.aggregate(
          textTokenSearchPipeline({
            projectId,
            excludeTokenIds: [tokenId],
            searchTerm: originalValue,
          })
        );

        console.log("matchingTokens: ", matchingTokens);

        const matchingTokenIds = matchingTokens.map((t) =>
          t.tokenId.toString()
        );

        // Check that no replacement annotations have already been

        // Filter out any matching tokens that have replacement annotations
        const tokensToExclude = await Annotations.find({
          userId,
          type: "replacement",
          tokenId: {
            $in: matchingTokenIds.map((id) => mongoose.Types.ObjectId(id)),
          }, // Ensure consistent ObjectId comparison
        }).lean();

        console.log("tokensToExclude: ", tokensToExclude);

        // Convert tokenIdsToExclude to strings for consistent comparison
        const tokenIdsToExclude = tokensToExclude.map((t) =>
          t.tokenId.toString()
        );

        // Now filter using the string representation of token IDs
        tokensIdsToUpdate = matchingTokenIds.filter(
          (tId) => !tokenIdsToExclude.includes(tId)
        );

        console.log("tokensIdsToUpdate: ", tokensIdsToUpdate);

        // Get token objects
        tokensToUpdate = matchingTokens.filter((t) =>
          tokensIdsToUpdate.includes(t.tokenId.toString())
        );

        console.log("tokensToUpdate: ", tokensToUpdate);
      } catch (error) {
        console.log(error);
      }

      // Update matching tokens with replacement and isSuggestion=True
      try {
        const annotationUpdateObjs = tokensToUpdate.map((token) => {
          // Check if the textId key already exists in textTokenIds
          if (textTokenIds[token.textId]) {
            // If it exists, push the current tokenId into the array
            textTokenIds[token.textId].push(token.tokenId);
          } else {
            // If it doesn't exist, initialize it with a new array containing the current tokenId
            textTokenIds[token.textId] = [token.tokenId];
          }

          return {
            insertOne: {
              document: {
                userId,
                tokenId: token.tokenId,
                textId: token.textId,
                type: "replacement",
                isSuggestion: true,
                value: replacement,
              },
            },
          };
        });

        await Annotations.bulkWrite(annotationUpdateObjs);
      } catch (error) {
        console.log(error);
      }

      annotations = [
        ...tokensToUpdate,
        ...(updatedFocusToken ? ["focusToken"] : []),
      ];
    } else {
      const annotation = await Annotations.findOne({
        tokenId,
        userId,
        type: "replacement",
      }).lean();

      if (annotation) {
        if (annotation.isSuggestion) {
          // If replacement suggestion, it will be converted into replacement
          await Annotations.updateOne(
            {
              _id: annotation._id,
            },
            { $set: { isSuggestion: false } }
          );
          textTokenIds = { [textId]: [tokenId] };
          annotations.push({ dummy: "token" });
        }
      } else {
        // Create annotation
        await Annotations.create({
          type: "replacement",
          userId,
          textId,
          tokenId,
          value: replacement,
        });
        textTokenIds = { [textId]: [tokenId] };
        annotations.push({ dummy: "token" });
      }
    }
    res.json({
      matches: annotations.length,
      textTokenIds,
    });
  } catch (error) {
    res.json({ details: error });
  }
});

/**
 * Token replacement delete.
 * if user deletes replacement suggestion, do not apply to replacements, only suggestions.
 * If the user applyAll deletes a replacement, delete replacement suggestions too.
 */
router.patch("/delete", async (req, res) => {
  logger.info("Deleting token replacement(s).", {
    route: `/api/token/delete`,
    body: req.body,
  });

  try {
    const userId = req.userId;

    const { textId, tokenId, projectId, applyAll, originalValue } = req.body;
    let annotations = [];
    let textTokenIds = {};

    console.log("originalValue: ", originalValue);

    if (applyAll) {
      const matchingTokens = await Text.aggregate(
        textTokenSearchPipeline({
          projectId: mongoose.Types.ObjectId(projectId),
          searchTerm: originalValue,
        })
      );

      console.log("matchingTokens: ", matchingTokens);

      const matchingTokenIds = matchingTokens.map((t) =>
        mongoose.Types.ObjectId(t.tokenId)
      );
      const focusTokenAnnotation = await Annotations.findOne({
        userId,
        tokenId,
      }).lean();
      // console.log("focusTokenAnnotation: ", focusTokenAnnotation);
      const focusTokenIsSuggestion = focusTokenAnnotation.isSuggestion;
      console.log("focusTokenIsSuggestion: ", focusTokenIsSuggestion);

      let queryConditions = {
        userId,
        tokenId: { $in: matchingTokenIds },
        value: focusTokenAnnotation.value,
      };
      if (focusTokenIsSuggestion) {
        // Directly use the boolean value of focusTokenIsSuggestion
        queryConditions.isSuggestion = focusTokenIsSuggestion;
      } else {
        // When focusTokenIsSuggestion is undefined, check for existence
        queryConditions.isSuggestion = { $exists: true };
      }

      annotations = await Annotations.find(queryConditions).lean();

      // console.log("annotations: ", annotations);

      await Annotations.deleteMany({
        _id: { $in: annotations.map((a) => a._id) },
      });

      textTokenIds = annotations.reduce((acc, annotation) => {
        (acc[annotation.textId] ??= []).push(annotation.tokenId);
        return acc;
      }, {});
    } else {
      await Annotations.deleteMany({
        userId,
        tokenId,
        textId,
        type: "replacement",
      });
      textTokenIds = { [textId]: [tokenId] };
    }
    res.json({ matches: annotations.length || 1, textTokenIds });
  } catch (error) {
    logger.error("Error in delete operation", { error });
    res.status(500).json({ message: "Error processing delete operation." });
  }
});

/**
 * Converts `isSuggestion` to false on type: 'replacement' annotations.
 */
router.patch("/accept", async (req, res) => {
  logger.info("Accepting token replacement(s).", {
    route: `/api/token/accept`,
    body: req.body,
  });

  try {
    const userId = req.userId;

    const { textId, tokenId, projectId, applyAll, originalValue } = req.body;
    let annotations = [];
    let textTokenIds = {};

    if (applyAll) {
      const matchingTokens = await Text.aggregate(
        textTokenSearchPipeline({
          projectId: mongoose.Types.ObjectId(projectId),
          searchTerm: originalValue,
        })
      );

      const matchingTokenIds = matchingTokens.map((t) =>
        mongoose.Types.ObjectId(t.tokenId)
      );

      // console.log("matchingTokenIds: ", matchingTokenIds);

      const annotationsToUpdate = await Annotations.find({
        userId,
        tokenId: {
          $in: matchingTokenIds,
        },
        type: "replacement",
        isSuggestion: true,
      }).lean();

      await Annotations.updateMany(
        {
          _id: { $in: annotationsToUpdate.map((a) => a._id) },
        },
        { $set: { isSuggestion: false } }
      );

      textTokenIds = annotationsToUpdate.reduce((acc, annotation) => {
        (acc[annotation.textId] ??= []).push(annotation.tokenId);
        return acc;
      }, {});

      annotations = annotationsToUpdate;
    } else {
      await Annotations.updateOne(
        { userId, tokenId, textId, type: "replacement" },
        { $set: { isSuggestion: false } }
      );
      textTokenIds = { [textId]: [tokenId] };
    }

    res.json({
      matches: annotations.length || 1,
      textTokenIds,
    });
  } catch (error) {
    logger.error("Error in accept operation", { error });
    res.status(500).json({ message: "Error processing accept operation." });
  }
});

// router.patch("/split", async (req, res) => {
//   /**
//    * Splits a given token into `n` new tokens based on introduced whitespace.
//    * TODO: Investigate how to classify tokens as IV/OOV without long load time of English lexicon.
//    */
//   try {
//     console.log(req.body);

//     let text = await Text.findById({ _id: req.body.textId });

//     const tokenIndex = req.body.tokenIndex;

//     // const enMap = await Resource.findOne({ type: "en" }).lean();
//     // const enMapSet = new Set(enMap.tokens);

//     // console.log("enMap token size", enMap.tokens.length);

//     // Here all historical information will be stripped from new tokens, however they will be
//     // checked for if they are OOV
//     const newTokenList = req.body.currentValue.split(" ").map((token) => ({
//       value: token,
//       // active: true,
//       tags: { en: false }, // enMapSet.has(token)
//       replacement: null,
//       suggestion: null,
//       projectId: text.projectId,
//       textId: text._id,
//     }));

//     // console.log("new tokens", newTokenList);

//     // Save new tokens to db
//     const tokenListRes = await Token.insertMany(newTokenList);

//     // Delete old tokens (TODO: investigate whether soft delete is better)
//     await Token.findByIdAndDelete({ _id: req.body.tokenId });

//     // Update old and new token indexes
//     const tokensToAdd = tokenListRes.map((token, index) => ({
//       token: token._id,
//       index: tokenIndex + index, // give new tokens index which is offset by the original tokens index
//     }));

//     // Insert new tokens - NOTE: this happens in place on the text object.
//     text.tokens.splice(tokenIndex, 1, ...tokensToAdd);

//     // Reassign indexes based on current ordering
//     text.tokens = text.tokens.map((token, newIndex) => ({
//       ...token,
//       index: newIndex,
//     }));

//     // Update text
//     // text.save();

//     await Text.findByIdAndUpdate(
//       { _id: req.body.textId },
//       { tokens: text.tokens },
//       {
//         new: true,
//       }
//     );

//     text = await Text.findById({ _id: req.body.textId })
//       .populate("tokens.token")
//       .lean();

//     res.json(formatTextOutput(text));
//   } catch (error) {
//     console.log(`Error occurred when splitting token - ${error}`);
//     res.json({ details: error });
//   }
// });

/**
 * "Removes" a given token from a text. Sets the value to an empty string. Removal cannot be isSuggestion.
 */
router.patch("/remove", async (req, res) => {
  try {
    const userId = req.userId;

    let annotations = [];
    let textTokenIds = {};

    let { applyAll, tokenId, textId, projectId } = req.body;

    textId = mongoose.Types.ObjectId(req.body.textId);
    tokenId = mongoose.Types.ObjectId(req.body.tokenId);
    projectId = mongoose.Types.ObjectId(req.body.projectId);

    if (applyAll) {
      console.log("remove many");
      // ...
    } else {
      console.log("remove one");

      const annotation = await Annotations.findOne({
        tokenId,
        userId,
        type: "replacement",
      }).lean();

      if (annotation) {
        // If token has replacement or suggestion, it will be converted into replacement with empty string.
        await Annotations.updateOne(
          {
            _id: annotation._id,
          },
          { $set: { isSuggestion: false, value: "" } }
        );
        textTokenIds = { [textId]: [tokenId] };
        annotations.push({ dummy: "token" });
      } else {
        // Create annotation
        await Annotations.create({
          type: "replacement",
          userId,
          textId,
          tokenId,
          value: "",
        });
        textTokenIds = { [textId]: [tokenId] };
        annotations.push({ dummy: "token" });
      }
    }
    res.json({
      matches: annotations.length,
      textTokenIds,
    });
  } catch (error) {
    console.log(error);
    res.json({ details: error });
  }
});

/**
 *
 */
router.post("/search", async (req, res) => {
  /**
   * Searches tokens to find matches on some value.
   * NOTE: Currently limited to replacement matches
   */
  try {
    const userId = req.userId;
    const { projectId, value } = req.body;

    console.log(projectId, userId, value);

    // Find matching tokens across corpus on their original value
    const matchingTokens = await Text.aggregate(
      textTokenSearchPipeline({
        projectId,
        searchTerm: value,
      })
    );

    console.log("matchingTokens: ", matchingTokens);

    const annotations = await Annotations.find({
      userId,
      tokenId: {
        $in: matchingTokens.map((t) => mongoose.Types.ObjectId(t.tokenId)),
      },
    });

    console.log("annotations: ", annotations);

    // Step 1: Aggregate the data
    const aggregation = annotations.reduce(
      (acc, { type, isSuggestion, value }) => {
        const key = `${type}-${isSuggestion}`;
        if (!acc[key]) {
          acc[key] = { type, isSuggestion, values: {} };
        }
        acc[key].values[value] = (acc[key].values[value] || 0) + 1;
        return acc;
      },
      {}
    );

    // Step 2: Transform the aggregation into the desired output format
    const result = Object.values(aggregation).map(
      ({ type, isSuggestion, values }) => ({
        type,
        isSuggestion,
        matches: values,
      })
    );

    res.json(result);
  } catch (error) {
    console.log(`Error ${error}`);
    res.json({ details: error });
  }
});

/**
 * Add entity label to token(s).
 */
router.patch("/label/add", async (req, res) => {
  try {
    const userId = req.userId;

    let { projectId, textId, tokenId, entityLabelId, applyAll } = req.body;

    textId = mongoose.Types.ObjectId(textId);
    tokenId = mongoose.Types.ObjectId(tokenId);
    entityLabelId = mongoose.Types.ObjectId(entityLabelId);

    let textTokenIds = {};
    let originalValue;

    if (applyAll) {
      const replacement = await Annotations.findOne(
        {
          userId,
          textId,
          tokenId,
          type: "replacement",
        },
        { value: 1 }
      ).lean();

      if (replacement) {
        // Match on replacement (current value)
        originalValue = replacement.value;
        console.log("token has replacement: ", originalValue);
      } else {
        // Match on original value...
        const focusTokenResults = await Text.aggregate(
          singleTokenFromTextPipeline({ textId, tokenId })
        );
        const focusToken = focusTokenResults[0] || null;
        if (focusToken) {
          originalValue = focusToken.value;
        }
      }

      if (!originalValue) {
        return res
          .status(404)
          .json({ message: "Original value for token not found." });
      }

      let matchingTokens = await Text.aggregate(
        textTokenSearchPipeline({
          projectId,
          excludeTokenIds: [tokenId.toString()],
          searchTerm: originalValue,
        })
      );

      // Check for matching tokens by replacement value too
      const matchingTokensAnnotation = await Annotations.find({
        userId,
        type: "replacement",
        value: originalValue,
        tokenId: { $ne: tokenId },
      }).lean();

      console.log("matchingTokensAnnotation: ", matchingTokensAnnotation);

      matchingTokens = [...matchingTokens, ...matchingTokensAnnotation];

      // Exclude tokens already labeled
      const labeledTokenIds = new Set(
        (
          await Annotations.find(
            {
              userId,
              type: "tag",
              value: entityLabelId,
              tokenId: { $in: matchingTokens.map((t) => t.tokenId) },
            },
            "tokenId"
          ).lean()
        ).map((a) => a.tokenId.toString())
      );

      const tokensToUpdate = matchingTokens.filter(
        (t) => !labeledTokenIds.has(t.tokenId.toString())
      );

      const annotationUpdateObjs = tokensToUpdate.map((token) => {
        const tokenTextId = token.textId.toString();
        const tokenTokenId = token.tokenId.toString();

        if (textTokenIds[tokenTextId]) {
          textTokenIds[tokenTextId].push(tokenTokenId);
        } else {
          textTokenIds[tokenTextId] = [tokenTokenId];
        }

        return {
          insertOne: {
            document: {
              userId,
              textId: mongoose.Types.ObjectId(tokenTextId),
              tokenId: mongoose.Types.ObjectId(tokenTokenId),
              type: "tag",
              value: entityLabelId,
            },
          },
        };
      });

      const result = await Annotations.bulkWrite(annotationUpdateObjs);
      return res.json({
        matches: result.insertedCount,
        textTokenIds,
      });
    } else {
      const existingAnnotation = await Annotations.findOne({
        textId,
        userId,
        tokenId,
        value: entityLabelId,
        type: "tag",
      });

      if (!existingAnnotation) {
        await Annotations.create({
          textId,
          userId,
          tokenId,
          value: entityLabelId,
          type: "tag",
        });
        return res.json({ matches: 1, textTokenIds: { [textId]: [tokenId] } });
      }
      return res
        .status(400)
        .json({ message: "Label already exists on this token." });
    }
  } catch (err) {
    logger.error("Error in /label/add route", err);
    return res.status(500).json({ message: "An error occurred." });
  }
});

/**
 * Delete label from token.
 * TODO: Review whether tags should have suggestions and whether they should follow
 *       the same logic as token transformations.
 */
router.patch("/label/delete", async (req, res) => {
  try {
    const userId = req.userId;
    let { textId, tokenId, applyAll, entityLabelId, projectId } = req.body;

    textId = mongoose.Types.ObjectId(textId);
    tokenId = mongoose.Types.ObjectId(tokenId);
    entityLabelId = mongoose.Types.ObjectId(entityLabelId);

    let textTokenIds = {};
    let originalValue;

    if (applyAll) {
      // Find all annoations of similar type and remove
      const replacement = await Annotations.findOne(
        {
          userId,
          textId,
          tokenId,
          type: "replacement",
        },
        { value: 1 }
      ).lean();

      if (replacement) {
        // Match on replacement (current value)
        originalValue = replacement.value;
      } else {
        // Match on original value...
        const focusTokenResults = await Text.aggregate(
          singleTokenFromTextPipeline({ textId, tokenId })
        );
        const focusToken = focusTokenResults[0] || null;

        if (focusToken) {
          originalValue = focusToken.value;
        }
      }

      if (!originalValue) {
        return res
          .status(404)
          .json({ message: "Original value for token not found." });
      }

      let matchingTokens = await Text.aggregate(
        textTokenSearchPipeline({
          projectId,
          excludeTokenIds: [tokenId.toString()],
          searchTerm: originalValue,
        })
      );

      const matchingTokensAnnotation = await Annotations.find({
        userId,
        type: "replacement",
        value: originalValue,
        tokenId: { $ne: tokenId },
      }).lean();

      console.log("matchingTokensAnnotation: ", matchingTokensAnnotation);

      matchingTokens = [...matchingTokens, ...matchingTokensAnnotation];

      const matchingTokenIds = matchingTokens.map((t) =>
        mongoose.Types.ObjectId(t.tokenId)
      );

      const result = await Annotations.deleteMany({
        userId,
        tokenId: { $in: [...matchingTokenIds, tokenId] },
        type: "tag",
        value: entityLabelId,
      });

      textTokenIds = matchingTokens.reduce((acc, token) => {
        (acc[token.textId] ??= []).push(token.tokenId);
        return acc;
      }, {});

      // Add focus token to textTokenIds
      if (textTokenIds[textId]) {
        textTokenIds[textId].push(tokenId);
      } else {
        textTokenIds[textId] = [tokenId];
      }

      res.json({ matches: result.deletedCount, textTokenIds });
    } else {
      await Annotations.deleteOne({
        userId,
        textId,
        tokenId,
        value: entityLabelId,
        type: "tag",
      });
      res.json({ matches: 1, textTokenIds: { [textId]: [tokenId] } });
    }
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
});

export default router;
