import Text from "../models/Text.js";
import Annotation from "../models/Annotations.js";

export const formatTextOutput = (text) => {
  /**
   * Formats output of API CRUD operations for UI rerendering
   */
  return {
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
  };
};

/**
 * Filters texts and annotations within a specific project based on a search term,
 * and identifies those that match either in the original text content or in annotations made by a specific user.
 * This function is particularly useful for finding texts and annotations that contain a specified word or phrase,
 * regardless of case, taking into account various types of annotations such as replacements.
 *
 * It returns a unique array of MongoDB ObjectId instances, representing the IDs of texts that match the given search criteria.
 * This allows for further processing or querying based on these text IDs.
 *
 * @param {Object} params - The parameters containing search criteria and identifiers.
 * @param {string} params.projectId - The ObjectId of the project within which to search texts.
 * @param {string} params.userId - The ObjectId of the user whose annotations are to be considered in the search.
 * @param {Array} params.textIds - An array of ObjectId instances representing the IDs of texts to be included in the search scope.
 * @param {string} params.searchTerm - The word or phrase to search for within text contents and annotation values.
 * @returns {Array} - An array of unique MongoDB ObjectId instances representing the IDs of texts that match the search criteria.
 */
export const filterTextsBySearchTerm = async ({
  projectId,
  userId,
  textIds,
  searchTerm,
}) => {
  try {
    // Precompile the regular expression for searchTerm to improve performance
    const regex = new RegExp(
      searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
      "i"
    );

    // Find matching texts by original content
    const textsSearchTermOriginal = await Text.find(
      {
        projectId: projectId,
        original: { $regex: regex },
      },
      { _id: 1 }
    ).lean();

    // Find matching annotations by replacement value
    const annotationsSearchReplacement = await Annotation.find(
      {
        textId: { $in: textIds },
        userId: userId,
        type: "replacement",
        value: { $regex: regex },
      },
      { textId: 1 }
    ).lean();

    // Combine and deduplicate text IDs from both sources
    const combinedTextIds = [
      ...textsSearchTermOriginal.map((t) => t._id),
      ...annotationsSearchReplacement.map((a) => a.textId),
    ];

    return [...new Set(combinedTextIds)];
  } catch (error) {
    console.error("Error filtering texts by search term:", error);
    return [];
  }
};

/**
 *
 */
export const processAnnotations = (data) => {
  Object.values(data).forEach((text) => {
    text.textAnnotations = [];
    text.flags = []; // TODO: populate this.

    const tokensArray = Object.values(text.tokens).map((token) => ({
      ...token,
      currentValue: token.value,
      tags: [],
      replacement: null,
      suggestion: null,
    }));

    text.annotations.forEach((annotation) => {
      try {
        let annotationType =
          annotation.type === "tag" ? "tags" : annotation.type;

        console.log("annotation type: ", annotationType);

        if (annotation.tokenId) {
          const token = tokensArray.find(
            (token) => token._id.toString() === annotation.tokenId.toString()
          );
          if (token) {
            // For each matched token, check the annotation type and update the token object.
            if (annotationType === "replacement") {
              console.log("adding replacement...");
              // Assuming only one replacement per token, directly assign it

              if (annotation.isSuggestion) {
                // Suggested replacement
                token["suggestion"] = annotation.value;
              } else {
                token[annotationType] = annotation.value;
              }
              // Update current value to replacement/suggestion
              token.currentValue = annotation.value;

              console.log(token);
            } else if (annotationType === "tags") {
              // For types expected to be arrays, use push. There should only be one tag value for each type.
              token[annotationType].push(annotation.value);
            } else {
              // Handle other annotation types as required
              console.log(`Unhandled annotation type: ${annotationType}`);
            }
          }
        } else {
          // Text-level annotation
          if (annotationType === "flag") {
            text.flags.push(annotation.value);
          } else {
            text.textAnnotations.push(annotation);
          }
        }
      } catch (error) {
        console.error("Processing annotation error:", error);
      }
    });

    // Reconstruct the tokens object from the tokens array
    text.tokens = tokensArray.reduce((acc, token) => {
      acc[token.index] = token;
      return acc;
    }, {});

    // Remove the original annotations array if it's no longer needed
    // delete text.annotations;
  });

  return data;
};

// export const textFilterAggregate = async () => {}
