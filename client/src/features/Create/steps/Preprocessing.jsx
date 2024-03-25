import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Stack,
  FormLabel,
  FormGroup,
  FormControlLabel,
  FormControl,
  Checkbox,
  Paper,
  Skeleton,
  Box,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { getCorpusMetrics } from "../../../shared/utils/create";

const Preprocessing = ({ values, updateValue }) => {
  const corpus = useMemo(() => Object.values(values["corpus"]), [values]);
  const [previewContent, setPreviewContent] = useState(
    "Upload texts to preview"
  );
  const [corpusDetails, setCorpusDetails] = useState({
    corpusSize: 0,
    vocabSize: 0,
    tokenSize: 0,
  });
  const [originalCorpusDetails, setOriginalCorpusDetails] = useState({});

  const processCorpusDetails = useCallback((corpusArray) => {
    return getCorpusMetrics(corpusArray);
  }, []);

  useEffect(() => {
    if (!corpus.length) return;

    let processedCorpus = corpus.map((doc) =>
      doc.text.replace(/\s+/g, " ").trim()
    );

    if (values["preprocessLowerCase"]) {
      processedCorpus = processedCorpus.map((text) => text.toLowerCase());
    }

    if (values["preprocessRemoveDuplicates"]) {
      processedCorpus = [...new Set(processedCorpus)];
    }

    if (values["preprocessRemoveChars"]) {
      const charsToRemove = new RegExp(
        `[${values["preprocessRemoveCharSet"].replace(
          /[-/\\^$*+?.()|[\]{}]/g,
          "\\$&"
        )}]`,
        "g"
      );
      processedCorpus = processedCorpus.map((text) =>
        text.replace(charsToRemove, "").replace(/\s+/g, " ").trim()
      );
    }

    /**
     * Update preview data whenever a text file is uploaded or the pre-processing
     * actions are changed.
     */
    if (!Object.keys(originalCorpusDetails).length) {
      setOriginalCorpusDetails(
        processCorpusDetails(corpus.map((doc) => doc.text))
      );
    }

    setPreviewContent(processedCorpus.join("\n"));
    setCorpusDetails(processCorpusDetails(processedCorpus));
  }, [corpus, values, processCorpusDetails, originalCorpusDetails]);

  const actionAppliedToCorpus =
    values["preprocessLowerCase"] ||
    values["preprocessRemoveDuplicates"] ||
    values["preprocessRemoveChars"];

  return (
    <Grid container item spacing={2}>
      <Grid item xs={12}>
        <Metrics
          corpusDetails={corpusDetails}
          actionAppliedToCorpus={actionAppliedToCorpus}
          originalCorpusDetails={originalCorpusDetails}
        />
      </Grid>
      <Grid item xs={12}>
        <Controls values={values} updateValue={updateValue} />
      </Grid>
      <Grid item xs={12}>
        <TextField
          id="outlined-multiline-flexible"
          label="Corpus Preview"
          multiline
          maxRows={10}
          value={previewContent}
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
    </Grid>
  );
};

const Metrics = ({
  corpusDetails,
  actionAppliedToCorpus,
  originalCorpusDetails,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-around">
        {Object.keys(corpusDetails).map((key) => (
          <Grid item xs={3} key={`grid-item-${key}`}>
            <Stack direction="column" alignItems="center">
              <MetricWithDiff
                actionAppliedToCorpus={actionAppliedToCorpus}
                originalCorpusDetails={originalCorpusDetails}
                corpusDetails={corpusDetails}
                name={key}
              />
              <Typography
                id="section-subtitle"
                key={`detail-subtitle-${key}`}
                sx={{ textTransform: "capitalize" }}
              >
                {key.replace("Size", "")} Size
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Box>
    </Paper>
  );
};

const Controls = ({ values, updateValue }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <FormControl sx={{ m: 1 }} component="fieldset">
        <FormLabel component="legend">Preprocessing Actions</FormLabel>
        <FormGroup style={{ display: "flex", flexDirection: "row" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={values["preprocessLowerCase"]}
                onChange={(e) => {
                  updateValue({
                    key: "preprocessLowerCase",
                    value: e.target.checked,
                  });
                }}
                name="remove-casing"
                title="Removes casing from characters. This can reduce annotation effort."
              />
            }
            label="Lower Case"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={values["preprocessRemoveChars"]}
                onChange={(e) => {
                  updateValue({
                    key: "preprocessRemoveChars",
                    value: e.target.checked,
                  });
                }}
                title="Removes special characters from corpus. This can reduce annotation effort."
                name="remove-chars"
              />
            }
            label="Remove Characters"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={values["preprocessRemoveDuplicates"]}
                onChange={(e) => {
                  updateValue({
                    key: "preprocessRemoveDuplicates",
                    value: e.target.checked,
                  });
                }}
                title="Removes duplicate documents from your corpus. This can reduce annotation effort."
                name="remove-duplicates"
              />
            }
            label="Remove Duplicates"
          />
          <TextField
            id="remove-char-text-field"
            label="Characters To Remove"
            variant="standard"
            size="small"
            autoComplete="off"
            value={values["preprocessRemoveCharSet"]}
            onChange={(e) => {
              updateValue({
                key: "preprocessRemoveCharSet",
                value: e.target.value,
              });
            }}
            disabled={!values["preprocessRemoveChars"]}
            placeholder={values["preprocessRemoveCharSet"]}
          />
        </FormGroup>
      </FormControl>
    </Paper>
  );
};

const iconStyle = {
  margin: "0rem 0.25rem",
  fontSize: "1rem",
};

const MetricWithDiff = ({
  actionAppliedToCorpus,
  originalCorpusDetails,
  corpusDetails,
  name,
}) => {
  console.log("name: ", name);

  const comparisonResult = useMemo(() => {
    const originalValue = originalCorpusDetails[name];
    const newValue = corpusDetails[name];
    const difference = Math.abs(
      ((originalValue - newValue) * 100) / originalValue
    );
    const isDecreased = originalValue > newValue;

    return {
      isChanged: originalValue !== newValue,
      color: isDecreased ? "#2e7d32" : "#c62828",
      icon: isDecreased ? (
        <ArrowDownwardIcon sx={iconStyle} />
      ) : (
        <ArrowUpwardIcon sx={iconStyle} />
      ),
      difference: Math.round(difference),
    };
  }, [originalCorpusDetails[name], corpusDetails[name]]);

  if (!name) {
    return <Skeleton width={30} />;
  }

  if (actionAppliedToCorpus) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-evenly"
      >
        <Stack direction="row" alignItems="center">
          <Typography color="text.secondary">
            {originalCorpusDetails[name].toLocaleString()}
          </Typography>
          <ArrowRightAltIcon sx={iconStyle} />
          <Typography>{corpusDetails[name].toLocaleString()}</Typography>
          {comparisonResult.isChanged && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                fontSize: "0.75rem",
                color: comparisonResult.color,
              }}
            >
              {comparisonResult.icon}
              {comparisonResult.difference}%
            </Stack>
          )}
        </Stack>
      </Box>
    );
  } else {
    return (
      <Typography fontWeight="bold">
        {corpusDetails[name].toLocaleString()}
      </Typography>
    );
  }
};

export default Preprocessing;
