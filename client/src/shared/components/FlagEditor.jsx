import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
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

const FlagEditor = ({
  values,
  updateValue,
  isDashboard = false,
  disabled = false,
}) => {
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleFlagClick = (flag, index) => {
    if (index === editingIndex) {
      // Unselect flag
      resetForm();
    } else {
      setInput(flag.name);
      setIsEditing(true);
      setEditingIndex(index);
    }
  };

  const addOrUpdateFlag = () => {
    if (input.trim() === "") return; // Prevent adding empty flags

    let updatedFlags;
    if (isEditing) {
      updatedFlags = [...values];
      updatedFlags[editingIndex] = {
        ...updatedFlags[editingIndex],
        name: input.trim(),
      };
    } else {
      const isDuplicate = values.some((flag) => flag.name === input.trim());
      if (isDuplicate) return;
      updatedFlags = [...values, { name: input.trim(), _id: uuidv4() }];
    }
    updateValue({ key: "flags", value: updatedFlags });
    resetForm();
  };

  const removeFlag = (flagToRemove) => {
    let updatedFlags;
    if (isDashboard) {
      updatedFlags = [flagToRemove];
    } else {
      updatedFlags = values.filter(
        (flag) =>
          flag._id !== flagToRemove._id || flag.name !== flagToRemove.name
      );
    }

    updateValue({ key: "flags", value: updatedFlags, isDelete: true }); // isDelete prop is for dashboard use when interfacing with backend.
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
            disabled={disabled}
          />
          <Button
            variant="contained"
            onClick={addOrUpdateFlag}
            size="small"
            disabled={
              input.trim() === "" || values.includes(input.trim()) || disabled
            }
          >
            {isEditing ? "Update" : "Add"}
          </Button>
          {isEditing && (
            <Button
              variant="outlined"
              onClick={resetForm}
              size="small"
              disabled={disabled}
            >
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
                  key={index._id}
                  label={flag.name}
                  onClick={() => handleFlagClick(flag, index)}
                  onDelete={() => (disabled ? {} : removeFlag(flag))}
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
