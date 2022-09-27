export const getCorpusLength = (corpus) => {
  return Object.keys(corpus).length;
};

export const normaliseSpecialTokens = (specialTokens) => {
  /**
   * Splits list of special tokens on comma
   */
  return specialTokens
    .split(",")
    .map((i) => i.trim())
    .filter((n) => n); // remove empty items (e.g. if trailing , on input)
};
