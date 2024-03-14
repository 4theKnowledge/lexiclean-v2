import mongoose from "mongoose";

/**
 * Generates an aggregation pipeline to find annotations with token data for given token IDs.
 * It looks up corresponding texts from the 'texts' collection and filters tokens based on the provided token IDs.
 *
 * @param {string} type - Type of annotation for which to find annotations.
 * @param {string[]} textIds - Array of text IDs for which to find annotations and corresponding token data.
 * @returns {Object[]} Aggregation pipeline array.
 */
export const annotationsWithTokenDataPipeline = ({
  type,
  isSuggestion = false,
  textIds,
}) => {
  const textObjectIds = textIds.map((id) => mongoose.Types.ObjectId(id));

  return [
    {
      $match: {
        type,
        isSuggestion,
        textId: { $in: textObjectIds },
      },
    },
    {
      $lookup: {
        from: "texts",
        localField: "textId",
        foreignField: "_id",
        as: "text",
      },
    },
    {
      $unwind: "$text",
    },
    {
      $addFields: {
        filteredTokens: {
          $filter: {
            input: "$text.tokens",
            as: "token",
            cond: {
              $eq: ["$$token._id", "$tokenId"],
            },
          },
        },
      },
    },
    {
      $unwind: "$filteredTokens",
    },
    {
      $addFields: {
        "filteredTokens.currentValue": "$value",
        "filteredTokens.originalValue": "$filteredTokens.value",
        "filteredTokens.textId": "$textId",
        "filteredTokens.userId": "$userId",
        "filteredTokens.annotationId": "$_id",
      },
    },
    {
      $replaceRoot: { newRoot: "$filteredTokens" },
    },
    {
      $addFields: {
        tokenId: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
        index: 0,
        value: 0,
      },
    },
  ];
};
