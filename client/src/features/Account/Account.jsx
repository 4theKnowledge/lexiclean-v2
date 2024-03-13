import React, { useEffect, useState } from "react";
import StyledCard from "../Dashboard/StyledCard";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAppContext } from "../../shared/context/AppContext";
import LoadingButton from "@mui/lab/LoadingButton";
import useUserActions from "../../shared/hooks/api/user";

const Account = () => {
  const { state } = useAppContext();
  const [name, setName] = useState(state.user?.name || "");
  const [username, setUsername] = useState(state.user?.username || "");
  const [email, setEmail] = useState(state.user?.email || "");
  const [openAIKey, setOpenAIKey] = useState(state.user?.openAIKey || "");
  const [usernameDelete, setUsernameDelete] = useState("");

  // Track if any changes have been made to enable the Update button
  const [isChanged, setIsChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateUserDetails } = useUserActions();

  useEffect(() => {
    setName(state.user?.name || "");
    setUsername(state.user?.username || "");
    setEmail(state.user?.email || "");
    setOpenAIKey(state.user?.openAIKey || "");
  }, [state.user]);

  useEffect(() => {
    const hasChanged =
      name !== (state.user?.name || "") ||
      openAIKey !== (state.user?.openAIKey || "");
    setIsChanged(hasChanged);
  }, [name, username, openAIKey, state.user]);

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      await updateUserDetails({ name, openAIKey });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Grid
      container
      direction="column"
      sx={{ height: "calc(100vh - 128px)", overflow: "hidden" }}
    >
      <Grid container item xs sx={{ overflow: "auto" }} mt={1} mb={1}>
        <StyledCard title="Settings">
          <Box mb={2}>
            <Alert severity="warning">
              <AlertTitle>Warning</AlertTitle>
              The account deletion feature, which allows for the permanent
              removal of your account and all associated data, is under
              development. Currently, it is not available for use. We appreciate
              your understanding and patience.
            </Alert>
          </Box>
          <Stack spacing={2} direction="column" mb={2}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="false"
              helperText="Your account's display name."
            />
            <TextField
              label="Username"
              value={username}
              autoComplete="false"
              disabled
              helperText="Your unique username; cannot be altered at this time."
            />
            <TextField
              label="Email Address"
              value={email}
              autoComplete="false"
              disabled
              helperText="Your email address; changes are currently disabled."
            />
            <TextField
              label="Open AI Key"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              autoComplete="false"
              helperText="Enter your Open AI API key for AI-driven suggestions."
            />
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item xs={7} pr={1}>
                <Box>
                  <Typography fontWeight="bold" color="text.secondary">
                    Delete Account
                  </Typography>
                  <Typography variant="caption">
                    To permanently delete your account and all associated data
                    you've created, enter your username. Please note, this
                    action is irreversible.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <TextField
                    value={usernameDelete}
                    placeholder={`Enter username (${username})`}
                    size="small"
                    error
                    fullWidth
                    disabled
                  />
                  <Button disabled variant="contained" color="error">
                    Delete
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </StyledCard>
      </Grid>
      {/* STICKY FOOTER */}
      <Grid item xs="auto">
        <Paper variant="outlined">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            p="0.5rem 1rem"
            spacing={1}
          >
            <Typography variant="body2">
              Don't forget to save your changes. Click "Update" to apply any
              modifications.
            </Typography>
            <Stack direction="row" spacing={2}>
              <LoadingButton
                variant="contained"
                disabled={!isChanged}
                isLoading={isSubmitting}
                onClick={handleUpdate}
              >
                Update
              </LoadingButton>
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Account;
