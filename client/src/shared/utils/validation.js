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
  if (typeof corpus === "object" && corpus !== null && !Array.isArray(corpus)) {
    return true;
  }
  return false;
};

export const ValidateCreatePreannotation = (replacementDictionary) => {
  if (Object.keys(replacementDictionary).length === 0) {
    return true;
  }
};

export const ValidateCreateReview = (
  detailsValid,
  schemaValid,
  uploadValid,
  preannotationValid
) => {
  return checkValid([
    detailsValid,
    schemaValid,
    uploadValid,
    preannotationValid,
  ]);
};
