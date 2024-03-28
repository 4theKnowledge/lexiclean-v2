import { Grid, Stack, TextField, Typography } from "@mui/material";

const Details = ({ values, updateValue }) => {
  return (
    <Stack direction="column" spacing={2}>
      <CustomTextField
        value={values["projectName"]}
        setValueFunction={(targetValue) =>
          updateValue({ key: "projectName", value: targetValue })
        }
        title="Project Name"
        caption="Choose a distinctive name for your project. You can change this later."
        placeholder="Enter a project name"
      />
      <CustomTextField
        value={values.projectDescription}
        setValueFunction={(targetValue) =>
          updateValue({ key: "projectDescription", value: targetValue })
        }
        title="Project Description"
        caption="Optional: Describe your project to provide context for annotators. You can edit this description at any time."
        placeholder="Enter a brief description (optional)"
      />
    </Stack>
  );
};

export const CustomTextField = ({
  value,
  setValueFunction,
  title,
  caption,
  placeholder,
}) => (
  <Grid container alignItems="center">
    <Grid item xs={6} pr={4}>
      <Typography fontWeight={500} color="text.secondary">
        {title}
      </Typography>
      <Typography fontSize={12} color="text.secondary">
        {caption}
      </Typography>
    </Grid>
    <Grid item xs={6}>
      <TextField
        key={`${title}-textfield"`}
        type="text"
        margin="normal"
        fullWidth
        placeholder={placeholder}
        value={value}
        autoComplete="false"
        onChange={(e) => setValueFunction(e.target.value)}
        size="small"
      />
    </Grid>
  </Grid>
);

export default Details;
