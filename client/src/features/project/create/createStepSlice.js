import { createSlice } from "@reduxjs/toolkit";

const INITIAL_STATE = {
  id: null,
  status: "idle",
  error: null,
  steps: [
    {
      name: 'details',
      saved: false,
      data: { name: "", description: "" },
      valid: false,
    },
    {
      name: "upload",
      saved: false,
      data: {
        corpus: [],
        corpusFileName: null,
        corpusHasIds: false,
        replacements: {},
        replacementsFileName: null,
      },
      valid: false,
    },
    {
      name: "preprocessing",
      saved: false,
      data: {
        lowercase: false,
        removeDuplicates: false,
        removeChars: false,
        removeCharSet: '~",?;!:()[]_{}*.$',
      },
      valid: true, // No mandatory steps here, all optional.
    },
    {
      name: "schema",
      saved: false,
      data: { metaTags: {} },
      valid: true, // No mandatory steps here, all optional.
    },
    {
      name: "labelling",
      saved: false,
      data: { detectDigits: false },
      valid: true, // No mandatory steps here, all optional.
    },
    {
      name: "review",
      saved: false,
      data: { name: "", description: "" },
      valid: true,
    }
  ],
  activeStep: 0,
};

export const createStepSlice = createSlice({
  name: "create",
  initialState: INITIAL_STATE,
  reducers: {
    setStep: (state, action) => {
      state.steps = action.payload;
    },
    setStepData: (state, action) => {
      // Sets a value for a key in the data associated with a step
      const newData = {
        ...state.steps[state.activeStep].data,
        ...action.payload,
      };

      state.steps[state.activeStep] = {
        ...state.steps[state.activeStep],
        data: newData,
      };
    },
    resetCreateProject: (state) => {
      state.steps = INITIAL_STATE.steps;
      state.activeStep = 0;
    },
    setActiveStep: (state, action) => {
      state.activeStep = action.payload;
    },
    incrementActiveStep: (state) => {
      state.activeStep = state.activeStep + 1;
    },
    decrementActiveStep: (state) => {
      state.activeStep = state.activeStep - 1;
    },
    resetSteps: (state, action) => {
      state.steps = INITIAL_STATE.steps;
      state.activeStep = 0;
    },
    saveStep: (state, action) => {
      state.steps[state.activeStep] = {
        ...state.steps[state.activeStep],
        saved: true,
      };
    },
    setStepValid: (state, action) => {
      state.steps[state.activeStep] = {
        ...state.steps[state.activeStep],
        valid: action.payload,
      };
    },
    addReplacement: (state, action) => {
      // Adds a new key-value pair to the replacements; {key:value}
      state.steps.upload.data.replacements = {
        ...state.steps.upload.data.replacements,
        ...action.payload,
      };
    },
    patchReplacement: (state, action) => {
      // Updates either the key or value of a replacement pair; removing the old one
      // state.steps["upload"].data.replacements =
    },
    deleteReplacement: (state, action) => {
      // Deletes a replacement pair
      delete state.steps.upload.data.replacements[action.payload];
    },
    setMetaTags: (state, action) => {
      // Sets a single meta-tag
      state.steps.schema.data.metaTags = {
        ...state.steps.schema.data.metaTags,
        ...action.payload,
      };
    },
    deleteMetaTag: (state, action) => {
      // Deletes a single meta tag
      delete state.steps.schema.data.metaTags[action.payload];
    },
    setMetaTagData: (state, action) => {
      // Adds external data (uploaded or entered manually) to meta tag
      state.steps.schema.data.metaTags[action.payload.name].data =
        action.payload.data;
      state.steps.schema.data.metaTags[action.payload.name].meta =
        action.payload.meta;
    },
  },
});

export const {
  setStep,
  setStepData,
  setActiveStep,
  resetSteps,
  saveStep,
  incrementActiveStep,
  decrementActiveStep,
  setStepValid,
  addReplacement,
  patchReplacement,
  deleteReplacement,
  setMetaTags,
  deleteMetaTag,
  setMetaTagData,
  resetCreateProject
} = createStepSlice.actions;

export const selectSteps = (state) => state.create.steps;
export const selectActiveStep = (state) => state.create.activeStep;
export const selectCorpus = (state) => state.create.steps.filter(s => s.name === 'upload')[0].data.corpus;
export const selectReplacements = (state) =>
  state.create.steps.filter(s => s.name === 'upload')[0].data.replacements;
export const selectPreprocessingActions = (state) =>
  state.create.steps.filter(s => s.name === 'preprocessing')[0].data;
export const selectMetaTags = (state) =>
  state.create.steps.filter(s => s.name === 'schema')[0].data.metaTags;
export const selectLabellingActions = (state) =>
  state.create.steps.filter(s => s.name === 'labelling')[0].data;

export default createStepSlice.reducer;
