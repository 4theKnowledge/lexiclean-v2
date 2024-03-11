const express = require("express");
const router = express.Router();
const logger = require("../logger");
const Token = require("../models/Token");
const Text = require("../models/Text");
const Resource = require("../models/Resource");
const { formatTextOutput } = require("../utils/text");

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
      res.json({
        matches: 1,
        textTokenIds: { [req.body.textId]: [req.body.tokenId] },
      });
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
      res.json({
        matches: 1,
        textTokenIds: { [req.body.textId]: [req.body.tokenId] },
      });
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

      res.json({
        matches: 1,
        textTokenIds: { [req.body.textId]: [req.body.tokenId] },
      });
    }
  } catch (error) {
    res.json({ details: error });
  }
});

router.patch("/split", async (req, res) => {
  /**
   * Splits a given token into `n` new tokens based on introduced whitespace.
   * TODO: Investigate how to classify tokens as IV/OOV without long load time of English lexicon.
   */
  try {
    console.log(req.body);

    let text = await Text.findById({ _id: req.body.textId });

    const tokenIndex = req.body.tokenIndex;

    // const enMap = await Resource.findOne({ type: "en" }).lean();
    // const enMapSet = new Set(enMap.tokens);

    // console.log("enMap token size", enMap.tokens.length);

    // Here all historical information will be stripped from new tokens, however they will be
    // checked for if they are OOV
    const newTokenList = req.body.currentValue.split(" ").map((token) => ({
      value: token,
      active: true,
      tags: { en: false }, // enMapSet.has(token)
      replacement: null,
      suggestion: null,
      projectId: text.projectId,
      textId: text._id,
    }));

    // console.log("new tokens", newTokenList);

    // Save new tokens to db
    const tokenListRes = await Token.insertMany(newTokenList);

    // Delete old tokens (TODO: investigate whether soft delete is better)
    await Token.findByIdAndDelete({ _id: req.body.tokenId });

    // Update old and new token indexes
    const tokensToAdd = tokenListRes.map((token, index) => ({
      token: token._id,
      index: tokenIndex + index, // give new tokens index which is offset by the original tokens index
    }));

    // Insert new tokens - NOTE: this happens in place on the text object.
    text.tokens.splice(tokenIndex, 1, ...tokensToAdd);

    // Reassign indexes based on current ordering
    text.tokens = text.tokens.map((token, newIndex) => ({
      ...token,
      index: newIndex,
    }));

    // Update text
    // text.save();

    await Text.findByIdAndUpdate(
      { _id: req.body.textId },
      { tokens: text.tokens },
      {
        new: true,
      }
    );

    text = await Text.findById({ _id: req.body.textId })
      .populate("tokens.token")
      .lean();

    res.json(formatTextOutput(text));
  } catch (error) {
    console.log(`Error occurred when splitting token - ${error}`);
    res.json({ details: error });
  }
});

router.patch("/remove", async (req, res) => {
  /**
   * Removes a given token from a text
   * TODO: Handle when only one token on text. Don't let user delete it, replace token content with empty string.
   */
  try {
    if (req.body.applyAll) {
      const focusToken = await Token.findById({ _id: req.body.tokenId }).lean();

      const matchedTokens = await Token.find({
        projectId: focusToken.projectId,
        value: focusToken.value,
      }).lean();

      console.log("matchedTokens", matchedTokens);

      const matchedTextIds = matchedTokens.map((t) => t.textId);

      let texts = await Text.find({
        _id: { $in: matchedTextIds },
        $or: [
          {
            saved: false, // Exclude user saved texts
            _id: focusToken.textId,
          },
        ],
      }).populate("tokens.token");

      let savedTextIds = texts.map((t) => t._id.toString());

      console.log("savedTextIds", savedTextIds);

      texts.forEach((text) => {
        text.tokens = text.tokens
          .filter((t) => t.token.value !== focusToken.value)
          .map((t, index) => ({ index: index, token: t.token }));

        text.save();
      });

      // NOTE: textTokenObjects here are not equivalent to textTokenIds!
      // Only returns current page of texts
      res.json({
        matches: matchedTokens.filter((t) =>
          savedTextIds.includes(t.textId.toString())
        ).length,
        textTokenObjects: Object.assign(
          {},
          ...texts
            .filter((text) => req.body.textIds.includes(text._id.toString()))
            .map((text) => formatTextOutput(text))
        ),
      });
    } else {
      let text = await Text.findById({ _id: req.body.textId }).populate(
        "tokens.token"
      );

      // console.log("text", text);
      // console.log("text tokens before mod", text.tokens.length);

      // reindex remaining tokens
      text.tokens = text.tokens
        .filter((t) => t.token._id != req.body.tokenId)
        .map((t, index) => ({ index: index, token: t.token }));

      // console.log("text tokens after mod", text.tokens.length);
      // console.log("text tokens", text.tokens);

      // Update text
      text.save();

      // Delete old tokens (TODO: investigate whether soft delete is better)
      await Token.findByIdAndDelete({ _id: req.body.tokenId });

      res.json({ matches: 1, textTokenObjects: formatTextOutput(text) });
    }
  } catch (error) {
    res.json({ details: error });
  }
});

router.post("/search", async (req, res) => {
  /**
   * Searches tokens to find matches on some value.
   * NOTE: Currently limited to replacement matches
   */
  try {
    const matchedTokens = await Token.find(
      {
        projectId: req.body.projectId,
        value: req.body.value,
        replacement: { $ne: null },
      },
      { replacement: 1, _id: 0 }
    ).lean();

    // Get counts of replacements
    const output = matchedTokens
      .map((t) => t.replacement)
      .reduce(function (acc, curr) {
        return acc[curr] ? ++acc[curr] : (acc[curr] = 1), acc;
      }, {});

    res.json({ replacements: output });
  } catch (error) {
    console.log(`Error ${error}`);
    res.json({ details: error });
  }
});

// --- Tags for Token Classification Multi-task ---

router.patch("/meta/add/single", async (req, res) => {
  // Patch tag on one token
  try {
    const tokenResponse = await Token.findById({
      _id: req.body.tokenId,
    }).lean();

    const updatedTags = {
      ...tokenResponse.tags,
      [req.body.entityLabelId]: true,
    };

    await Token.findByIdAndUpdate(
      { _id: req.body.tokenId },
      {
        tags: updatedTags,
      },
      { upsert: true }
    ).lean();

    res.json(updatedTags);
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
  try {
    const tokenResponse = await Token.findById({
      _id: req.params.tokenId,
    }).lean();

    // Filter out the key to be removed.
    const filteredTags = Object.keys(tokenResponse.tags)
      .filter((key) => key !== req.body.entityLabelId)
      .reduce((res, key) => {
        res[key] = tokenResponse.tags[key];
        return res;
      }, {});

    await Token.findByIdAndUpdate(
      { _id: req.params.tokenId },
      {
        tags: filteredTags,
      },
      { upsert: true }
    ).lean();

    res.json(filteredTags);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
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
