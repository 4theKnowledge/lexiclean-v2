import { Box, CircularProgress, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  downloadProjectData,
  deleteProjectById,
  fetchProjectSummaryById,
} from "../../shared/api/dashboard";
import { downloadFile } from "../../shared/utils/dashboard";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import Schema from "./Schema";
import axiosInstance from "../../shared/api/axiosInstance";
import Settings from "./Settings";
import Overview from "./Overview";
import Details from "./Details";

const Dashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const { dispatch: snackbarDispatch } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await fetchProjectSummaryById(projectId);
        setData(projectData);
      } catch (error) {
        setError(error);
        snackbarDispatch({
          type: "SHOW",
          message: `Unable to fetch project dashboard information `,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]); // Dependency array to refetch when projectId changes

  const downloadProject = async () => {
    try {
      const response = await downloadProjectData(projectId);
      if (response.status === 200) {
        downloadFile({ data: response.data, fileName: `${data.name}.json` });
      } else {
        throw Error;
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to download project: ${error}`,
        severity: "error",
      });
    }
  };

  const deleteProject = async () => {
    try {
      const response = await deleteProjectById(projectId);
      if (response.status === 200) {
        navigate("/projects");
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  const handleUpdateSchema = async (key, newValue) => {
    // Update value associated with project (name, description) including schema.

    try {
      const response = await axiosInstance.post(`/api/schema/${projectId}`, {
        tags: newValue,
      });

      if (response.status === 200) {
        setData((prevState) => {
          const updatedData = { ...prevState };
          updatedData.details.tags = newValue;
          return updatedData;
        });
        snackbarDispatch({
          type: "SHOW",
          message: `Succesfully modified project schema`,
          severity: "success",
        });
      } else {
        throw new Error("Failed to modify project schema");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  const handleUpdateDetails = async (name, description) => {
    try {
      const response = await axiosInstance.patch("/api/project", {
        projectId,
        name,
        description,
      });

      if (response.status === 200) {
        setData((prevState) => ({
          ...prevState,
          details: {
            ...prevState.details,
            name: name,
            description: description,
          },
        }));
        snackbarDispatch({
          type: "SHOW",
          message: "Succesfully updated project details",
          severity: "success",
        });
      } else {
        throw new Error("Failed to update project details");
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: error,
        severity: "error",
      });
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" width="100%" mt={16}>
        <CircularProgress />
      </Box>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Grid container spacing={2} mt={8}>
      <Grid item xs={12}>
        <Overview loading={loading} data={data} />
      </Grid>
      <Grid item xs={12}>
        <Details
          loading={loading}
          data={data}
          handleUpdate={handleUpdateDetails}
        />
      </Grid>
      <Grid item xs={12}>
        <Schema
          loading={loading}
          data={data}
          handleUpdateSchema={handleUpdateSchema}
        />
      </Grid>
      <Grid item xs={12}>
        <Settings
          loading={loading}
          data={data}
          downloadProject={downloadProject}
          deleteProject={deleteProject}
        />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
