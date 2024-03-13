import React from "react";
import StyledCard from "./StyledCard";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const Annotators = () => {
  return (
    <StyledCard title="Annotators">
      <Box p="0rem 1rem">
        <Alert severity="info">
          <AlertTitle>Project Annotators</AlertTitle>
          This area allows you invite annotators to your project. Annotators
          will have access to all texts associated with the project.
        </Alert>
      </Box>
      <Box p={2}>
        <Typography>Coming soon!</Typography>
      </Box>
      {/* <InviteForm /> */}
      {/* <AnnotatorTable /> */}
    </StyledCard>
  );
};

const InviteForm = () => {
  return (
    <Box p={2}>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Typography variant="body1" gutterBottom>
          Invite project annotators
        </Typography>
        <Stack spacing={1} direction="row">
          <TextField fullWidth placeholder="Enter comma-spaced usernames" />
          <Button>Invite</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

const AnnotatorTable = () => {
  const data = [{ username: "dummy 1" }, { username: "dummy 2" }];

  return (
    <Box p={2}>
      <Paper sx={{ p: 2 }} variant="outlined">
        <Typography variant="body1">Active Project Annotators</Typography>
        <ul>
          {data.map((a) => (
            <li>{a.username}</li>
          ))}
        </ul>
      </Paper>
    </Box>
  );
};

export default Annotators;
