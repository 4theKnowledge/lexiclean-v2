import { Stack, TextField, Typography } from "@mui/material";

const Details = ({ values, updateValue }) => {
  return (
    <Stack direction="column" spacing={2}>
      <CustomTextField
        value={values["projectName"]}
        setValueFunction={(targetValue) =>
          updateValue("projectName", targetValue)
        }
        title="Project Name"
        caption="Choose a distinctive name for your project. You can change this later."
        placeholder="Enter a project name"
      />
      <CustomTextField
        value={values.projectDescription}
        setValueFunction={(targetValue) =>
          updateValue("projectDescription", targetValue)
        }
        title="Project Description"
        caption="Describe your project to provide context for annotators. You can edit this description at any time."
        placeholder="Enter a brief description"
      />
      <CustomTextField
        value={values.specialTokens}
        setValueFunction={(targetValue) =>
          updateValue("specialTokens", targetValue)
        }
        title="Are there any special tokens in your project?"
        caption="Enter your special tokens separated by commas (e.g., <id>, <sensitive>). These tokens will be recognised as part of the vocabulary when your project is created."
        placeholder="Enter special tokens here (e.g., <id>, <sensitive>)"
      />
    </Stack>
  );
};

const CustomTextField = ({
  value,
  setValueFunction,
  title,
  caption,
  placeholder,
}) => (
  <Stack direction="column" spacing={1}>
    <Typography fontWeight={500} color="text.secondary">
      {title}
    </Typography>
    <Typography fontSize={12} color="text.secondary">
      {caption}
    </Typography>

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
  </Stack>
);

export default Details;
