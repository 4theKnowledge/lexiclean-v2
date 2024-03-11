module.exports = {
  getReplacementFrequencies: (texts, top_n = Infinity) => {
    /**
     * Creates a frequency dictionary of replacements made on a project.
     * If top_n is provided, returns only the top N replacements.
     */

    // Create replacement dictionary
    const tokensReplaced = texts
      .flatMap((text) => text.tokens)
      .map((token) => token.token)
      .filter((token) => token.replacement);
    const replacementPairs = tokensReplaced.map((token) => ({
      token: token.value,
      replacement: token.replacement,
    }));

    // Get counts of replacements made
    let replacementsFreq = {};
    replacementPairs.map((pair) => {
      replacementsFreq[pair.token] = (replacementsFreq[pair.token] || 0) + 1;
    });

    // Filter out duplicate replacements
    let uniqueReplacementPairs = replacementPairs.filter(
      (thing, index, self) =>
        index ===
        self.findIndex(
          (t) => t.token === thing.token && t.replacement === thing.replacement
        )
    );

    const replacements = uniqueReplacementPairs
      .map((pair) => ({
        [pair.token]: {
          replacement: pair.replacement,
          count: replacementsFreq[pair.token],
        },
      }))
      .reduce((r, c) => Object.assign(r, c), {});

    let replacementsSorted;
    // If top_n is specified, slice the array to return only top N replacements
    if (top_n !== Infinity) {
      replacementsSorted = Object.fromEntries(
        Object.entries(replacements).sort()
      );
      replacementsSorted = Object.entries(replacementsSorted).sort(
        (a, b) => b[1].count - a[1].count
      );

      replacementsSorted = replacementsSorted.slice(0, top_n);

      replacementsSorted = Object.fromEntries(replacementsSorted);
    } else {
      // Sort key alphabetically
      replacementsSorted = Object.fromEntries(
        Object.entries(replacements).sort()
      );
    }

    return replacementsSorted;
  },
  formatOutputTexts: (texts) => {
    /**
     * Formats texts into leaner format than documents in the NoSQL db.
     */
    return texts.map((text) => {
      const source = text.original;
      const target = text.tokens
        .map((t) => (t.token.replacement ? t.token.replacement : t.token.value))
        .join(" ");
      return {
        identifiers: text.identifiers,
        reference: text.reference ? text.reference : "",
        source: source,
        source_tokens: source.split(" "),
        target: target,
        target_tokens: target.split(" "),
        mentions: [],
        saved: text.saved,
      };
    });
  },
};
