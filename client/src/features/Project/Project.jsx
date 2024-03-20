import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, CssBaseline, Container } from "@mui/material";
import { ProjectContext } from "../../shared/context/ProjectContext";
import Sidebar from "./sidebar/Sidebar";
import AnnotationTable from "./AnnotationTable";
import Paginator from "./Paginator";
import ProjectAppBar from "./AppBar";
import useProjectActions from "../../shared/hooks/api/project";
import FilterModal from "./Modals/FilterModal";

const Project = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, dispatch] = useContext(ProjectContext);
  const { getProjectProgress, getProject, getTexts } = useProjectActions();
  const [loading, setLoading] = useState(true);
  const searchParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);

  const updateFiltersAndSortsInUrl = (newFilters) => {
    const searchParams = new URLSearchParams(location.search);
    Object.keys(newFilters).forEach((key) => {
      newFilters[key]
        ? searchParams.set(key, newFilters[key])
        : searchParams.delete(key);
    });
    navigate(`${location.pathname}?${searchParams}`, { replace: true });
  };

  const onFilterOrSortChange = ({ newFilters }) => {
    const newState = { ...state.filters, ...newFilters };
    dispatch({ type: "SET_FILTERS", payload: newState });
    updateFiltersAndSortsInUrl(newState);
  };

  useEffect(() => {
    if (page !== pageFromUrl) {
      setPage(pageFromUrl);
    }
    // This combines filter initialization with page updates
    const filtersFromUrl = {
      searchTerm: searchParams.get("searchTerm") || "",
      saved: searchParams.get("saved") || "all",
      externalId: searchParams.get("externalId") || "",
      // flag: searchParams.get("flag") || "all",
      rank: parseInt(searchParams.get("rank") || "1"),
    };
    console.log("filtersFromUrl: ", filtersFromUrl);

    dispatch({ type: "SET_FILTERS", payload: filtersFromUrl });
  }, [location.search]); // Depend on search string from location object

  useEffect(() => {
    if (page !== pageFromUrl) {
      setPage(pageFromUrl);
    }
  }, [location.search]); // Depend on search string from location object

  const loadData = async () => {
    setLoading(true);
    await getProjectProgress({ projectId });
    await getProject({ projectId });
    await getTexts({
      projectId,
      filters: state.filters,
      page,
      limit: state.pageLimit,
    });
    setLoading(false);
  };

  // Load or refresh data when projectId, page, or filters change
  useEffect(() => {
    loadData();
  }, [projectId, page, state.filters, state.pageLimit]);

  useEffect(() => {
    dispatch({ type: "SET_PAGE", payload: page });
  }, [page]);

  return (
    <>
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
      <FilterModal onFilterOrSortChange={onFilterOrSortChange} />
    </>
  );
};

export default Project;
