import mongoose from "mongoose";
/**
 * Returns an array of tokens matching a given search term.
 */
export const textTokenSearchPipeline = ({
  projectId,
  searchTerm,
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
              {
                $regexMatch: {
                  input: "$$token.value",
                  regex: searchTerm,
                  options: "i",
                },
              },
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
