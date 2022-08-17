import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveStep,
  selectSteps,
  setStepData,
  setStepValid,
} from "../createStepSlice";

import { Grid, TextField, Typography, Stack } from "@mui/material"

import HelpIcon from '@mui/icons-material/Help';

const Details = () => {
  const dispatch = useDispatch();
  const steps = useSelector(selectSteps);
  const activeStep = useSelector(selectActiveStep);

  useEffect(() => {
    const valid = steps[activeStep].valid;
    const data = steps[activeStep].data;

    if (!valid && data.name !== "" && data.description !== "") {
      dispatch(setStepValid(true));
    }
    if (valid && (data.name === "" || data.description === "")) {
      dispatch(setStepValid(false));
    }
  }, [steps]);

  return (
    <React.Fragment>
      {/* <Stack direction="column" spacing={4}>
        <Typography>
          The project creation process involves:
          <strong>1. Details</strong> - Enter project details
          <strong>2. Upload:</strong> - Create or upload a corpus and
          replacement dictionary
          <strong>3. Preprocessing:</strong> - Apply text preprocessing
          to your corpus
          <strong>4. Schema:</strong> - Build a meta-tag schema for
          multi-task annotation
          <strong>5. Labelling:</strong> - Apply actions for automatic
          annotation
        </Typography>
      </Stack> */}
      <Stack direction="column" spacing={4}>
        <TextField
          placeholder="Enter project name"
          value={steps[activeStep].data.name}
          onChange={(e) =>
            dispatch(setStepData({ name: e.target.value }))
          }
          autoComplete="off"
          label="Project Name"
          sx={{ width: '50vw' }}
        />
        <TextField
          placeholder="Enter project description"
          value={steps[activeStep].data.description}
          onChange={(e) =>
            dispatch(setStepData({ description: e.target.value }))
          }
          autoComplete="off"
          label="Project Description"
          sx={{ width: '50vw' }}
        />
      </Stack>
    </React.Fragment >
  );
};


export default Details