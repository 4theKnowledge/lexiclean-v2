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

const Annotators = ({ loading, data, handleUpdate, disabled }) => {
  return (
    <StyledCard title="Annotators">
      <Box p="0rem 1rem">
        <Alert severity="info">
          <AlertTitle>Project Annotators</AlertTitle>
          This area allows you invite annotators to your project. Annotators
          will have access to all texts associated with the project.
        </Alert>
      </Box>
      <InviteForm disabled={disabled} />
      <AnnotatorTable
        data={data.details.annotators}
        ownerUsername={data.details.ownerUsername}
      />
    </StyledCard>
  );
};

const InviteForm = ({ disabled }) => {
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
        messages.push(`Invited: ${data.invited.join(", ")}`);
      }

      let errors = [];
      if (data.alreadyInProject && data.alreadyInProject.length > 0) {
        errors.push(
          `${data.alreadyInProject.join(", ")} are already in the project.`
        );
      }
      if (data.invalidUsernames && data.invalidUsernames.length > 0) {
        errors.push(
          `${data.invalidUsernames.join(", ")} are invalid usernames.`
        );
      }
      if (data.alreadyInvited && data.alreadyInvited.length > 0) {
        errors.push(
          `${data.alreadyInvited.join(", ")} have already been invited.`
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

const AnnotatorTable = ({ data, ownerUsername }) => {
  if (data) {
    const getColor = (status) => {
      if (status === "accepted") return "success";
      if (status === "declined") return "error";
      return "default";
    };

    return (
      <Box p={2} sx={{ textAlign: "center" }}>
        <Paper sx={{ p: 2 }} variant="outlined">
          {data.length > 0 ? (
            <>
              <Stack direction="row" spacing={1}>
                {data.map((a) => (
                  <Chip
                    label={`${a.username}: ${
                      a.username === ownerUsername ? "owner" : a.status
                    }`}
                    color={getColor(a.status)}
                  />
                ))}
              </Stack>
            </>
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
