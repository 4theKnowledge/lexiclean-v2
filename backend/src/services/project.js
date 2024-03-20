import { combinations } from "combinatorial-generators";
import { diffChars } from "diff";
import Annotations from "../models/Annotations.js";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import Text from "../models/Text.js";

const extractTags = (token, tagSets) => {
  return Object.keys(tagSets)
    .filter((key) => key !== "rp")
    .reduce((tags, key) => ({ ...tags, [key]: tagSets[key].has(token) }), {});
};

export const createAnnotatedTokens = (
  projectId,
  textId,
  tokens,
  tagSets,
  replacements,
  annotateDigits = false
) => {
  const hasReplacements = "rp" in tagSets;

  return tokens.map((token, index) => {
    const tokenTags = extractTags(token, tagSets);
    const isDigit = annotateDigits && /^\d+$/g.test(token);

    return {
      value: token,
      index,
      // tags: isDigit ? { ...tokenTags, en: true } : tokenTags,
      // replacement: hasReplacements && tagSets.rp.has(token) ? replacements[token] : null,
      // suggestion: null, // Assuming you'll add logic here later
      // active: true, // Assuming this is always true, adjust as needed
      textId,
      projectId,
    };
  });
};

const compareWords = (word1, word2) => {
  if (word1 === word2) {
    // Shortcut and handles the case of empty strings
    return 100;
  }

  const diffs = diffChars(word1, word2);
  // console.log("diffs: ", diffs);
  let matchingCharacters = 0;
  let totalCharacters = 0;

  diffs.forEach((part) => {
    // Count characters only in parts that haven't changed
    if (!part.added && !part.removed) {
      matchingCharacters += part.count;
    }
    // Count total characters from both words
    totalCharacters += part.count;
  });

  // Calculate the score as a percentage
  const score = (matchingCharacters / totalCharacters) * 100;

  return Number(score.toFixed(2)); // Format the score to 2 decimal places
};

const tokenSimilarity = (token1, token2) => {
  return compareWords(token1, token2);
};

