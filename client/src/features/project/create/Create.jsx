import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../../utils/api-interceptor";
import {
  decrementActiveStep,
  incrementActiveStep,
  saveStep,
  selectActiveStep,
  selectSteps,
  setActiveStep,
  resetCreateProject,
  setStepData,
  selectCorpus,
  selectReplacements,
  selectPreprocessingActions,
} from "./createStepSlice";
import {
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  IconButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import Details from "./steps/Details";
import Upload from "./steps/upload/Upload";
import Preprocessing from "./steps/Preprocessing";
import Schema from "./steps/Schema";
import Labelling from "./steps/Labelling";
import Review from "./steps/Review";
import { readFile } from "./steps/upload/utils";
import { CorpusEditor } from "./steps/upload/CorpusEditor";
import { ReplacementEditor } from "./steps/upload/ReplacementEditor";
import { grey } from "@mui/material/colors";
import { CompactPicker } from "react-color";
import BrushIcon from "@mui/icons-material/Brush";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CreateIcon from "@mui/icons-material/Create";

const REPLACE_COLOUR = "#009688";

const Create = () => {
  const components = {
    details: <Details />,
    upload: <Upload />,
    preprocessing: <Preprocessing />,
    schema: <Schema />,
    labelling: <Labelling />,
    review: <Review />,
  };

  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);
  const corpus = useSelector(selectCorpus);
  const replacements = useSelector(selectReplacements);
  const actions = useSelector(selectPreprocessingActions);
  const [tags, setTags] = useState([]);

  // Preprocessing
  const [previewContent, setPreviewContent] = useState(
    "Upload texts to preview"
  );
  const [corpusSize, setCorpusSize] = useState();
  const [vocabSize, setVocabSize] = useState();
  const [tokenSize, setTokenSize] = useState();

  const handleNext = () => {
    dispatch(incrementActiveStep());
  };

  const handleBack = () => {
    dispatch(decrementActiveStep());
  };

  const handleReset = () => {
    dispatch(resetCreateProject());
  };

  const handleCreate = () => {
    console.log("creating project");
  };

  useEffect(() => {
    if (corpus && corpus === "") {
      // console.log("erased corpus paste bin");

      // Reset corpus and remove file meta data if user erases all contents of corpus paste bin
      dispatch(
        setStepData({
          corpus: [],
          corpusFileName: null,
        })
      );
    }
  }, [corpus]);

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

  const tagTemplate = { name: "", colour: grey[500], fileName: "", data: "" };

  const [currentTag, setCurrentTag] = useState(tagTemplate);
  const addNewTag = () => {
    setTags([...tags, currentTag]);
    setCurrentTag(tagTemplate);
  };

  const handleDelete = (index) => {
    console.log(index);
    setTags((prevState) => prevState.filter((_, idx) => idx !== index));
  };

  const readFile = (name, meta) => {
    let reader = new FileReader();
    reader.readAsText(meta);
    reader.onload = () => {
      const fileExt = meta.name.split(".").slice(-1)[0];
      if (fileExt === "txt") {
        setCurrentTag({
          ...currentTag,
          fileName: meta.name,
          data: reader.result.split("\n").filter((line) => line !== ""),
        });
      }
    };
  };

  return (
    <Grid container justifyContent="center" p={4}>
      <Grid item>
        <Button>Create</Button>
      </Grid>
      <Grid container item>
        <Grid item xs={6} sx={{ border: "1px solid red" }} p={4}>
          <Grid item>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <TextField
              placeholder="Enter project name"
              value={steps[activeStep].data.name}
              onChange={(e) => dispatch(setStepData({ name: e.target.value }))}
              autoComplete="off"
              label="Project Name"
            />
            <TextField
              placeholder="Enter project description"
              value={steps[activeStep].data.description}
              onChange={(e) =>
                dispatch(setStepData({ description: e.target.value }))
              }
              autoComplete="off"
              label="Project Description"
            />
          </Grid>
          <Grid item>
            <Typography variant="h6" gutterBottom>
              Schema
            </Typography>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
              Create Token Classification Tag
            </Typography>
            <Stack direction="column" spacing={2}>
              <TextField
                sx={{ bgcolor: currentTag.colour, color: "white" }}
                label="name"
                value={currentTag.name}
                onChange={(e) =>
                  setCurrentTag({ ...currentTag, name: e.target.value })
                }
              />
              <CompactPicker
                color={currentTag.colour}
                onChange={(color) =>
                  setCurrentTag({ ...currentTag, colour: color.hex })
                }
                onChangeComplete={(color) =>
                  setCurrentTag({ ...currentTag, colour: color.hex })
                }
              />
              <Stack direction="row" spacing={2}>
                <Button variant="contained" disableElevation>
                  Upload Dictionary
                </Button>
                <Button variant="contained" disableElevation>
                  Manually Enter Dictionary
                </Button>
              </Stack>
              <Button
                variant="contained"
                onClick={addNewTag}
                disabled={currentTag.name === ""}
              >
                Create tag
              </Button>
            </Stack>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
              Created Tags
            </Typography>
            <List>
              {tags.map((tag, index) => (
                <ListItem
                  sx={{ border: "1px solid orange" }}
                  secondaryAction={
                    <Stack direction="row" spacing={0}>
                      <IconButton aria-label="upload">
                        <FileUploadIcon />
                      </IconButton>
                      <IconButton aria-label="create">
                        <CreateIcon />
                      </IconButton>
                      <IconButton aria-label="colour">
                        <BrushIcon />
                      </IconButton>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: tag.colour }}>{tag.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={tag.name === "" ? "Enter tag name" : tag.name}
                    secondary={`tag number ${index}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item>
            <Typography variant="h6" gutterBottom>
              Preannotation
            </Typography>
            <Button variant="contained">x</Button>
          </Grid>
        </Grid>
        <Grid xs={6} sx={{ border: "1px solid red" }} p={4}>
          <Grid item>
            <Typography variant="h6" gutterBottom>
              Upload Corpus ({Object.keys(corpus).length})
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                component="label"
                disableElevation="true"
                size="small"
              >
                Upload File without Identifiers
                {steps[activeStep].data.corpusFileName &&
                  `(${steps[activeStep].data.corpusFileName})`}
                <input
                  id="corpus"
                  type="file"
                  onChange={(e) =>
                    readFile(dispatch, e.target.files[0], "corpus_no_ids")
                  }
                  accept=".txt"
                />
              </Button>
              <Button
                variant="contained"
                component="label"
                disableElevation="true"
                size="small"
              >
                Upload File with identifiers
                {steps[activeStep].data.corpusFileName &&
                  `(${steps[activeStep].data.corpusFileName})`}
                <input
                  id="corpus"
                  type="file"
                  onChange={(e) =>
                    readFile(dispatch, e.target.files[0], "corpus_w_ids")
                  }
                  accept=".csv"
                />
              </Button>
            </Stack>
            <Typography>
              Replacements ({Object.keys(replacements).length})
            </Typography>
            <Button
              variant="contained"
              component="label"
              disableElevation="true"
              size="small"
            >
              Upload Replacement Dictionary
              <input
                id="replacements"
                type="file"
                onChange={(e) =>
                  readFile(dispatch, e.target.files[0], "replacements")
                }
                accept=".csv,.json"
              />
            </Button>
          </Grid>
          <Grid item>
            <Typography variant="h6" gutterBottom>
              Preprocessing
            </Typography>
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
                  dispatch(setStepData({ removeDuplicates: e.target.checked }));
                }}
                title="Removes duplicate documents from your corpus. This can reduce annotation effort"
              />
            </FormGroup>
          </Grid>
          <Grid item>
            <Typography variant="h6">Original</Typography>
            <CorpusEditor corpus={corpus} />
          </Grid>
          <Grid item>
            <Typography variant="h6">Transformed</Typography>
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
            <Stack direction="row" spacing={2} p={4}>
              <Typography variant="button">
                Corpus Size: {corpusSize}
              </Typography>
              <Typography variant="button">
                Vocabulary Size: {vocabSize}
              </Typography>
              <Typography variant="button">Token Count: {tokenSize}</Typography>
            </Stack>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  // return (
  //   <Grid container direction="column" alignItems="center" p={6}>
  //     <Grid item>
  //       <Stepper activeStep={activeStep}>
  //         {steps.map((step, index) => {
  //           return (
  //             <Step key={step.name}>
  //               <StepLabel>{step.name}</StepLabel>
  //             </Step>
  //           );
  //         })}
  //       </Stepper>
  //     </Grid>

  //     <Grid item container justifyContent="center">
  //       <Grid item p={4} justifyContent="center" sx={{ textAlign: 'center', textTransform: 'capitalize' }}>
  //         <Typography variant="h5">
  //           {steps[activeStep].name}
  //         </Typography>
  //         <Stack direction="column" spacing={0}>
  //           <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
  //             <Button
  //               color="inherit"
  //               disabled={activeStep === 0}
  //               onClick={handleBack}
  //               sx={{ mr: 1 }}
  //               variant="contained"
  //               size="small"
  //               disableElevation
  //             >
  //               Back
  //             </Button>
  //             <Button
  //               onClick={activeStep === steps.length - 1 ? handleCreate : handleNext}
  //               disabled={!steps[activeStep].valid}
  //               size="small"
  //               variant="contained"
  //               disableElevation
  //             >
  //               {activeStep === steps.length - 1 ? 'Create' : 'Next'}
  //             </Button>
  //           </Box>
  //         </Stack>
  //       </Grid>
  //       <Grid item container justifyContent="center">
  //         {components[steps[activeStep].name]}
  //       </Grid>
  //     </Grid>
  //   </Grid >
  // );
};

// const StepperControls = () => {
//   const dispatch = useDispatch();
//   const steps = useSelector(selectSteps);
//   const activeStep = useSelector(selectActiveStep);

//   const [formSubmitted, setFormSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleCreate = async () => {
//     // Create meta tag resource maps for automatic labelling
//     let maps = Object.keys(steps.schema.data.metaTags).map((name) => ({
//       type: name,
//       Colour: steps.schema.data.metaTags[name].Colour,
//       tokens: steps.schema.data.metaTags[name].data,
//       active: true,
//     }));

//     // Create replacement resource map (if it was created)
//     if (Object.keys(steps.upload.data.replacements).length > 0) {
//       // Add existing
//       maps.push({
//         type: "rp",
//         Colour: REPLACE_COLOUR,
//         replacements: Object.keys(steps.upload.data.replacements).map(
//           (key) => ({
//             original: key,
//             normed: steps.upload.data.replacements[key],
//           })
//         ),
//         active: true,
//       });
//     } else {
//       maps.push({
//         type: "rp",
//         Colour: REPLACE_COLOUR,
//         replacements: {},
//         active: true,
//       });
//     }

//   // Create project payload
//   const payload = {
//     token: window.localStorage.getItem("token"),
//     name: steps.details.data.name,
//     description: steps.details.data.description,
//     texts: steps.upload.data.corpus,
//     maps: maps,
//     lower_case: steps.preprocessing.data.lowercase,
//     remove_duplicates: steps.preprocessing.data.removeDuplicates,
//     chars_remove: steps.preprocessing.data.removeChars,
//     charset_remove: steps.preprocessing.data.removeCharSet,
//     detect_digits: steps.labelling.data.detectDigits,
//   };

//   // console.log("Form payload ->", payload);
//   if (formSubmitted === false) {
//     setIsSubmitting(true);
//     await axios
//       .post("/api/project/create", payload)
//       .then((response) => {
//         if (response.status === 200) {
//           setFormSubmitted(true);
//           history.push("/feed");
//         }
//       })
//       .catch((error) => {
//         if (error.response.status === 401 || 403) {
//           // console.log("unauthorized");
//           history.push("/unauthorized");
//         }
//       });
//   }
// };

//   return (
//     <div style={{ display: "flex" }}>
//       {/* <Button
//         size="sm"
//         variant="warning"
//         onClick={() => dispatch(resetSteps())}
//       >
//         Reset All
//       </Button> */}
//       {activeStep !== Object.keys(steps)[0] && (
//         <Button
//           style={{ marginRight: "0.5rem" }}
//           size="sm"
//           variant="secondary"
//           onClick={() => dispatch(decrementActiveStep())}
//         >
//           <ArGridBackIcon />
//         </Button>
//       )}

//       {activeStep === Object.keys(steps).at(-1) ? (
//         <Button
//           size="sm"
//           variant="success"
//           onClick={() => handleCreate()}
//           disabled={formSubmitted}
//         >
//           {isSubmitting ? "Creating" : "Create"}
//           {isSubmitting && (
//             <Spinner
//               animation="border"
//               size="sm"
//               style={{ marginLeft: "0.5rem" }}
//             />
//           )}
//         </Button>
//       ) : (
//     </div>
//   );
// };

export default Create;
