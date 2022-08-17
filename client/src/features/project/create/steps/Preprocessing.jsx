import { useEffect, useState } from "react";
// import { Card, Col, Form, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCorpus,
  selectPreprocessingActions,
  setStepData
} from "../createStepSlice";

import { Grid, TextField, Typography, Stack, FormGroup, FormControlLabel, Checkbox } from "@mui/material"

const Preprocessing = () => {
  const dispatch = useDispatch();
  const actions = useSelector(selectPreprocessingActions);
  const corpus = useSelector(selectCorpus);

  // Preprocessing
  const [previewContent, setPreviewContent] = useState(
    "Upload texts to preview"
  );
  const [corpusSize, setCorpusSize] = useState();
  const [vocabSize, setVocabSize] = useState();
  const [tokenSize, setTokenSize] = useState();

  useEffect(() => {
    // Update preview data whenever a text file is uploaded and the pre-processing
    // actions are changed

    if (corpus && Object.keys(corpus).length === 0) {
      // Reset preview content
      setPreviewContent("Upload texts to preview");
    } else {
      // Remove multiple white space and trim
      // setCorpus(
      //   Object.values(corpus).map((text) => text.replace(/\s+/g, " ").trim())
      // );
      let preCorpus = Object.values(corpus).map((text) =>
        text.replace(/\s+/g, " ").trim()
      );
      // : corpus.map((text) => text.replace(/\s+/g, " ").trim());

      if (actions.lowercase) {
        preCorpus = preCorpus.map((text) => text.toLowerCase());
      }
      if (actions.removeDuplicates) {
        preCorpus = [...new Set(preCorpus)];
      }
      if (actions.removeChars) {
        const escapedChars = [
          "[",
          "]",
          "{",
          "}",
          "(",
          ")",
          "*",
          "+",
          "?",
          "|",
          "^",
          "$",
          ".",
          "\\",
        ];
        const regexCharsEscaped = actions.removeCharSet
          .split("")
          .map((char) => (escapedChars.includes(char) ? `\\${char}` : char));
        const regex = new RegExp("[" + regexCharsEscaped + "]", "g");
        preCorpus = preCorpus.map((text) => text.replace(regex, " "));
        // Remove multiple white space and trim
        preCorpus = preCorpus.map((text) => text.replace(/\s+/g, " ").trim());
      }

      // Add data uploaded to preview content
      setPreviewContent(preCorpus.slice(0, 250).join("\n"));

      setCorpusSize(preCorpus.length);
      setVocabSize(
        new Set(preCorpus.map((text) => text.split(" ")).flat()).size
      );
      setTokenSize(preCorpus.map((text) => text.split(" ")).flat().length);
    }
  }, [corpus, actions]);

  return (
    <Grid item>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox defaultChecked />}
          label="Remove casing"
          title="Removes casing from characters. This can reduce annotation effort."
          checked={actions.lowercase}
          onChange={(e) => {
            dispatch(setStepData({ lowercase: e.target.checked }));
          }}
        />
        <FormControlLabel
          control={<Checkbox />}
          label="Remove characters"
          title="Removes special characters from corpus. This can reduce annotation effort."
          checked={actions.removeChars}
          onChange={(e) => {
            dispatch(setStepData({ removeChars: e.target.checked }));
          }}
        />
        <TextField
          size="small"
          disabled={!actions.removeChars}
          value={actions.removeCharSet}
          placeholder={actions.removeCharSet}
          autoComplete="off"
          onChange={(e) => {
            dispatch(setStepData({ removeCharSet: e.target.value }));
          }}

        />
        <FormControlLabel
          control={<Checkbox />}
          label="Remove duplicates"
          checked={actions.removeDuplicates}
          onChange={(e) => {
            dispatch(
              setStepData({ removeDuplicates: e.target.checked })
            );
          }}
          title="Removes duplicate documents from your corpus. This can reduce annotation effort"
        />
      </FormGroup>
      <Stack direction="row" spacing={2} p={4}>
        <Typography variant="button">
          Corpus Size: {corpusSize}
        </Typography>
        <Typography variant="button">

          Vocabulary Size: {vocabSize}
        </Typography>
        <Typography variant="button">
          Token Count: {tokenSize}
        </Typography>
      </Stack>
      <TextField
        value={previewContent}
        label="Corpus Preview"
        variant="outlined"
        multiline
        maxRows={10}
        fullWidth
        helperText="Corpus after preprocessing steps"
        disabled
      />
    </Grid >
  );
};

export default Preprocessing;