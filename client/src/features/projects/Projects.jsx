import { useEffect, useState } from "react";
import axiosInstance from "../../shared/api/axiosInstance";
import {
  Grid,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Box,
  Paper,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState();

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axiosInstance.get("/api/project/feed");

      if (response.status === 200) {
        setProjects(response.data);
        setLoading(false);
      }
    };

    if (loading) {
      fetchProjects();
    }
  }, [loading]);

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
            return <ProjectCard index={index} project={project} />;
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
