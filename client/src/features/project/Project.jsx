import { useState, useEffect, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Box, CssBaseline, Container } from "@mui/material";
import { ProjectContext } from "../../shared/context/ProjectContext";
import Sidebar from "./sidebar/Sidebar";
import AnnotationTable from "./AnnotationTable";
import Paginator from "./Paginator";
import ProjectAppBar from "./AppBar";
import useProjectActions from "../../shared/hooks/api/project";

const Project = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [state, dispatch] = useContext(ProjectContext);
  const { getProjectProgress, getProject, getTexts } = useProjectActions();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [page, setPage] = useState(searchParams.get("page") || "1");

  useEffect(() => {
    // Load project
    const initProject = async () => {
      if (loading) {
        await getProjectProgress({ projectId });
        await getProject({ projectId });
        await getTexts({
          projectId,
          filters: state.filters,
          page: page,
          limit: state.pageLimit,
        });
        setLoading(false);
      }
    };

    initProject();
  }, [projectId]);

  useEffect(() => {
    // If projectId changes, reload data.
    setLoading(false);
  }, [projectId, state.pageLimit]);

  useEffect(() => {
    // Check if 'page' parameter is not present or is explicitly the empty string
    if (!searchParams.has("page") || searchParams.get("page") === "") {
      navigate(`/project/${projectId}?page=${page}`, { replace: true });
    }
  }, [projectId, navigate, page]);

  useEffect(() => {
    dispatch({ type: "SET_PAGE", payload: page });
  }, [page]);

  return (
    <Box display="flex">
      <CssBaseline />
      <ProjectAppBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" flexDirection="column" height="100vh">
            <Box mt={8} height="calc(100vh-204px)" overflow="auto">
              <AnnotationTable />
            </Box>
            <Paginator />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Project;
