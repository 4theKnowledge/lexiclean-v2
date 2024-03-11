import { camelCaseToStandardEnglish } from "./general";

export const downloadFile = ({ data, name }) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${name.slice(0, 25).replace(" ", "_")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getReadableString = (variableName) => {
  // Check for a manual mapping first
  const manualMapping = {
    specialTokens: "special tokens",
    parallelCorpus: "parallel corpus",
    createdAt: "created on",
    removeLowerCase: "Casing removed",
    removeDuplicates: "Duplicates removed",
    digitsIV: "Digits are in-vocabulary",
    removeChars: "Characters removed",
  };

  // Return the manual mapping if it exists
  if (manualMapping[variableName]) {
    return manualMapping[variableName];
  }

  // Otherwise, use the automated conversion
  return camelCaseToStandardEnglish(variableName);
};
