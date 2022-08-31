const express = require("express");
const router = express.Router();
const logger = require("../logger");
const Token = require("../models/Token");
const Text = require("../models/Text");

router.patch("/add", async (req, res) => {
  try {
    let response;
    if (req.body.applyAll) {
      // Applies replacement to token and suggestions to all other
      // tokens that match
      logger.info("Applying replacement to all token matches", {
        route: "/api/token/add",
        body: req.body,
      });

      const focusToken = await Token.findById({
        _id: req.body.tokenId,
      }).lean();

      await Token.findByIdAndUpdate(
        { _id: req.body.tokenId },
        { replacement: req.body.replacement }
      );

      // Filter for only unsaved texts to ensure that saved documents are not modified
      let unsavedTextIds = await Text.find(
        { projectId: focusToken.projectId, saved: false },
        { _id: 1 }
      ).lean();
      unsavedTextIds = unsavedTextIds.map((t) => t._id.toString());

      const tokenMatches = await Token.find({
        projectId: focusToken.projectId,
        value: focusToken.value,
        replacement: { $eq: null },
        _id: { $ne: req.body.tokenId },
        textId: { $in: unsavedTextIds },
      }).lean();

      console.log("Number of matches", tokenMatches.length);

      const updatedTokens = tokenMatches.map((token) => ({
        updateOne: {
          filter: { _id: token._id },
          update: {
            suggestion: req.body.replacement,
          },
          upsert: true,
        },
      }));
      await Token.bulkWrite(updatedTokens);

      // Filtered tokens for UI rendering
      const filteredTokens = tokenMatches.filter((t) =>
        req.body.textIds.includes(t.textId.toString())
      );

      const textTokenIds = filteredTokens.reduce((value, object) => {
        if (value[object.textId]) {
          value[object.textId].push(object._id);
        } else {
          value[object.textId] = [object._id];
        }
        return value;
      }, {});

      res.json({
        matches: tokenMatches.length,
        textTokenIds: textTokenIds,
      });
    } else {
      logger.info("Adding replacement to a single token", {
        route: "/api/token/add",
        body: req.body,
      });

      response = await Token.updateOne(
        { _id: req.body.tokenId },
        {
          replacement: req.body.replacement,
        },
        { upsert: true }
      );
      res.json(response);
    }
  } catch (error) {
    res.json({ details: error });
  }
});

router.patch("/delete", async (req, res) => {
  try {
    logger.info("Deleting detail on single", {
      route: `/api/token/delete`,
    });

    let response;

    // Remove replacements on all tokens with same replacement and original value
    // this also includes removing tokens with suggestion too
    if (req.body.applyAll) {
      const focusToken = await Token.findById({ _id: req.body.tokenId }).lean();

      console.log("focusToken", focusToken);

      const focusTokenHasReplacement = focusToken.replacement;

      const matchOp = focusTokenHasReplacement
        ? {
            $or: [
              {
                replacement: focusToken.replacement,
              },
              {
                suggestion: focusToken.replacement,
              },
            ],
          }
        : { suggestion: focusToken.suggestion };

      const tokenMatches = await Token.find({
        $and: [
          { projectId: focusToken.projectId },
          { value: focusToken.value },
          matchOp,
        ],
      });

      console.log("number of tokenMatches", tokenMatches.length);

      const updateOp = focusTokenHasReplacement
        ? { replacement: null, suggestion: null }
        : { suggestion: null };

      const tokenIds = tokenMatches.map((t) => t._id);

      // Filtered tokens for UI rendering
      const filteredTokens = tokenMatches.filter((t) =>
        req.body.textIds.includes(t.textId.toString())
      );

      const textTokenIds = filteredTokens.reduce((value, object) => {
        if (value[object.textId]) {
          value[object.textId].push(object._id);
        } else {
          value[object.textId] = [object._id];
        }
        return value;
      }, {});

      await Token.updateMany({ _id: { $in: tokenIds } }, updateOp, {
        upsert: true,
      });

      res.json({ matches: tokenMatches.length, textTokenIds: textTokenIds });
    } else {
      response = await Token.updateOne(
        {
          _id: req.body.tokenId,
        },
        {
          replacement: null,
          suggestion: null,
        }
      );
      res.json(response);
    }
  } catch (err) {
    res.json({ message: err });
  }
});