const computePairwiseSimilarity = (annotations) => {
  const annotatorIds = Object.keys(annotations);
  const pairwiseScores = [];
  const tokenLevelScores = [];

  for (const [user1, user2] of combinations(annotatorIds, 2)) {
    const tokenSimilarities = annotations[user1].tokens.map((token, i) => {
      const score = tokenSimilarity(token, annotations[user2].tokens[i]);
      if (!tokenLevelScores[i]) tokenLevelScores[i] = [];
      tokenLevelScores[i].push(score);
      return score;
    });
    const averageSimilarity =
      tokenSimilarities.reduce((a, b) => a + b, 0) / tokenSimilarities.length;
    pairwiseScores.push(averageSimilarity);
  }

  // console.log(tokenLevelScores);

  // Calculate average IAA per token
  const tokenAverages = tokenLevelScores.map((scores) => {
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  const combinationsList = Array.from(combinations(annotatorIds, 2));
  return [pairwiseScores, combinationsList, tokenAverages];
};

export const documentLevelIAA = (annotations) => {
  const annotatorIds = Object.keys(annotations);

  if (annotatorIds.length === 1) {
    // Single annotator project - default to perfect scores.
    return [
      100,
      null,
      new Array(annotations[annotatorIds[0]].tokens.length).fill(100),
    ];
  }

  const [pairwiseScores, combinations, tokenAverages] =
    computePairwiseSimilarity(annotations);
  if (!pairwiseScores.length) return 0;
  const documentIaa =
    pairwiseScores.reduce((a, b) => a + b, 0) / pairwiseScores.length;

  const pairwiseScoresWithAnnotators = Object.fromEntries(
    combinations.map((annotators, index) => [
      annotators.join("&"),
      pairwiseScores[index],
    ])
  );

  return [documentIaa, pairwiseScoresWithAnnotators, tokenAverages];
};

export const compileTokens = (annotations) => {
  // Assuming all annotators have the same number of tokens
  const tokenPositions = annotations[Object.keys(annotations)[0]].tokens.length;
  const compiledTokens = [];

  for (let i = 0; i < tokenPositions; i++) {
    const tokenCounts = {};

    // Gather tokens at this position from all annotators and count occurrences
    Object.values(annotations).forEach((annotator) => {
      const token = annotator.tokens[i]; //.toLowerCase(); // Case insensitive comparison
      tokenCounts[token] = (tokenCounts[token] || 0) + 1;
    });

    // Find the token with the highest count
    const compiledToken = Object.keys(tokenCounts).reduce((a, b) => {
      return tokenCounts[a] > tokenCounts[b] ? a : b;
    });

    compiledTokens.push(compiledToken);
  }

  return compiledTokens;
};

/**
 * Aligns annotations made by users to the texts they are raised against.
 * This is useful for IAA calculation and downloads. The function allows
 * optional skipping of a specified number of texts at the beginning of
 * the text list, which can be useful for pagination or selective processing.
 *
 * @param {String} projectId - The ID of the project to fetch annotations for.
 * @param {Number} [skipCount=null] - Optional. The number of text entries to skip
 *                                    at the beginning of the list. If null or not
 *                                    provided, no texts are skipped, and the first
 *                                    text's annotations are returned. When provided,
 *                                    skips the specified number of texts and returns
 *                                    the annotation for the next text.
 * @returns {Promise<Array>} - A promise that resolves to an array of annotations
 *                             aligned with their corresponding texts.
 */
export const getUserAnnotations = async (projectId, skipCount = null) => {
  const project = await Project.findById(
    {
      _id: projectId,
    },
    { _id: 0, owner: 0, maps: 0, __v: 0, updatedAt: 0 }
  )
    .populate("annotators")
    .lean();

  // Apply the skipCount if provided, else default to using all textIds
  const textIds =
    skipCount !== null
      ? project.texts.slice(skipCount, skipCount + 1)
      : project.texts;

  const annotators = project.annotators;
  const annotatorIds = annotators.map((a) => a._id.toString());
  const annotatorIdToUsername = Object.assign(
    {},
    ...annotators.map((a) => ({
      [a._id.toString()]: a.username,
    }))
  );

  const flagIdToName = Object.assign(
    {},
    ...project.flags.map((f) => ({
      [f._id.toString()]: f.name,
    }))
  );
  const tagIdToName = Object.assign(
    {},
    ...project.tags.map((t) => ({
      [t._id.toString()]: t.name,
    }))
  );

  const texts = await Text.find({ _id: { $in: textIds } }).lean();

  const annotations = await Annotations.find({
    textId: { $in: textIds },
  }).lean();

  // Separate tokenAnnotations and textAnnotations programmatically
  const tokenAnnotations = annotations.filter((ann) => ann.tokenId);
  const textAnnotations = annotations.filter((ann) => !ann.tokenId);

  // Convert annotations into {annotatorId: {textId: {tokenId: [annotations]}}} format
  const tokenAnnotationsAggregated = tokenAnnotations.reduce(
    (acc, annotation) => {
      const userIdStr = annotation.userId.toString();
      const username = annotatorIdToUsername[userIdStr];
      const textIdStr = annotation.textId.toString();
      const tokenIdStr = annotation.tokenId.toString();

      // Initialize annotatorId level if it doesn't exist
      if (!acc[username]) {
        acc[username] = {};
      }

      // Initialize textId level if it doesn't exist
      if (!acc[username][textIdStr]) {
        acc[username][textIdStr] = {};
      }

      // Initialize tokenId level if it doesn't exist, with an empty array to push annotations into
      if (!acc[username][textIdStr][tokenIdStr]) {
        acc[username][textIdStr][tokenIdStr] = {
          tag: [],
          replacement: null,
        };
      }

      // Push the current annotation into the correct place in the structure
      if (annotation.type === "tag") {
        acc[username][textIdStr][tokenIdStr][annotation.type].push(
          tagIdToName[annotation.value.toString()]
        );
      }
      if (annotation.type === "replacement" && !annotation.isSuggestion) {
        acc[username][textIdStr][tokenIdStr][annotation.type] =
          annotation.value;
      }

      return acc;
    },
    {}
  );

  const textAnnotationsAggregated = textAnnotations.reduce(
    (acc, annotation) => {
      const userIdStr = annotation.userId.toString();
      const username = annotatorIdToUsername[userIdStr];
      const textIdStr = annotation.textId.toString();

      // Initialize annotatorId level if it doesn't exist
      if (!acc[username]) {
        acc[username] = {};
      }

      // Initialize textId level if it doesn't exist
      if (!acc[username][textIdStr]) {
        acc[username][textIdStr] = { flag: [], save: false };
      }

      // Push the current annotation into the correct place in the structure
      if (annotation.type === "save") {
        acc[username][textIdStr][annotation.type] = true;
      }
      if (annotation.type === "flag") {
        acc[username][textIdStr][annotation.type].push(
          flagIdToName[annotation.value.toString()]
        );
      }

      return acc;
    },
    {}
  );

  const outputAnnotations = texts.map((text) => {
    const textIdStr = text._id.toString();

    let tags = {};
    let replacements = {};
    let flags = {};
    let saves = {};

    // Iterate over annotator ids
    for (const annotatorId of annotatorIds) {
      const annotatorIdStr = annotatorId.toString();
      const username = annotatorIdToUsername[annotatorIdStr];

      // Initialize tags and replacements arrays for each annotator if they don't exist
      tags[username] = tags[username] || [];
      replacements[username] = replacements[username] || [];
      flags[username] = flags[username] || [];
      saves[username] = saves[username] || [];

      // Iterate over tokens
      for (const token of text.tokens) {
        const tokenIdStr = token._id.toString();
        const tokenAnnotations =
          tokenAnnotationsAggregated[username]?.[textIdStr]?.[tokenIdStr];

        const annotatorReplacement =
          tokenAnnotations?.replacement ?? token.value;
        replacements[username].push(annotatorReplacement);

        // Handle tag
        const annotatorTag = tokenAnnotations?.tag ?? [];
        // console.log("annotatorTag: ", annotatorTag);
        if (annotatorTag.length > 0) {
          tags[username].push(annotatorTag); // Spread to merge arrays
        } else {
          // If no tags for this token, push an empty array to maintain structure
          tags[username].push([]);
        }
      }

      // Text-level annotations: Check if username exists for text-level flags
      if (
        textAnnotationsAggregated[username] &&
        textAnnotationsAggregated[username][textIdStr]?.flag
      ) {
        flags[username] = textAnnotationsAggregated[username][textIdStr].flag;
      } else {
        // If no text-level annotations exist for this annotator, ensure the structure is maintained
        flags[username] = [];
      }

      if (
        textAnnotationsAggregated[username] &&
        textAnnotationsAggregated[username][textIdStr]?.save
      ) {
        saves[username] = textAnnotationsAggregated[username][textIdStr].save;
      } else {
        // If no text-level annotations exist for this annotator, ensure the structure is maintained
        saves[username] = false;
      }
    }

    return {
      id: text._id,
      identifiers: text.identifiers,
      source: text.original,
      sourceTokens: text.original.split(" "),
      reference: text?.reference ?? "",
      tags,
      replacements,
      flags,
      saves,
    };
  });

  return outputAnnotations;
};
