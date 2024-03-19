export const updateTexts = (
  action,
  texts,
  textTokenIds,
  focusTokenId,
  replacement
) => {
  /**
   * Performs operations on a set of texts comprised of token(s) such as apply, accept, or delete.`textTokenIds` = {textId: [tokenId, ..., tokenId]}`
   */

  let updatedTexts = texts;

  Object.keys(textTokenIds).forEach((textId) => {
    // Check if the text exists for the given textId
    if (!texts[textId]) {
      // console.warn(`No text found for textId: ${textId}`);
      return; // Skip this iteration if text is undefined
    }

    const tokenIdsToUpdate = textTokenIds[textId];

    const text = texts[textId];
    const newTokens = Object.values(text.tokens).map((token) => {
      if (tokenIdsToUpdate.includes(token._id)) {
        switch (action) {
          case "apply":
            if (focusTokenId.toString() === token._id.toString()) {
              // Only token action was applied to is a replacement, rest are suggestions.
              return {
                ...token,
                replacement: replacement,
                currentValue: replacement,
              };
            } else {
              return {
                ...token,
                suggestion: replacement,
                currentValue: replacement,
              };
            }
          case "delete":
            return {
              ...token,
              replacement: null,
              suggestion: null,
              currentValue: token.value,
            };
          case "accept":
            return {
              ...token,
              replacement: token.suggestion,
              currentValue: token.suggestion,
            };
          default:
            throw new Error("Token operation/action not specified correctly");
        }
      } else {
        return token;
      }
    });

    updatedTexts = {
      ...updatedTexts,
      [textId]: { ...text, tokens: newTokens },
    };
  });

  return updatedTexts;
};

export const updateTextTokenTags = ({
  action,
  texts,
  textTokenIds,
  focusTokenId,
  entityLabelId,
}) => {
  /**
   * Performs operations on a set of texts comprised of token(s) such as apply, accept, or delete. `textTokenIds` = {textId: [tokenId, ..., tokenId]}`
   */

  let updatedTexts = texts;

  Object.keys(textTokenIds).forEach((textId) => {
    // Check if the text exists for the given textId
    if (!texts[textId]) {
      // console.warn(`No text found for textId: ${textId}`);
      return; // Skip this iteration if text is undefined
    }
    const tokenIdsToUpdate = textTokenIds[textId];

    const text = texts[textId];
    const newTokens = Object.values(text.tokens).map((token) => {
      if (tokenIdsToUpdate.includes(token._id)) {
        switch (action) {
          case "apply":
            return {
              ...token,
              tags: [...token.tags, entityLabelId],
            };
          case "delete":
            return {
              ...token,
              tags: token.tags.filter((t) => t !== entityLabelId),
            };
          // case "accept":
          //   return {
          //     ...token,
          //   };
          default:
            throw new Error("Token operation/action not specified correctly");
        }
      } else {
        return token;
      }
    });

    updatedTexts = {
      ...updatedTexts,
      [textId]: { ...text, tokens: newTokens },
    };
  });

  return updatedTexts;
};
