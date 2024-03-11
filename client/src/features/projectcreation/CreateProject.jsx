import { useState, useEffect } from "react";
import axiosInstance from "../../shared/api/axiosInstance";
import {
  Grid,
  Typography,
  Box,
  Divider,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import Details from "./steps/Details";
import Upload from "./steps/upload/Upload";
import Preprocessing from "./steps/Preprocessing";
import Schema from "./steps/Schema";
import Labelling from "./steps/Labelling";
import Review from "./steps/Review";
import Preannotation from "./steps/Preannotation";

import { useNavigate } from "react-router-dom";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArticleIcon from "@mui/icons-material/Article";
import AddBoxIcon from "@mui/icons-material/AddBox";

import { useParams, Link } from "react-router-dom";
import { SuccessColor } from "../../shared/constants/create";
import { DrawerWidth } from "../../shared/constants/layout";

import DoneIcon from "@mui/icons-material/Done";
import WarningIcon from "@mui/icons-material/Warning";
import {
  ValidateCreateDetails,
  ValidateCreateSchema,
  ValidateCreateUpload,
  ValidateCreatePreannotation,
  ValidateCreateReview,
} from "../../shared/utils/validation";
import { useSnackbar } from "../../shared/context/SnackbarContext";

const CreateProject = () => {
  const navigate = useNavigate();
  const { dispatch: snackbarDispatch } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [stepValidation, setStepValidation] = useState({
    details: false,
    schema: false,
    upload: false,
    preprocessing: false,
    preannotation: false,
    review: false,
  });

  const updateStepValidation = (step, valid) => {
    setStepValidation((prevState) => ({ ...prevState, [step]: valid }));
  };

  const [values, setValues] = useState({
    projectName: "",
    projectDescription: "",
    corpusType: "scratch", // Indicates type of data uploaded ('scratch', 'identifiers', 'parallel')
    corpusFileName: null,
    corpus: [],
    preprocessLowerCase: false,
    preprocessRemoveDuplicates: false,
    preprocessRemoveChars: false,
    preprocessRemoveCharSet: '~",?;!:()[]_{}*.$',
    replacementDictionary: {},
    replacementDictionaryFileName: null,
    tags: [],
    preannotationDigitsIV: false,
    specialTokens: "",
  });

  const updateValue = (key, value) => {
    setValues((prevState) => ({ ...prevState, [key]: value }));
  };

  const steps = {
    details: {
      component: <Details values={values} updateValue={updateValue} />,
      description: "Enter project details",
      title: "Details",
      valid: stepValidation.details,
    },
    schema: {
      component: <Schema values={values} updateValue={updateValue} />,
      description: "Build a schema for multi-task token annotation",
      title: "Schema",
      valid: stepValidation.schema,
    },
    upload: {
      component: <Upload values={values} updateValue={updateValue} />,
      description: "Create or upload a corpus",
      title: "Data",
      valid: stepValidation.upload,
    },
    preprocessing: {
      component: <Preprocessing values={values} updateValue={updateValue} />,
      description: "Apply text preprocessing to your corpus",
      title: "Preprocessing",
      valid: stepValidation.preprocessing,
    },
    preannotation: {
      component: <Preannotation values={values} updateValue={updateValue} />,
      description: "Upload data for pre-annotation",
      title: "Preannotation",
      valid: stepValidation.preannotation,
    },
  };

  const stepDisabled = (key) => {
    return (
      ["preprocessing", "preannotation"].includes(key) &&
      values["corpusType"] === "parallel"
    );
  };

  const stepSuccessful = (key) => {
    return stepValidation[key] && !stepDisabled(key);
  };

  useEffect(() => {
    const detailsValid = ValidateCreateDetails(
      values["projectName"],
      values["projectDescription"]
    );
    updateStepValidation("details", detailsValid);

    // ValidateCreateSchema (nothing to check)
    const schemaValid = ValidateCreateSchema();
    updateStepValidation("schema", schemaValid);

    const uploadValid = ValidateCreateUpload(values["corpus"]);
    updateStepValidation("upload", uploadValid);
    // Preprocessing is valid as long as upload is valid
    updateStepValidation("preprocessing", uploadValid);

    const preannotationValid = ValidateCreatePreannotation(
      values["replacementDictionary"]
    );
    updateStepValidation("preannotation", preannotationValid);

    const reviewValid = ValidateCreateReview(
      detailsValid,
      schemaValid,
      uploadValid,
      preannotationValid
    );

    updateStepValidation("review", reviewValid);
  }, [values]);

  const handleSubmit = async () => {
    console.log("payload", values);
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post("/api/project/create", values);

      if (response.status === 200) {
        setIsSubmitting(false);
        navigate("/projects");
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.log(error);
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container spacing={2} mt={4}>
      {Object.values(steps).map((s) => (
        <Grid item xs={12}>
          <StepContainer title={s.title} valid={s.valid}>
            {s.component}
          </StepContainer>
        </Grid>
      ))}
      <Box
        p={2}
        margin="auto"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="body2" gutterBottom>
          Project creation may take a few minutes if a lot of data has been
          uploaded
        </Typography>
        <LoadingButton
          variant="contained"
          loading={isSubmitting}
          onClick={handleSubmit}
          disabled={!stepValidation.review}
        >
          Create Project
        </LoadingButton>
      </Box>
    </Grid>
  );
};

const StepContainer = ({ title, valid, children }) => {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mr={1}
        >
          <Typography variant="h6" sx={{ p: 2, color: "text.secondary" }}>
            {title}
          </Typography>
          <Chip
            label={valid ? "Input valid" : "Input required"}
            color={valid ? "success" : "warning"}
            variant="outlined"
            icon={valid ? <DoneIcon /> : <WarningIcon />}
          />
        </Box>
        <Divider flexItem />
      </Box>
      <Box p={2}>{children}</Box>
      <Box sx={{ backgroundColor: "background.accent", height: 32 }} />
    </Paper>
  );
};

export default CreateProject;
