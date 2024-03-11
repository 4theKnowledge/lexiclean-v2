import React, { useEffect, useState } from "react";
import StyledCard from "../Dashboard/StyledCard";
import { Box, Stack, TextField } from "@mui/material";
import { useAppContext } from "../../shared/context/AppContext";
import axiosInstance from "../../shared/api/axiosInstance";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import LoadingButton from "@mui/lab/LoadingButton";

const Account = () => {
  const { state, dispatch } = useAppContext(); // Assuming state includes user information
  const [name, setName] = useState(state.user?.name || "");
  const [username, setUsername] = useState(state.user?.username || "");
  const [email, setEmail] = useState(state.user?.email || "");
  const [openAIKey, setOpenAIKey] = useState(state.user?.openAIKey || "");
  const { dispatch: snackbarDispatch } = useSnackbar();

  // Track if any changes have been made to enable the Update button
  const [isChanged, setIsChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const payload = { name, openAIKey };
      const response = await axiosInstance.patch(
        `/api/user/${state.user._id}`,
        payload
      );

      // Check if the status code is in the 2xx range
      if (response.status < 200 || response.status >= 300) {
        throw new Error(
          response.data.message || "Unable to update account details."
        );
      }

      // Assuming your API returns the updated user object
      dispatch({
        type: "SET_USER",
        payload: response.data, // Directly use the updated user data from the response if possible
      });

      snackbarDispatch({
        type: "SHOW",
        message: "Successfully updated account details.",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      snackbarDispatch({
        type: "SHOW",
        message: error.response?.data?.message || error.message,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box mt={12}>
      <StyledCard title="Settings">
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
        </Stack>
        <Box display="flex" justifyContent="right">
          <LoadingButton
            variant="contained"
            disabled={!isChanged}
            isLoading={isSubmitting}
            onClick={handleUpdate}
          >
            Update
          </LoadingButton>
        </Box>
      </StyledCard>
    </Box>
  );
};

export default Account;
