import { useEffect, useState } from "react";
import {
  Grid,
  Stack,
  Button,
  Box,
  Alert,
  Tooltip,
  Chip,
  AlertTitle,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import FilePresentIcon from "@mui/icons-material/FilePresent";
import UploadIcon from "@mui/icons-material/Upload";
import { DataGrid } from "@mui/x-data-grid";
import * as Papa from "papaparse";

const DATASET_TYPES = [
  {
    title: "Standard Corpus",
    name: "standard",
    tooltip:
      "For straightforward text uploads, provide a CSV file containing a 'text' header. LexiClean will handle the rest.",
  },
  {
    title: "Corpus with Identifiers",
    name: "identifiers",
    tooltip:
      "To link external identifiers with your texts, upload a CSV featuring 'identifier' and 'text' headers for seamless association.",
  },
  {
    title: "Parallel Corpus",
    name: "parallel",
    tooltip:
      "For uploading texts alongside reference materials for tasks like error correction, upload a CSV with 'identifier', 'reference', and 'text' headers.",
  },
];

const Upload = ({ values, updateValue }) => {
  const [rows, setRows] = useState(values.corpus || []);
  const [columns, setColumns] = useState([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const validateFields = (data, requiredFields) => {
    for (const row of data) {
      for (const field of requiredFields) {
        if (!row[field] || row[field].trim() === "") {
          return false;
        }
      }
    }
    return true;
  };

  const handleFileUpload = (file, corpusType) => {
    setAlertMessage("");
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const { data } = results;
        let requiredFields = [];
        // TODO: Need to remove any superfluous rows like ones with whitespace at the end

        switch (corpusType) {
          case "standard":
            requiredFields = ["text"];
            break;
          case "identifiers":
            requiredFields = ["text", "identifier"];
            break;
          case "parallel":
            requiredFields = ["reference", "text", "identifier"];
            break;
          default:
            setAlertMessage("Unexpected corpus type.");
            return;
        }

        if (!validateFields(data, requiredFields)) {
          setAlertMessage(
            "Uploaded file is missing required fields or contains empty values."
          );
          return;
        }

        let processedData;

        if (corpusType === "standard") {
          processedData = data.map((row, index) => ({
            id: index,
            text: row.text,
            identifier: index,
          }));
          setColumns([
            { field: "identifier", headerName: "Identifier", width: 150 },
            { field: "text", headerName: "Text", width: 250, flex: 1 },
          ]);
          setRows(processedData);
        } else if (corpusType === "identifiers") {
          processedData = data.map((row, index) => ({ ...row, id: index }));
          setColumns([
            { field: "identifier", headerName: "Identifier", width: 150 },
            { field: "text", headerName: "Text", width: 250, flex: 1 },
          ]);

          setRows(processedData);
        } else if (corpusType === "parallel") {
          processedData = data.map((row, index) => ({ ...row, id: index }));
          setColumns([
            { field: "identifier", headerName: "Identifier", width: 130 },
            {
              field: "reference",
              headerName: "Reference Text",
              width: 200,
              flex: 1,
            },
            { field: "text", headerName: "Text", width: 200, flex: 1 },
          ]);
          setRows(processedData);
        }
        setUploadedFileName(file.name);
        updateValue({ key: "corpus", value: processedData });
        updateValue({ key: "corpusFileName", value: file.name });
        updateValue({ key: "corpusType", value: corpusType });
      },
    });
  };

  const handleChange = (event, corpusType) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file, corpusType);
    }
  };

  const resetGrid = () => {
    setRows([]);
    setColumns([]);
    setUploadedFileName("");
    setAlertMessage("");
    updateValue({ key: "corpus", value: [] });
    updateValue({ key: "corpusFileName", value: null });
    updateValue({ key: "corpusType", value: "standard" });
  };

  useEffect(() => {
    if (values.corpus.length === 0) {
      resetGrid();
    }
  }, [values.corpus]);

  return (
    <Grid item xs={12} container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info">
          <AlertTitle>Quick Tip!</AlertTitle>
          Efficiently normalise and optionally tag token-level entities by
          uploading your text dataset (corpus) as a CSV file. For guidance on
          acceptable corpus formats, refer to our detailed documentation.
          Remember, LexiClean tokenizes on whitespace, so prepare your texts
          accordingly. To preserve data integrity, especially in texts
          containing commas, encase your sentences in quotes (e.g., "hello,
          world"). This ensures commas are correctly interpreted as part of the
          text, not as column separators.
        </Alert>
        {alertMessage && <Alert severity="error">{alertMessage}</Alert>}
      </Grid>
      <Grid item xs={12}>
        <ActionBar
          handleChange={handleChange}
          resetGrid={resetGrid}
          uploadedFileName={uploadedFileName}
          size={rows.length}
        />
      </Grid>
      <Grid item xs={12}>
        <DatasetGrid rows={rows} columns={columns} />
      </Grid>
    </Grid>
  );
};

const ActionBar = ({ handleChange, resetGrid, uploadedFileName, size }) => {
  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" spacing={2}>
          <Tooltip placement="top" arrow title="Number of texts in your corpus">
            <Chip
              label={`${size} texts`}
              sx={{ userSelect: "none", cursor: "help" }}
              icon={<ArticleIcon />}
              size="small"
            />
          </Tooltip>
          <Tooltip placement="top" arrow title="Name of uploaded file">
            <Chip
              sx={{ userSelect: "none", cursor: "help" }}
              size="small"
              icon={<FilePresentIcon />}
              label={`File: ${uploadedFileName ? uploadedFileName : "n/a"}`}
            />
          </Tooltip>
        </Stack>
        <Stack direction="row" spacing={2}>
          {DATASET_TYPES.map((dataset) => (
            <Tooltip title={dataset.tooltip} arrow placement="top">
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<UploadIcon />}
              >
                {dataset.title}
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleChange(e, dataset.name)}
                  accept="text/csv"
                />
              </Button>
            </Tooltip>
          ))}
          <Tooltip title="Click to reset this component." arrow placement="top">
            <Button variant="text" onClick={resetGrid} size="small">
              Reset
            </Button>
          </Tooltip>
        </Stack>
      </Box>
    </>
  );
};

const DatasetGrid = ({ rows, columns }) => {
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableColumnSelector
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};

export default Upload;
