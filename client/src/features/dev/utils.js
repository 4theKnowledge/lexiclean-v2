export const getTokenDetails = (sentence) => {
  let position = 0;
  const wordsList = sentence.split(" ");

  const wordDetails = wordsList.map((word, index) => {
    // +1 to account for space
    position = index && wordsList[index - 1].length + position + 1;
    return {
      word: word,
      start: position,
      end: position + word.length - 1,
    };
  });

  return wordDetails;
};
