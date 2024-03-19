import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { downloadFile } from "../../shared/utils/dashboard";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import Schema from "./Schema";
import Settings from "./Settings";
import Overview from "./Overview";
import Details from "./Details";
import Annotators from "./Annotators";
import useDashboardActions from "../../shared/hooks/api/dashboard";
import LoadingButton from "@mui/lab/LoadingButton";
import Flags from "./Flags";
import Replacements from "./Replacements";
import Adjudication from "./Adjudication";

const Dashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const { dispatch: snackbarDispatch } = useSnackbar();
  const {
    fetchProjectSummaryById,
    downloadProjectData,
    deleteProjectById,
    updateProjectSchema,
    updateProjectDetail,
    updateProjectFlags,
  } = useDashboardActions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await fetchProjectSummaryById(projectId);
        setData(projectData);
        setDisabled(!projectData.isOwner);
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

  const handleUpdateSchema = async ({ key, newValue }) => {
    const data = await updateProjectSchema({
      projectId,
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

  const handleUpdateFlags = async ({ key, value, isDelete = false }) => {
    const flags = value;
    const updatedFlags = await updateProjectFlags({
      projectId,
      flags,
      isDelete,
    });

    if (updatedFlags) {
      setData((prevState) => ({
        ...prevState,
        details: {
          ...prevState.details,
          flags: updatedFlags,
        },
      }));
      snackbarDispatch({
        type: "SHOW",
        message: "Succesfully updated project flags",
        severity: "success",
      });
    }
  };

  const handleUpdateAnnotators = async ({ newAnnotators }) => {
    setData((prevState) => {
      const updatedData = { ...prevState };

      // Assuming `newAnnotators` is an array of annotators to be toggled
      for (const newAnnotator of newAnnotators) {
        const annotatorId = newAnnotator._id.toString();
        const index = updatedData.details.annotators.findIndex(
          (a) => a._id.toString() === annotatorId
        );

        if (index > -1) {
          // Annotator exists, remove them
          console.log("removing existing annotator");
          updatedData.details.annotators.splice(index, 1);
        } else {
          // Annotator does not exist, add them
          console.log("adding new annotator");
          updatedData.details.annotators.push(newAnnotator);
        }
      }

      return updatedData;
    });
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
    <Grid
      container
      direction="column"
      sx={{ height: "calc(100vh - 128px)", overflow: "hidden" }}
    >
      <Grid
        container
        item
        xs
        sx={{ overflow: "auto" }}
        spacing={4}
        mt={1}
        mb={1}
      >
        <Grid item xs={12}>
          <Overview loading={loading} data={data} />
        </Grid>
        <Grid item xs={12}>
          <Details
            loading={loading}
            data={data}
            handleUpdate={handleUpdateDetails}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Replacements loading={loading} data={data} />
        </Grid>
        <Grid item xs={12}>
          <Annotators
            loading={loading}
            data={data}
            handleUpdate={handleUpdateAnnotators}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Schema
            loading={loading}
            data={data}
            handleUpdateSchema={handleUpdateSchema}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Flags
            loading={loading}
            data={data}
            handleUpdate={handleUpdateFlags}
            disabled={disabled}
          />
        </Grid>
        <Grid item xs={12}>
          <Adjudication loading={loading} data={data.lists.adjudicationTexts} />
        </Grid>
        <Grid item xs={12}>
          <Settings
            loading={loading}
            data={data}
            downloadProject={downloadProject}
            deleteProject={deleteProject}
            disabled={disabled}
          />
        </Grid>
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
              To begin annotating, simply click "Annotate."
            </Typography>
            {/* Save changes with "Update," or */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                component={Link}
                to={`/project/${projectId}`}
              >
                Annotate
              </Button>
              {/* TODO: integrate change detection and unified update into this button from all component */}
              {/* <LoadingButton
                variant="contained"
                // loading={isSubmitting}
                // onClick={handleSubmit}
                disabled={true}
              >
                Update
              </LoadingButton> */}
            </Stack>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
