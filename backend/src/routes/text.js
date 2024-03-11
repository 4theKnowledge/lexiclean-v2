const express = require("express");
const router = express.Router();
const logger = require("../logger");
const Text = require("../models/Text");
const Token = require("../models/Token");
const Resource = require("../models/Resource");
const { formatTextOutput } = require("../utils/text");

router.post("/filter", async (req, res) => {
  //
  console.log("text filter body", req.body);

  try {
    // if (req.body.get_pages) {
    // Returns total pages instead of page of results
    // try {
    //     logger.info("Getting number of pages for paginator (search filtered)", {
    //       route: "/api/text/filter",
    //     });

    //     const filter = req.body.filter;

    //     let textsCount;
    //     if (filter.searchTerm !== "" || filter.saved !== "all") {
    //       // Search is case-insensitive, non-exact matching
    //       const tokenResponse = await Token.find({
    //         projectId: req.body.projectId,
    // $or: [
    //   { value: { $regex: filter.searchTerm, $options: "i" } },
    //   { replacement: { $regex: filter.searchTerm, $options: "i" } },
    // ],
    //       }).lean();

    //       const tokenIds = new Set(tokenResponse.map((token) => token._id));

    //       const textResponse = await Text.find({
    //         projectId: req.body.projectId,
    //         "tokens.token": { $in: Array.from(tokenIds) },
    //       }).lean();

    //       const textIds = new Set(textResponse.map((text) => text._id));

    //       textsCount = await Text.find({
    //         projectId: req.body.projectId,
    //         _id: { $in: Array.from(textIds) },
    //         saved:
    //           filter.saved === "saved"
    //             ? true
    //             : filter.saved === "unsaved"
    //             ? false
    //             : { $in: [true, false] },
    //       }).count();
    //     } else {
    //       textsCount = await Text.find({
    //         projectId: req.body.projectId,
    //       }).count();
    //     }

    //     const pages = Math.ceil(textsCount / req.query.limit);

    //     res.json({ totalPages: pages });
    //   } catch (err) {
    //     res.json({ message: err });
    //     logger.error("Failed to get number of pages for paginator", {
    //       route: `/api/text/filter/pages/${req.params.projectId}`,
    //     });
    //   }
    // } else {
    //   logger.info("Fetching results from paginator", {
    //     route: "/api/text/filter",
    //   });

    //   const skip = parseInt((req.query.page - 1) * req.query.limit); // equiv to page
    //   const limit = parseInt(req.query.limit); // same as limit
    //   const filter = req.body.filter;

    //   let textIds;
    //   if (filter.searchTerm !== "" || filter.candidates !== "all") {
    //     // Case insensitive filter; filters for all tokens if no term specified
    //     const tokenResponse = await Token.find({
    //       projectId: req.body.projectId,
    //       $or: [
    //         { value: { $regex: filter.searchTerm, $options: "i" } },
    //         { replacement: { $regex: filter.searchTerm, $options: "i" } },
    //       ],
    //     }).lean();

    //     // OOV Candidate search
    //     // These are tokens that are non-English, do not have a replacement or meta-tag
    //     const candidateTokens = tokenResponse
    //       .filter(
    //         (token) =>
    //           !token.tags["en"] &&
    //           Object.keys(token.tags).length <= 1 &&
    //           !token.replacement
    //       )
    //       .map((token) => token._id);
    //     console.log("token candidates", candidateTokens);

    //     const tokenIds = new Set(tokenResponse.map((token) => token._id));
    //     const textResponse = await Text.find({
    //       projectId: req.body.projectId,
    //       "tokens.token": { $in: Array.from(tokenIds) },
    //     }).lean();

    //     textIds = new Set(textResponse.map((text) => text._id));
    //   }

    const skip = parseInt((req.query.page - 1) * req.query.limit);
    const limit = parseInt(req.query.limit);

    const saveState = req.body.filters.saved;
    const searchTerm = req.body.filters.searchTerm;
    const referenceSearchTerm = req.body.filters.referenceSearchTerm;
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

    // NOTE: $regex replace is used to escape special characters
    let matchedTokens = await Token.find(
      {
        projectId: req.body.projectId,
        textId: hasReferenceSearchTerm
          ? { $in: referenceTextIds }
          : { $exists: true },
        $or: [
          {
            value: {
              $regex: searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              $options: "i",
            },
          },
          {
            replacement: {
              $regex: searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
              $options: "i",
            },
          },
        ],
      },
      { textId: 1 }
    ).lean();
    textIdsFromTokens = matchedTokens.map((t) => t.textId);

    // textIdsFromTokens.push(...referenceTextIds.map((t) => t._id));

    const matchedTexts = await Text.find({
      _id: { $in: textIdsFromTokens },
      saved:
        saveState === "all"
          ? { $in: [true, false] }
          : saveState === "yes"
          ? true
          : false,
    })
      .sort({ rank: req.body.filters.rank })
      .skip(skip)
      .limit(limit)
      .populate("tokens.token");

    const totalTexts = await Text.count({
      _id: { $in: textIdsFromTokens },
      saved:
        saveState === "all"
          ? { $in: [true, false] }
          : saveState === "yes"
          ? true
          : false,
    });

    // Turn texts and tokens into hashmaps (text uses _id, tokens use tokens index)
    const payload = Object.assign(
      {},
      ...matchedTexts.map((text) => ({
        [text._id]: {
          weight: text.weight,
          rank: text.rank,
          saved: text.saved,
          identifiers: text.identifiers,
          original: text.original,
          reference: text.reference,
          tokens: Object.assign(
            {},
            ...text.tokens.map((token) => ({
              [token.index]: {
                _id: token.token._id,
                value: token.token.value,
                currentValue: token.token.replacement // Adds current value of token based on state of token. This can be updated in reducers at scale/
                  ? token.token.replacement
                  : token.token.suggestion
                  ? token.token.suggestion
                  : token.token.value,
                tags: token.token.tags,
                replacement: token.token.replacement,
                suggestion: token.token.suggestion,
              },
            }))
          ),
        },
      }))
    );

    res.status(200).send({ texts: payload, totalTexts: totalTexts });
  } catch (error) {
    logger.error("Failed to get text pagination results", {
      route: `/api/text/filter/${req.body.projectId}`,
    });
    res.status(500).send({ detail: error });
  }
});

