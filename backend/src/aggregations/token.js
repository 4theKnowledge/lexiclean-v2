import mongoose from "mongoose";

/**
 * Creates a MongoDB aggregation pipeline to retrieve tokens from texts in a specified project.
 * Filters tokens by a search term (if provided) and excludes tokens by IDs. Matches all tokens if no search term is given.
 *
 * @param {Object} params - Parameters for the pipeline.
 * @param {string} params.projectId - MongoDB ObjectId of the project.
 * @param {string} [params.searchTerm=null] - Term to filter tokens. Defaults to null to ensure empty strings are not erroneously matched.
 * @param {Array<string>} [params.excludeTokenIds=[]] - Array of token ObjectIds to exclude.
 *
 * @returns {Array<Object>} - Aggregation pipeline for filtering and retrieving tokens.
 *
 * Steps:
 * 1. Match documents by projectId.
 * 2. Project tokens based on search criteria and exclusion list.
 * 3. Unwind tokens for individual processing.
 * 4. Add textId and tokenId fields to link tokens to their texts.
 * 5. Remove the original _id field.
 */
export const textTokenSearchPipeline = ({
  projectId,
  searchTerm = null,
  excludeTokenIds = [],
}) => [
  {
    $match: {
      projectId: mongoose.Types.ObjectId(projectId),
    },
  },
  {
    $project: {
      tokens: {
        $filter: {
          input: "$tokens",
          as: "token",
          cond: {
            $and: [
              searchTerm !== null
                ? {
                    $regexMatch: {
                      input: "$$token.value",
                      regex: searchTerm,
                      options: "i",
                    },
                  }
                : {},
              {
                $not: [
                  {
                    $in: [
                      "$$token._id",
                      excludeTokenIds.map((id) => mongoose.Types.ObjectId(id)),
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      _id: 1,
    },
  },
  {
    $unwind: "$tokens",
  },
  {
    $addFields: {
      "tokens.textId": "$_id", // Add the original document _id as textId inside the token object
    },
  },
  {
    $replaceRoot: { newRoot: "$tokens" }, // Make the token object the root of the output documents
  },
  {
    $addFields: {
      tokenId: "$_id", // Add tokenId field with the value of _id
    },
  },
  {
    $project: {
      _id: 0, // Exclude the original _id field
    },
  },
];

export const singleTokenFromTextPipeline = ({ textId, tokenId }) => [
  {
    // Match the document with the specified _id
    $match: { _id: mongoose.Types.ObjectId(textId) },
  },
  {
    // Deconstruct the tokens array to make each token a document
    $unwind: "$tokens",
  },
  {
    // Match the token with the specified _id
    $match: { "tokens._id": mongoose.Types.ObjectId(tokenId) },
  },
  {
    // Optionally, restructure the output document to include only the matched token
    $replaceRoot: { newRoot: "$tokens" },
  },
];
