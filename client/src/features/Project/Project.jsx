import { useState, useEffect, useContext } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Box, CssBaseline, Container } from "@mui/material";
import { ProjectContext } from "../../shared/context/ProjectContext";
import Sidebar from "./sidebar/Sidebar";
import AnnotationTable from "./AnnotationTable";
import Paginator from "./Paginator";
import ProjectAppBar from "./AppBar";
import useProjectActions from "../../shared/hooks/api/project";

const Project = () => {
  const { projectId } = useParams();
  const [state, dispatch] = useContext(ProjectContext);
  const { getProjectProgress, getProject, getTexts } = useProjectActions();
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pageFromUrl = searchParams.get("page") || "1";
  const [page, setPage] = useState(pageFromUrl);

  useEffect(() => {
    if (page !== pageFromUrl) {
      setPage(pageFromUrl);
    }
  }, [location.search]); // Depend on search string from location object

  const loadData = async () => {
    console.log("loading project data...");
    await getProjectProgress({ projectId });
    await getProject({ projectId });
    await getTexts({
      projectId,
      filters: state.filters,
      page,
      limit: state.pageLimit,
    });
  };

  // Load or refresh data when projectId or page changes
  useEffect(() => {
    setLoading(true); // Set loading to true to indicate loading state
    loadData().then(() => setLoading(false)); // Load data and then set loading to false
  }, [projectId, page, state.filters, state.pageLimit]);

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
