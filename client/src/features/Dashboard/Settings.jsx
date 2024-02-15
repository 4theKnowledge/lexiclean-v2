import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

const Settings = ({ loading, data }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [deleteName, setDeleteName] = useState("");

  const downloadProject = async () => {
    const response = await axios.get(`/api/project/download/${projectId}`);

    if (response.status === 200) {
      // Prepare for file download
      const fileName = `${data.name.slice(0, 25).replace(" ", "_")}`;
      const json = JSON.stringify(response.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const href = await URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = fileName + ".json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log("download failed");
    }
  };

  const deleteProject = async () => {
    await axios
      .delete(`/api/project/${projectId}`)
      .then((response) => {
        if (response.status === 200) {
          navigate("/home");
        }
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });
  };

  return (
    <Box>
      <Paper>
        <Stack>
          {!loading &&
            Object.entries(data.preprocessing).map(({ key, value }) => (
              <p>
                {key} {value}
              </p>
            ))}
        </Stack>
      </Paper>
      <Box>
        <Typography>Delete Project</Typography>
        <TextField
          label="Enter Project Name"
          onChange={(e) => setDeleteName(e.target.value)}
          value={deleteName}
        />
        <Button
          onClick={deleteProject}
          disabled={loading || data.name !== deleteName}
        >
          Delete
        </Button>
      </Box>
      <Box>
        <Typography>Download Dataset</Typography>
        <Button onClick={downloadProject} disabled={loading}>
          Download
        </Button>
      </Box>
      name: {!loading && data.name}
      <br />
      createdAt: {!loading && data.createdAt}
      <br />
      description: {!loading && data.description}
      <br />
      startingVocabSize: {!loading && data.metrics.startingVocabSize}
      <br />
      startingOOVTokenCount: {!loading && data.metrics.startingOOVTokenCount}
    </Box>
  );
};

export default Settings;