router.patch("/save", async (req, res) => {
  // Updates the saved state of a single, or set of, textId(s)
  try {
    logger.info("Saving text(s)", {
      route: `/api/text/save`,
    });

    await Text.updateMany(
      {
        _id: { $in: req.body.textIds },
      },
      { saved: req.body.saved }
    );

    res.status(200).send({ updated: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ detail: error });
  }
});

router.patch("/tokenize", async (req, res) => {
  /**
   * Joins continguous groups of n-grams on a givent ext.
   * Note: `TK` refers to 'To Keep`
   */
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

// [REVIEW] Undo text tokenization - single text
// WIP - requires using the tokenization history to walk back...
// currently legacy code.
// router.patch("/tokenize/undo", async (req, res) => {
//   try {
//     const textId = await Text.findById({ _id: req.body.textId }).lean();

//     // Remove old tokens
//     const oldTokenIds = textId.tokens.map((token) => token._id);
//     await Token.deleteMany({ _id: { $in: oldTokenIds } });

//     // Create new tokens
//     const enMap = await Resource.findOne({ type: "en" }).lean();
//     const enMapSet = new Set(enMap.tokens);

//     // Here all historical info will be stripped from new tokens regardless of whether new combinations are in IV form
//     const newTokenList = textId.original.split(" ").map((token) => {
//       return {
//         value: token,
//         tags: { en: enMapSet.has(token) },
//         replacement: null,
//         suggestion: null,
//         projectId: textId.projectId,
//       };
//     });

//     // Insert tokens into Token collection
//     const tokenListRes = await Token.insertMany(newTokenList);

//     const tokensPayload = {
//       tokens: tokenListRes.map((token, index) => ({
//         index: index,
//         token: token._id,
//       })),
//     };

//     const updatedTextRes = await Text.findByIdAndUpdate(
//       { _id: req.body.textId },
//       tokensPayload,
//       { new: true }
//     )
//       .populate("tokens.token")
//       .lean();

//     // convert text into same format as the paginator (this is expected by front-end components)
//     const outputTokens = updatedTextRes.tokens.map((token) => ({
//       ...token.token,
//       index: token.index,
//       token: token.token._id,
//     }));
//     const outputText = { ...updatedTextRes, tokens: outputTokens };

//     res.json(outputText);
//   } catch (err) {
//     res.json({ message: err });
//   }
// });

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

module.exports = router;
