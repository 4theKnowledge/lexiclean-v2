import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveModal, setProject } from "../project/projectSlice";
import "./Feed.css";
import {
  fetchProjectMetrics,
  fetchProjects,
  selectFeedError,
  selectFeedMetricsError,
  selectFeedMetricsStatus,
  selectFeedStatus,
  selectProjectMetrics,
  selectProjects,
  setProjectMetrics,
} from "./feedSlice";

import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardIcon from "@mui/icons-material/Dashboard";
import axios from "axios";

import {
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
} from "@mui/material";

const DeleteColor = "#b0bec5";

const Projects = () => {
  const dispatch = useDispatch();
  const feedStatus = useSelector(selectFeedStatus);
  const feedError = useSelector(selectFeedError);
  // const projects = useSelector(selectProjects);

  const feedMetricsStatus = useSelector(selectFeedMetricsStatus);
  const feedMetricsError = useSelector(selectFeedMetricsError);

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState();

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axios.get("/api/project");

      if (response.status === 200) {
        console.log(response.data);
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
        <div id="loader">
          <p>Loading...</p>
        </div>
      ) : projects.length === 0 ? (
        <div id="create-project">
          <p>No projects</p>
          <Button variant="dark" size="lg" href="/project/new">
            Create Project
          </Button>
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </Grid>
  );
};

const ProjectList = ({ projects }) => {
  return (
    <Grid container p={4}>
      {projects.map((project, index) => {
        return (
          <Grid item xs={12} key={`project-item-${index}`}>
            <Card key={index} sx={{ minWidth: 300 }}>
              <CardContent>
                <Typography variant="h5">{project.name}</Typography>
                <Typography variant="paragraph">
                  {project.description}
                </Typography>
                <Typography variant="paragraph">
                  {new Date(project.created_on).toDateString()}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Typography>
                    {project.annotated_texts}/{project.text_count} Texts
                    Annotated
                  </Typography>
                  <Typography>
                    {Math.round(project.vocab_reduction)}% Vocabulary Reduction
                  </Typography>
                  <Typography>
                    {`${
                      project.starting_oov_token_count - project.oov_corrections
                    }
                      / ${project.starting_oov_token_count}`}
                    Vocabulary Corrections
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: "right" }}>
                <Button
                  href={`/project/${project._id}/page/1`}
                  startIcon={<ModeEditIcon />}
                >
                  Annotate
                </Button>
                <Button href="" startIcon={<DashboardIcon />}>
                  Dashboard
                </Button>
                {/* <MdFileDownload
                          id="action-icon"
                          onClick={() => modalHandler(project, "downloads")}
                        /> */}
                {/* <DeleteIcon
                  id="action-icon"
                  style={{ Gridor: DELETE_COLOUR }}
                  onClick={() => modalHandler(project, "delete")}
                /> */}
              </CardActions>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Projects;
