import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Modal,
  Box,
  TextField,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import InsightsIcon from "@mui/icons-material/Insights";
import DownloadIcon from "@mui/icons-material/Download";

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [deleteProjectDetail, setDeleteProjectDetail] = useState({
    projectId: null,
    projectName: null,
  });
  const handleModalClose = () => {
    setDeleteProjectDetail({
      projectId: null,
      projectName: null,
    });
    setOpenModal(false);
  };
  const handleModalOpen = (projectId, projectName) => {
    setDeleteProjectDetail({ projectId, projectName });
    setOpenModal(true);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axios.get("/api/project/feed");

      if (response.status === 200) {
        setProjects(response.data);
        setLoading(false);
      }
    };

    if (loading) {
      fetchProjects();
    }
  }, [loading]);

  const deleteProject = async (projectId) => {
    await axios
      .delete(`/api/project/${projectId}`)
      .then((response) => {
        if (response.status === 200) {
          setProjects((prevState) =>
            prevState.filter((project) => project._id !== projectId)
          );
        }
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
      });
  };

  const downloadProject = async (projectId, projectName) => {
    const response = await axios.get(`/api/project/download/${projectId}`);

    if (response.status === 200) {
      // Prepare for file download
      const fileName = `${projectName.slice(0, 25).replace(" ", "_")}`;
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

  return (
    <Grid container item xs={12}>
      {loading ? (
        <Grid container alignItems="center" justifyContent="center" p={4}>
          <Stack
            direction="column"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h5">Loading Projects</Typography>
            <CircularProgress />
          </Stack>
        </Grid>
      ) : projects.length === 0 ? (
        <Grid
          container
          direction="column"
          p={4}
          alignItems="center"
          justifyContent="center"
        >
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={2}
          >
            <Typography variant="h5">No Projects</Typography>
            <Button
              variant="contained"
              component={Link}
              to="/project/new/details"
            >
              Create Project
            </Button>
          </Stack>
        </Grid>
      ) : (
        <ProjectList
          projects={projects}
          downloadProject={downloadProject}
          handleModalOpen={handleModalOpen}
        />
      )}
      <DeleteModal
        open={openModal}
        handleClose={handleModalClose}
        deleteProject={deleteProject}
        projectId={deleteProjectDetail.projectId}
        projectName={deleteProjectDetail.projectName}
      />
    </Grid>
  );
};

const ProjectList = ({ projects, downloadProject, handleModalOpen }) => {
  return (
    <Grid container direction="row" columnSpacing={4} rowSpacing={4} p={4}>
      {projects.map((project, index) => {
        return (
          <Grid
            item
            xs={12}
            md={6}
            lg={6}
            xl={4}
            key={`project-grid-item-${project._id}`}
          >
            <Card variant="outlined" key={index} sx={{ minWidth: 300 }}>
              <CardContent>
                <Grid container item spacing={3}>
                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="caption">
                        {new Date(project.createdAt).toDateString()}
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <IconButton
                          size="small"
                          title="Click to download project data"
                          onClick={() =>
                            downloadProject(project._id, project.name)
                          }
                        >
                          <DownloadIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton
                          size="small"
                          title="Click to delete project"
                          // onClick={() => deleteProject(project._id)}
                          onClick={() =>
                            handleModalOpen(project._id, project.name)
                          }
                        >
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: "left" }}>
                    <Typography variant="h5" gutterBottom title={project.name}>
                      {project.name.length > 40
                        ? project.name.sice(0, 40) + "..."
                        : project.name}
                    </Typography>
                    <Typography variant="paragraph" title={project.description}>
                      {project.description.length > 200
                        ? project.description.sice(0, 200) + "..."
                        : project.description}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={12} mt={2}>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                    <Chip
                      icon={<ArticleIcon />}
                      label={`${project.savedCount}/${project.textCount} Progress`}
                      title="Number of documents saved"
                      size="small"
                    />
                    <Chip
                      icon={<InsightsIcon />}
                      label={`${Math.round(project.vocabReduction)}% Reduction`}
                      title="Vocabulary reduction"
                      size="small"
                    />
                    <Chip
                      icon={<InsightsIcon />}
                      label={`${
                        project.startCandidateVocabSize - project.oovCorrections
                      }
                      / ${project.startCandidateVocabSize} Corrections`}
                      title="Vocabulary corrections"
                      size="small"
                    />
                    <Chip
                      icon={<SettingsIcon />}
                      label={
                        project.isParallelCorpusProject
                          ? "Parallel"
                          : "Standard"
                      }
                      title="Project type"
                      size="small"
                    />
                  </Stack>
                </Grid>
              </CardContent>
              <CardActions>
                <Stack direction="row" spacing={2} pl={1}>
                  <Button
                    component={Link}
                    color="primary"
                    variant="contained"
                    to={`/project/${project._id}/page=1`}
                    startIcon={<ModeEditIcon />}
                    disableElevation
                    size="small"
                  >
                    Annotate
                  </Button>
                  <Button
                    color="primary"
                    variant="outlined"
                    component={Link}
                    to=""
                    size="small"
                    startIcon={<DashboardIcon />}
                  >
                    Dashboard
                  </Button>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

const DeleteModal = ({
  open,
  handleClose,
  deleteProject,
  projectId,
  projectName,
}) => {
  const [valueMatched, setValueMatched] = useState(false);
  const checkValueMatch = (value) => {
    setValueMatched(value === projectName);
  };

  const handleDelete = async () => {
    deleteProject(projectId);
    handleClose();
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid",
    borderColor: red[500],
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Delete this project
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }} gutterBottom>
          Please enter <strong>{projectName}</strong> in the field below to
          delete this project
        </Typography>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          mt={2}
        >
          <TextField
            fullWidth
            size="small"
            id="delete-input-text"
            type="text"
            placeholder="Enter project name"
            autoComplete="false"
            onChange={(e) => checkValueMatch(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={!valueMatched}
            onClick={handleDelete}
            color="error"
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default Projects;
