module.exports = {
  formatTextOutput: (text) => {
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
  },
};
