const checkValid = (arr) => arr.every(Boolean);

export const ValidateCreateDetails = (projectName, projectDescription) => {
  const validName = projectName !== "";
  const validDescription = projectDescription !== "";
  return checkValid([validName, validDescription]);
};

export const ValidateCreateSchema = () => {
  return true;
};

export const ValidateCreateUpload = (corpus) => {
  if (corpus.length > 0) {
    return true;
  }
  return false;
};

export const ValidateCreateSettings = () => {
  return true;
};

export const ValidateCreateReview = (
  detailsValid,
  schemaValid,
  uploadValid,
  preannotationValid,
  replacementsValid
) => {
  return checkValid([
    detailsValid,
    schemaValid,
    uploadValid,
    preannotationValid,
    replacementsValid,
  ]);
};

export const ValidateCreateReplacements = (json, setError = () => {}) => {
  try {
    const obj = JSON.parse(json);
    const keys = Object.keys(obj);

    // Check for unique keys and single-word keys/values
    const hasInvalidKeysOrValues = keys.some(
      (key) =>
        key.includes(" ") ||
        typeof obj[key] !== "string" ||
        obj[key].includes(" ")
    );

    if (hasInvalidKeysOrValues) {
      setError("Keys and values must be single words without spaces.");
      return false;
    }

    setError("");
    return true;
  } catch (e) {
    setError("Invalid JSON format.");
    return false;
  }
};
