import { Alert, Box, CircularProgress, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { downloadFile } from "../../shared/utils/dashboard";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import Schema from "./Schema";
import Settings from "./Settings";
import Overview from "./Overview";
import Details from "./Details";
import Annotators from "./Annotators";
import useDashboardActions from "../../shared/hooks/api/dashboard";

const Dashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { dispatch: snackbarDispatch } = useSnackbar();
  const {
    fetchProjectSummaryById,
    downloadProjectData,
    deleteProjectById,
    updateProjectSchema,
    updateProjectDetail,
  } = useDashboardActions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await fetchProjectSummaryById(projectId);
        setData(projectData);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const downloadProject = async () => {
    const data = await downloadProjectData(projectId);
    downloadFile({ data: data, name: `${data.metadata.name}-annotations` });
  };

  const deleteProject = async () => {
    await deleteProjectById(projectId);
    navigate("/projects");
  };

  const handleUpdateSchema = async (key, newValue) => {
    const data = await updateProjectSchema({
      projectId: projectId,
      newTags: newValue,
    });

    if (data) {
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
    }
  };

  const handleUpdateDetails = async (name, description) => {
    const data = await updateProjectDetail({ projectId, name, description });
    if (data) {
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
    }
  };

  const handleUpdateAnnotators = async () => {
    alert("handleUpdateAnnotators - not implemented yet.");
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" width="100%" mt={16}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box sx={{ height: "100vh", margin: "auto" }} pt={4}>
        <Alert severity="error">Error: {error.message}</Alert>
      </Box>
    );

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
      {/* <Grid item xs={12}>
        <Annotators
          loading={loading}
          data={data}
          handleUpdate={handleUpdateAnnotators}
        />
      </Grid> */}
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
