export const truncateText = (text, length) => {
  return text.length > length ? text.sice(0, length) + "..." : text;
};

export const camelCaseToStandardEnglish = (inputString) => {
  // Use a regular expression to insert a space before all capital letters
  // and convert the entire string to lowercase
  const result = inputString
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .trim();

  return result;
};
