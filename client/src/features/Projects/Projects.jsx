import { useEffect, useState } from "react";
import {
  Grid,
  Button,
  CircularProgress,
  Box,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import useProjectActions from "../../shared/hooks/api/project";

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState();
  const { fetchProjects: fetchProjectsAction } = useProjectActions();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await fetchProjectsAction();
      if (data) {
        setProjects(data);
        setLoading(false);
      } else {
        setError("Unable to fetch data");
      }
    };

    if (loading) {
      fetchProjects();
    }
  }, [loading]);

  if (error) {
    return (
      <Alert>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Grid container item xs={12}>
      {loading ? (
        <Grid container alignItems="center" justifyContent="center" p={4}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container direction="row" columnSpacing={4} rowSpacing={4} p={4}>
          <CreateProjectCard />
          {projects.map((project, index) => {
            return (
              <ProjectCard
                key={`project-card-${project._id}`}
                index={index}
                project={project}
              />
            );
          })}
        </Grid>
      )}
    </Grid>
  );
};

const CreateProjectCard = () => {
  const navigate = useNavigate();
  return (
    <Grid item xs={12} md={12} lg={6} xl={6} key={`project-grid-item-create`}>
      <Box
        as={Button}
        variant="outlined"
        p={2}
        sx={{
          height: "100%",
          minHeight: 160,
          width: "100%",
          borderStyle: "dashed",
        }}
        onClick={() => navigate("/project/create")}
      >
        Create New Project
      </Box>
    </Grid>
  );
};

export default Projects;
