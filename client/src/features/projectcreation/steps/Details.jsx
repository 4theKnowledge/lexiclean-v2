import { Grid, TextField } from "@mui/material";

const Details = (props) => {
  const { values, updateValue } = props;

  return (
    <Grid item xs={8}>
      <Grid item xs={12} p={4}>
        <TextField
          required
          id="project-name-text-field"
          label="Project Name"
          helperText="This can be modified at any time"
          placeholder="Enter project name"
          variant="standard"
          fullWidth
          value={values["projectName"]}
          onChange={(e) => updateValue("projectName", e.target.value)}
          autoComplete="off"
        />
      </Grid>
      <Grid item xs={12} p={4}>
        <TextField
          required
          id="project-description-text-field"
          label="Project Description"
          helperText="This can be modified at any time"
          placeholder="Enter project description"
          variant="standard"
          fullWidth
          value={values["projectDescription"]}
          onChange={(e) => updateValue("projectDescription", e.target.value)}
          autoComplete="off"
        />
      </Grid>
    </Grid>
  );
};

export default Details;
