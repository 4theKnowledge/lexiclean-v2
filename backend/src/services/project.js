function extractTags(token, tagSets) {
  return Object.keys(tagSets)
    .filter((key) => key !== "rp")
    .reduce((tags, key) => ({ ...tags, [key]: tagSets[key].has(token) }), {});
}

module.exports = {
  createAnnotatedTokens: function (
    projectId,
    textId,
    tokens,
    tagSets,
    replacements,
    annotateDigits = false
  ) {
    const hasReplacements = Object.values(tagSets).includes("rp");

    return tokens.map((token, index) => {
      const tokenTags = extractTags(token, tagSets);
      const isDigit = annotateDigits && /^\d+$/g.test(token);

      return {
        value: token,
        index,
        tags: isDigit ? { ...tokenTags, en: true } : tokenTags,
        replacement:
          hasReplacements && tagSets.rp.has(token) ? replacements[token] : null,
        suggestion: null,
        active: true,
        textId,
        projectId,
      };
    });
  },
};
//   createAnnotatedTokens: function (
//     projectId,
//     textId,
//     tokens,
//     mapSets,
//     rpObj,
//     preannotationDigitsIV
//   ) {
//     const hasReplacementDict = Object.values(mapSets).includes("rp");

//     let annotatedTokens = tokens.map((token, index) => ({
//       value: token,
//       index: index,
//       tags: Object.assign(
//         ...Object.keys(mapSets)
//           .filter((key) => key !== "rp")
//           .map((key) => ({ [key]: mapSets[key].has(token) }))
//       ),
//       replacement:
//         hasReplacementDict && mapSets.rp.has(token) ? rpObj[token] : null,
//       suggestion: null,
//       active: true,
//       textId: textId,
//       projectId: projectId,
//     }));

//     if (preannotationDigitsIV) {
//       annotatedTokens = annotatedTokens.map((token) => {
//         const isDigit = token.value.match(/^\d+$/g) !== null;
//         if (isDigit) {
//           // check if token is digit - if so, classify as English
//           return { ...token, tags: { ...token.tags, en: true } };
//         } else {
//           return token;
//         }
//       });
//     }
//     return annotatedTokens;
//   },
// };
