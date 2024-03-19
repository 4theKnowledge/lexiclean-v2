import React, { useState } from "react";
import StyledCard from "./StyledCard";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import useNotificationActions from "../../shared/hooks/api/notification";
import useDashboardActions from "../../shared/hooks/api/dashboard";
import { useParams } from "react-router";

const Annotators = ({ loading, data, handleUpdate, disabled }) => {
  return (
    <StyledCard title="Annotators">
      <Box p="0rem 1rem">
        <Alert severity="info">
          <AlertTitle>Project Annotators</AlertTitle>
          This area allows you invite annotators to your project. Annotators
          will have access to all texts associated with the project. To remove
          annotators from your project, simply click the "x" icon. Removal is
          permanent and irreverible, all annotation artifacts for the annotator
          will also be removed.
        </Alert>
      </Box>
      <InviteForm data={data} disabled={disabled} handleUpdate={handleUpdate} />
      <AnnotatorTable
        data={data.details.annotators}
        ownerUsername={data.details.ownerUsername}
        disabled={disabled}
        handleUpdate={handleUpdate}
      />
    </StyledCard>
  );
};

const InviteForm = ({ data, disabled, handleUpdate }) => {
  const { inviteNotification } = useNotificationActions();
  const [usernames, setUsernames] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInvite = async () => {
    try {
      // Assuming inviteNotification returns a Promise
      const data = await inviteNotification(usernames);

      let messages = [];
      if (data.invited && data.invited.length > 0) {
        messages.push(
          `Invited: ${data.invited.map((a) => a.username).join(", ")}`
        );

        //
        await handleUpdate({
          newAnnotators: data.invited,
        });
        setUsernames("");
      }

      let errors = [];
      if (data.alreadyInProject && data.alreadyInProject.length > 0) {
        errors.push(
          `${data.alreadyInProject
            .map((a) => a.username)
            .join(", ")} are already in the project.`
        );
      }
      if (data.invalidUsernames && data.invalidUsernames.length > 0) {
        errors.push(
          `${data.invalidUsernames
            .map((a) => a.username)
            .join(", ")} are invalid usernames.`
        );
      }
      if (data.alreadyInvited && data.alreadyInvited.length > 0) {
        errors.push(
          `${data.alreadyInvited
            .map((a) => a.username)
            .join(", ")} have already been invited.`
        );
      }

      // Setting the success and error messages
      if (messages.length > 0) setSuccessMessage(messages.join(" "));
      if (errors.length > 0) setErrorMessage(errors.join(" "));
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to invite annotators. Please try again.");
    }
  };

  return (
    <Box p={2}>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Typography variant="body1" gutterBottom>
          Invite annotators to this project
        </Typography>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        <Stack spacing={1} direction="row" alignItems="center">
          <TextField
            size="small"
            fullWidth
            placeholder="Enter comma-separated usernames"
            value={usernames}
            disabled={disabled}
            onChange={(e) => setUsernames(e.target.value)}
            error={Boolean(errorMessage)}
          />
          <Button
            onClick={handleInvite}
            disabled={usernames.trim() === "" || disabled}
            variant="contained"
          >
            Invite
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

const AnnotatorTable = ({ data, ownerUsername, disabled, handleUpdate }) => {
  const [deleteAnnotator, setDeleteAnnotator] = useState(null);
  const [confirmName, setConfirmName] = useState("");
  const { removeAnnotator } = useDashboardActions();
  const { projectId } = useParams();

  const handleDeleteClick = (username) => {
    if (deleteAnnotator === username) {
      setDeleteAnnotator(null);
    } else {
      setDeleteAnnotator(username);
    }
  };

  const handleConfirmNameChange = (event) => {
    setConfirmName(event.target.value);
  };

  const handleDeleteConfirm = async () => {
    if (confirmName === deleteAnnotator) {
      const annotatorId = data.find((a) => a.username === deleteAnnotator)._id;
      await removeAnnotator({
        projectId,
        annotatorId,
      });

      // Reset state after deletion
      setDeleteAnnotator(null);
      setConfirmName("");

      handleUpdate({ newAnnotators: [{ _id: annotatorId }] });
    }
  };

  const getColor = (status) => {
    if (status === "accepted") return "success";
    if (status === "declined") return "error";
    return "default";
  };

  if (data) {
    return (
      <Box p={2} sx={{ textAlign: "center" }}>
        <Paper sx={{ p: 2 }} variant="outlined">
          {deleteAnnotator && (
            <Box display="flex" justifyContent="center" mb={2}>
              <Stack spacing={1} direction="row" alignItems="center">
                <TextField
                  size="small"
                  placeholder="Confirm username"
                  value={confirmName}
                  onChange={handleConfirmNameChange}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteConfirm}
                  size="small"
                  disabled={disabled || confirmName !== deleteAnnotator}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDeleteAnnotator(null);
                    setConfirmName("");
                  }}
                  size="small"
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          )}

          {data.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {data.map((a) => (
                <Chip
                  variant={
                    a.username === deleteAnnotator ? "contained" : "outlined"
                  }
                  label={`${a.username}: ${
                    a.username === ownerUsername ? "owner" : a.status
                  }`}
                  color={getColor(a.status)}
                  onDelete={
                    !disabled && a.username !== ownerUsername
                      ? () => handleDeleteClick(a.username)
                      : undefined
                  }
                />
              ))}
            </Stack>
          ) : (
            <Typography>This project has no additional annotators</Typography>
          )}
        </Paper>
      </Box>
    );
  } else {
    return <Typography>Loading...</Typography>;
  }
};

export default Annotators;
