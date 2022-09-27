import { useState, useEffect } from "react";
import axios from "../utils/api-interceptor";
import {
  Grid,
  Typography,
  Box,
  Stack,
  List,
  ListItem,
  ListItemText,
  Drawer,
  CssBaseline,
  Toolbar,
  Divider,
  ListItemButton,
  ListItemIcon,
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

import {
  ValidateCreateDetails,
  ValidateCreateSchema,
  ValidateCreateUpload,
  ValidateCreatePreannotation,
  ValidateCreateReview,
} from "../../shared/utils/validation";

const CreateProject = () => {
  const navigate = useNavigate();
  const { step } = useParams();
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
    },
    schema: {
      component: <Schema values={values} updateValue={updateValue} />,
      description: "Build a schema for multi-task token annotation",
    },
    upload: {
      component: <Upload values={values} updateValue={updateValue} />,
      description: "Create or upload a corpus",
    },
    preprocessing: {
      component: <Preprocessing values={values} updateValue={updateValue} />,
      description: "Apply text preprocessing to your corpus",
    },
    preannotation: {
      component: <Preannotation values={values} updateValue={updateValue} />,
      description: "Upload data for pre-annotation",
    },
    review: {
      component: <Review values={values} stepValidation={stepValidation} />,
      description: "Review project before creation",
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

    await axios
      .post("/api/project/create", values)
      .then((response) => {
        if (response.status === 200) {
          setIsSubmitting(false);
          navigate("/projects");
        }
      })
      .catch((error) => {
        console.log(error);
        setIsSubmitting(false);
      });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: DrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DrawerWidth,
            boxSizing: "border-box",
            marginTop: "64px",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <List>
          <ListItem>
            <ListItemIcon>
              <ArticleIcon />
            </ListItemIcon>
            <ListItemText
              primary={"New project"}
              secondary={`Creating new project from ${values["corpusType"]}`}
            />
          </ListItem>
        </List>
        <Divider variant="middle" />
        <List>
          {Object.keys(steps)
            .filter((key) => key !== "start")
            .map((key, index) => (
              <ListItem key={index} disabled={stepDisabled(key)}>
                <ListItemButton
                  component={Link}
                  to={`/project/new/${key}`}
                  selected={step === key}
                  disabled={stepDisabled(key)}
                >
                  <ListItemIcon
                    sx={{ color: stepSuccessful(key) && SuccessColor }}
                  >
                    {stepSuccessful(key) && <CheckCircleOutlineIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${index + 1}. ${key}`}
                    sx={{
                      color: stepSuccessful(key) && SuccessColor,
                      textTransform: "capitalize",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          width: `calc(100vw - ${DrawerWidth}px)`,
          height: "100%",
        }}
      >
        <Toolbar>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Stack>
              <Typography variant="h5" sx={{ textTransform: "capitalize" }}>
                {step}
              </Typography>
              <Typography variant="paragraph">
                {steps[step].description}
              </Typography>
            </Stack>
            <Stack direction="row" pr={1}>
              {step === "review" && (
                <LoadingButton
                  variant="contained"
                  loadingPosition="start"
                  startIcon={<AddBoxIcon />}
                  disabled={!stepValidation["review"]}
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Creating" : "Create"}
                </LoadingButton>
              )}
            </Stack>
          </Box>
        </Toolbar>
        <Divider />
        <Grid item container spacing={4} p={4} justifyContent="center">
          {steps[step].component}
        </Grid>
      </Box>
    </Box>
  );
};

export default CreateProject;
