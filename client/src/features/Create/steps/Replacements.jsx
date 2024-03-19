import { useState } from "react";
import { Alert, AlertTitle, Box, Button, TextField } from "@mui/material";
import { ValidateCreateReplacements } from "../../../shared/utils/validation";

const Replacements = ({ values, updateValue }) => {
  return (
    <>
      <Box p={1}>
        <Alert severity="info">
          <AlertTitle>Tip!</AlertTitle>
          Streamline your corpus effortlessly with our replacement feature,
          which automates the detection and update of specific words (tokens).
          As of now, we cater to single-word replacements, but exciting updates
          are on the horizon! Ready to optimise your project? You can either
          manually input or paste your replacement dictionary directly in JSON
          format.
        </Alert>
      </Box>
      <JsonEditor values={values} updateValue={updateValue} />
    </>
  );
};

const JsonEditor = ({ values, updateValue }) => {
  const [error, setError] = useState("");

  const validateJson = (json) => {
    return ValidateCreateReplacements(json, setError);
  };

  const handleJsonChange = (event) => {
    const { value } = event.target;
    updateValue({ key: "replacementDictionary", value });
    if (value.trim() === "") {
      setError("");
      updateValue({ key: "replacementDictionary", value: "" }); // Update the parent state with an empty object
    } else {
      validateJson(value);
      updateValue({ key: "replacementDictionary", value });
    }
  };

  const prettifyJson = () => {
    try {
      const obj = JSON.parse(values.replacementDictionary);
      updateValue({
        key: "replacementDictionary",
        value: JSON.stringify(obj, null, 2),
      });
      setError("");
    } catch (e) {
      setError("Cannot prettify invalid JSON.");
    }
  };

  const handleUndo = () => {
    updateValue({ key: "replacementDictionary", value: "{}" });
  };

  return (
    <Box p={1} sx={{ width: "100%", margin: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          mt: "10px",
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={prettifyJson}
          disabled={values.replacementDictionary === "{}"}
        >
          Prettify JSON
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleUndo}
          disabled={values.replacementDictionary === "{}"}
        >
          Reset
        </Button>
      </Box>
      <TextField
        label="Replacements Editor"
        multiline
        fullWidth
        minRows={10}
        value={values.replacementDictionary}
        onChange={handleJsonChange}
        error={Boolean(error)}
        helperText={
          error ||
          "Enter a valid JSON object. Keys and values must be single words."
        }
        margin="normal"
        variant="outlined"
      />
    </Box>
  );
};

export default Replacements;
