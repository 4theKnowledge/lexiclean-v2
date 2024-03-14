import React from "react";
import SchemaEditor from "../../../shared/components/SchemeEditor";
import { Alert, AlertTitle, Box, Grid } from "@mui/material";

const Schema = ({ values, updateValue }) => {
  return (
    <>
      <Box p={1}>
        <Grid item xs={12} pb={2}>
          <Alert severity="info">
            <AlertTitle>Tip!</AlertTitle>
            Here you can create a schema of entity labels for token-level entity
            tagging to support your annotation project.
          </Alert>
        </Grid>
      </Box>
      <SchemaEditor values={values} updateValue={updateValue} />
    </>
  );
};

export default Schema;