router.patch("/accept", async (req, res) => {
  try {
    if (req.body.applyAll) {
      // Accept suggested replacements as actual replacements for all suggestion instances
      logger.info("Accepting all suggestions", {
        route: `/api/token/accept`,
      });

      const focusToken = await Token.findById({ _id: req.body.tokenId }).lean();

      const tokenMatches = await Token.find({
        projectId: focusToken.projectId,
        value: focusToken.value,
        suggestion: focusToken.suggestion,
      }).lean();

      console.log("token matches", tokenMatches.length);

      const tokenIds = tokenMatches.map((t) => t._id);

      // Filtered tokens for UI rendering
      const filteredTokens = tokenMatches.filter((t) =>
        req.body.textIds.includes(t.textId.toString())
      );

      const textTokenIds = filteredTokens.reduce((value, object) => {
        if (value[object.textId]) {
          value[object.textId].push(object._id);
        } else {
          value[object.textId] = [object._id];
        }
        return value;
      }, {});

      await Token.updateMany(
        { _id: { $in: tokenIds } },
        { replacement: focusToken.suggestion, suggestion: null },
        {
          upsert: true,
        }
      );

      res.json({ matches: tokenMatches.length, textTokenIds: textTokenIds });
    } else {
      // Accept single suggestion and convert into replacement
      let token = await Token.findById({ _id: req.body.tokenId });
      token.replacement = token.suggestion;
      token.suggestion = null;
      token.save();

      res.json(token);
    }
  } catch (error) {
    res.json({ details: error });
  }
});

// --- Token Classification Tags ---

router.patch("/meta/add/single/", async (req, res) => {
  // Patch meta-tag on one token
  // Takes in field, value pair where the field is the axuiliary information key
  try {
    const tokenResponse = await Token.findById({
      _id: req.body.tokenId,
    }).lean();

    const updatedMetaTags = {
      ...tokenResponse.tags,
      [req.body.field]: req.body.value,
    };

    const updatedReponse = await Token.findByIdAndUpdate(
      { _id: req.body.tokenId },
      {
        tags: updatedMetaTags,
        // last_modified: new Date(Date.now()),
      },
      { upsert: true }
    ).lean();

    await Text.updateOne(
      { _id: req.body.textId },
      {
        saved: true,
        // last_modified: new Date(Date.now())
      },
      { upsert: true }
    );

    res.json(updatedReponse);
  } catch (err) {
    res.json({ message: err });
  }
});

// Patch meta-tags on all tokens
router.patch("/meta/add/many/:projectId", async (req, res) => {
  // Takes in field, value pair where the field is the meta-tag information key
  // Updates all values in data set that match with meta-tag boolean
  try {
    const originalTokenValue = req.body.original_token;
    const metaTag = req.body.field;
    const metaTagValue = req.body.value;

    // Get all tokens that match body token
    const tokenResponse = await Token.find({
      projectId: req.params.projectId,
      value: originalTokenValue,
    }).lean();

    const updateTokens = tokenResponse.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          tags: { ...token.tags, [metaTag]: metaTagValue },
        },
        upsert: true,
      },
    }));

    await Token.bulkWrite(updateTokens);

    // Update text annotation states

    res.json({ matches: tokenResponse.length });
  } catch (err) {
    res.json({ message: err });
  }
});

// Removes meta-tag from one token
router.patch("/meta/remove/one/:tokenId", async (req, res) => {
  //console.log('removing meta-tag from single token')
  try {
    const tokenResponse = await Token.findById({
      _id: req.params.tokenId,
    }).lean();
    const updatedMetaTags = {
      ...tokenResponse.tags,
      [req.body.field]: false,
    };
    const response = await Token.findByIdAndUpdate(
      { _id: req.params.tokenId },
      {
        tags: updatedMetaTags,
        // last_modified: new Date(Date.now()),
      },
      { upsert: true }
    ).lean();
    res.json(response);
  } catch (err) {
    res.json({ message: err });
  }
});

// Removes meta tag from all tokens with similar original value
// TODO: review whether matches should be on the original value and replacement values of
// tokens
router.patch("/meta/remove/many/:projectId", async (req, res) => {
  try {
    const originalTokenValue = req.body.original_token;
    const metaTag = req.body.field;
    const metaTagValue = req.body.value;

    // Get all tokens that match body token
    const tokenResponse = await Token.find({
      projectId: req.params.projectId,
      value: originalTokenValue,
    });

    // console.log(tokenResponse);

    const updateTokens = tokenResponse.map((token) => ({
      updateOne: {
        filter: { _id: token._id },
        update: {
          tags: { ...token.tags, [metaTag]: metaTagValue },
        },
        upsert: true,
      },
    }));

    await Token.bulkWrite(updateTokens);

    res.json({ matches: tokenResponse.length });
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
