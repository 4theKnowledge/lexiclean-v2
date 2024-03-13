import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import StyledCard from "./StyledCard";

const Settings = ({ loading, data, downloadProject, deleteProject }) => {
  const [deleteName, setDeleteName] = useState("");

  return (
    <StyledCard title={"Settings"}>
      <Box display="flex" flexDirection="column">
        <Box
          display="flex"
          justifyContent="space-between"
          mb={4}
          alignItems="center"
        >
          <Box>
            <Typography fontWeight="bold" color="text.secondary">
              Download Dataset
            </Typography>
            <Typography variant="caption">
              Click to download this projects data as a JSON file.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={downloadProject}
            disabled={loading}
          >
            Download
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography fontWeight="bold" color="text.secondary">
              Delete Project
            </Typography>
            <Typography variant="caption">
              Enter the projects name and click 'delete' to permanently remove
              this project. This is irreversible.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              placeholder={`Enter project name (${data.details.name})`}
              onChange={(e) => setDeleteName(e.target.value)}
              value={deleteName}
              size="small"
              color="error"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={deleteProject}
              disabled={loading || data.details.name !== deleteName}
              color="error"
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Box>
    </StyledCard>
  );
};

export default Settings;
