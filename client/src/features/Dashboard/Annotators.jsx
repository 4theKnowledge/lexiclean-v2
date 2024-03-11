import React from "react";
import StyledCard from "./StyledCard";
import { Alert, AlertTitle, Box } from "@mui/material";

const Annotators = () => {
  return (
    <StyledCard title="Annotators">
      <Box p="0rem 1rem">
        <Alert severity="info">
          <AlertTitle>Project Annotators</AlertTitle>
          This area allows you invite annotators to your project.
        </Alert>
      </Box>
      <InviteTable />
    </StyledCard>
  );
};

const InviteTable = () => {
  return <Box>Hello world</Box>;
};

export default Annotators;
