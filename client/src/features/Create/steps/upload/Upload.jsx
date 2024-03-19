import { useEffect, useState } from "react";
import {
  Grid,
  Stack,
  Typography,
  Button,
  Box,
  Alert,
  Tooltip,
  Modal,
  TextField,
  FormGroup,
  FormControlLabel,
  Chip,
  IconButton,
  Checkbox,
  AlertTitle,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import UploadIcon from "@mui/icons-material/Upload";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";

import { getCorpusLength } from "../../../../shared/utils/create";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 600,
  overflowY: "auto",
  bgcolor: "background.light",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Upload = (props) => {
  const { values, updateValue } = props;
  const corpus = values["corpus"];
  const corpusType = values["corpusType"];

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const resetAlert = () => {
    setShowAlert(false);
    setAlertMessage("");
  };

  const resetCorpus = () => {
    updateValue({ key: "corpus", value: [] });
    updateValue({ key: "corpusFileName", value: null });
  };

  const [showModal, setShowModal] = useState(false);
  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const parseCorpus = (corpus) => {
    /**
     * Parses corpus and limits number of examples shown
     */
    const limit = 25;
    if (Array.isArray(corpus)) {
      return corpus.slice(0, limit).join("\n");
    } else {
      corpus = Object.fromEntries(Object.entries(corpus).slice(0, limit));
      return JSON.stringify(corpus, null, 2);
    }
  };

  useEffect(() => {
    if (corpus && corpus === "") {
      // Reset corpus and remove file meta data if user erases all contents of corpus paste bin
      resetCorpus();
    }
  }, [corpus]);

  const readFile = (corpusType, fileMeta) => {
    let reader = new FileReader();
    reader.readAsText(fileMeta);
    reader.onload = () => {
      const fileExt = fileMeta.name.split(".").slice(-1)[0];
      const fileName = fileMeta.name;

      resetAlert();
      resetCorpus();

      let corpus;

      if (fileExt === "txt" && corpusType === "scratch") {
        corpus = reader.result
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => line.replace("\r", ""));

        updateValue({
          key: "corpus",
          value: Object.assign(
            {},
            ...corpus.map((text, index) => ({ [index]: text }))
          ),
        });
        updateValue({ key: "corpusFileName", value: fileName });
        updateValue({ key: "corpusType", value: corpusType });
      }
      if (fileExt === "csv" && corpusType === "identifiers") {
        // Uploading data with identifiers

        const rowsObject = reader.result
          .split("\n")
          .filter((line) => line !== "")
          .map((line) => ({
            [line.split(",")[0].trim()]: line
              .split(",")
              .slice(1)
              .join(",")
              .trim(),
          }));

        // Combine row objects into { id: document } objects
        const csvData = Object.assign({}, ...rowsObject);

        updateValue({ key: "corpus", value: csvData });
        updateValue({ key: "corpusFileName", value: fileName });
        updateValue({ key: "corpusType", value: corpusType });
      }

      if (fileExt === "json" && corpusType === "parallel") {
        corpus = JSON.parse(reader.result);

        corpus = Object.assign(
          {},
          ...corpus.map((text, index) => ({
            [text.id !== undefined ? text.id : index]: text,
          }))
        );

        updateValue({ key: "corpus", value: corpus });
        updateValue({ key: "corpusFileName", value: fileName });
        updateValue({ key: "corpusType", value: corpusType });
      }
    };
    reader.onloadend = () => {
      reader = new FileReader();
    };
  };

  return (
    <Grid item xs={12} container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          <AlertTitle>Tip!</AlertTitle>
          Upload your text dataset (corpus) here to normalize and, optionally,
          tag entities. For details on supported corpus formats, click the help
          icon. Note: The editor becomes read-only after you upload a file.
        </Alert>
        {showAlert && <Alert severity="error">{alertMessage}</Alert>}
      </Grid>
      <Grid
        item
        xs={12}
        container
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <Chip
            label={getCorpusLength(corpus)}
            icon={<ArticleIcon />}
            title="Number of texts in corpus"
            style={{ cursor: "help" }}
          />
          <Chip
            label={values["corpusFileName"]}
            icon={<FilePresentIcon />}
            title="Name of uploaded file"
            style={{ cursor: "help" }}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Upload a newline separated text corpus without annotations. Tokenization must be done prior to upload.">
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
            >
              Upload Corpus
              <input
                id="corpus-text-file"
                type="file"
                hidden
                onChange={(e) => readFile("scratch", e.target.files[0])}
                accept=".txt"
              />
            </Button>
          </Tooltip>
          <Tooltip title="Upload a corpus with identifiers in CSV format. Tokenization must be done prior to upload. Click the help icon for more information.">
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
              disabled
            >
              Upload with identifiers
              <input
                id="ontology-file"
                type="file"
                hidden
                onChange={(e) => readFile("identifiers", e.target.files[0])}
                accept=".csv"
              />
            </Button>
          </Tooltip>
          <Tooltip title="Upload a parallel corpus. Tokenization must be done prior to upload. Click the help icon for more information.">
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              size="small"
              disabled
            >
              Upload parallel corpus
              <input
                id="json-parallel-corpus-file"
                type="file"
                hidden
                onChange={(e) => readFile("parallel", e.target.files[0])}
                accept=".json"
              />
            </Button>
          </Tooltip>
          <IconButton onClick={handleOpen}>
            <HelpCenterIcon />
          </IconButton>
          <Modal
            open={showModal}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h5" mb={2}>
                How to upload a corpus
              </Typography>
              <Typography variant="h6" gutterBottom>
                Standard Upload
              </Typography>
              <Typography variant="paragraph">
                Click "upload corpus" to upload a corpus of newline separated
                texts. Please note that tokenization must be performed prior to
                upload as LexiClean only splits on whitespace.
              </Typography>
              <Typography variant="h6" gutterBottom mt={2}>
                Upload Corpus with identifiers
              </Typography>
              <Typography variant="paragraph">Lorem ipsum</Typography>
              <Typography variant="h6" gutterBottom mt={2}>
                Parallel Corpus Upload
              </Typography>
              <Typography variant="paragraph">
                Lorem ipsum... Duplicate ids are not permitted and will not be
                preserved, only the first will be kept.
              </Typography>
              {/* <Typography>
                Click "upload annotated corpus" to upload an annotated corpus.
                This is useful if you want to perform error correction on a
                corpus. The annotated corpus must be in the form of single-label
                mention level annotation. Preprocessing currently cannot be
                performed on annotated corpora.{" "}
                <strong>
                  Entity labels must be exactly the same as those in the
                  uploaded schema but in hierarchical format
                </strong>{" "}
                (note: fullName is automatically created by QuickGraph).
                <br />
                Example schema:
                <pre>
                  {JSON.stringify(
                    [
                      {
                        name: "person",
                        fullName: "person",
                        children: [
                          { name: "president", fullName: "person/president" },
                        ],
                      },
                    ],
                    null,
                    2
                  )}
                </pre>
                <br />
                Example document:
                <pre>
                  {JSON.stringify(
                    [
                      {
                        original: "The president Barack Obama.",
                        tokens: ["The", "president", "Barack", "Obama", "."],
                        mentions: [
                          { start: 2, end: 3, label: "person" },
                          { start: 2, end: 3, label: "person/president" },
                        ],
                      },
                    ],
                    null,
                    2
                  )}
                </pre>
              </Typography> */}
            </Box>
          </Modal>
        </Stack>
      </Grid>
      {/* {corpusType === "annotation" && (
        <Grid xs={12} container justifyContent="right" p={1}>
          <Tooltip title="Click to set all uploaded annotations as suggestions. This is useful if performing error correction.">
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values["annotationsAreSuggestions"]}
                    onChange={(e) => {
                      updateValue(
                        "annotationsAreSuggestions",
                        !values["annotationsAreSuggestions"]
                      );
                    }}
                    name="annotations-suggestions-checkbox"
                    size="small"
                  />
                }
                label="Set annotations as suggestions"
              />
            </FormGroup>
          </Tooltip>
        </Grid>
      )} */}
      <Grid item xs={12}>
        <TextField
          required
          id="outlined-multiline-flexible"
          label={
            "Corpus (read only)"
            // corpusType === "annotation"
            //   ? "Corpus (read only)"
            //   : "Corpus (editable)"
          }
          placeholder="Enter corpus manually or upload"
          multiline
          rows={20}
          onChange={(e) =>
            updateValue({ key: "corpus", value: e.target.value.split("\n") })
          }
          value={parseCorpus(corpus)}
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />
      </Grid>
      {corpusType === "parallel" && (
        <Grid item xs={12}>
          <TextField
            id="special-tokens"
            label={"Special tokens (e.g. <id>, <num>, <date>)"}
            placeholder="Enter comma separated special tokens"
            fullWidth
            onChange={(e) =>
              updateValue({ key: "specialTokens", value: e.target.value })
            }
            value={values["specialTokens"]}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default Upload;
