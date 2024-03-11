import React, { useEffect, useState } from "react";
import StyledCard from "../Dashboard/StyledCard";
import { Box, Stack, TextField } from "@mui/material";
import { useAppContext } from "../../shared/context/AppContext";
import LoadingButton from "@mui/lab/LoadingButton";
import useUserActions from "../../shared/hooks/api/user";

const Account = () => {
  const { state } = useAppContext();
  const [name, setName] = useState(state.user?.name || "");
  const [username, setUsername] = useState(state.user?.username || "");
  const [email, setEmail] = useState(state.user?.email || "");
  const [openAIKey, setOpenAIKey] = useState(state.user?.openAIKey || "");

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
