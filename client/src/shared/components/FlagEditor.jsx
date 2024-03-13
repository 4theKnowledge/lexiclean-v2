import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const FlagEditor = ({ values, updateValue }) => {
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleFlagClick = (flag, index) => {
    if (index === editingIndex) {
      // Unselect flag
      resetForm();
    } else {
      setInput(flag);
      setIsEditing(true);
      setEditingIndex(index);
    }
  };

  const addOrUpdateFlag = () => {
    if (input.trim() === "") return; // Prevent adding empty flags

    let updatedFlags;
    if (isEditing) {
      updatedFlags = [...values];
      updatedFlags[editingIndex] = input.trim();
    } else {
      if (values.includes(input.trim())) return; // Prevent duplicates when adding
      updatedFlags = [...values, input.trim()];
    }
    console.log("updatedFlags: ", updatedFlags);
    updateValue("flags", updatedFlags);
    resetForm();
  };

  const removeFlag = (flagToRemove) => {
    const updatedFlags = values.filter((flag) => flag !== flagToRemove);
    updateValue("flags", updatedFlags);
    if (isEditing) {
      resetForm();
    }
  };

  const resetForm = () => {
    setInput("");
    setIsEditing(false);
    setEditingIndex(-1);
  };

  return (
    <Grid container alignItems="center">
      <Grid item xs={12} mb={2}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={2}
          width="100%"
        >
          <TextField
            size="small"
            label={isEditing ? "Edit Flag" : "New Flag"}
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addOrUpdateFlag()}
          />
          <Button
            variant="contained"
            onClick={addOrUpdateFlag}
            size="small"
            disabled={input.trim() === "" || values.includes(input.trim())}
          >
            {isEditing ? "Update" : "Add"}
          </Button>
          {isEditing && (
            <Button variant="outlined" onClick={resetForm} size="small">
              Cancel
            </Button>
          )}
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          variant="outlined"
        >
          {values.length === 0 ? (
            <Typography variant="body2">No Flags Added</Typography>
          ) : (
            <Stack direction="row" spacing={1}>
              {values.map((flag, index) => (
                <Chip
                  key={index}
                  label={flag}
                  onClick={() => handleFlagClick(flag, index)}
                  onDelete={() => removeFlag(flag)}
                  deletable
                  color={index === editingIndex ? "primary" : "default"}
                  variant={
                    index !== editingIndex && editingIndex !== -1
                      ? "outlined"
                      : "contained"
                  }
                />
              ))}
            </Stack>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FlagEditor;
