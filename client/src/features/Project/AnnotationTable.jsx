import { useState, useContext } from "react";
import {
  Grid,
  Stack,
  Skeleton,
  Box,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { TextContainer } from "./TextContainer";
import { ProjectContext } from "../../shared/context/ProjectContext";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { useLocation, useNavigate } from "react-router-dom";

const AnnotationTable = () => {
  const [state, dispatch] = useContext(ProjectContext);
  // console.log("AnnotationTable state: ", state);

  //   const pageBeforeViewChange = useSelector(selectPageBeforeViewChange);

  // useEffect(() => {
  //   axios
  //     .post(
  //       "/api/text/filter",
  //       { projectId: projectId },
  //       { params: { page: pageNumber, limit: pageLimit } }
  //     )
  //     .then((response) => {
  //       setTexts(response.data.texts);
  //       setLoading(false);
  //     });

  //   // Puts annotation div at the top on page change
  //   const element = document.getElementById("text-container-0");
  //   if (element) {
  //     element.scrollIntoView();
  //   }
  // }, [pageNumber]);

  const skeletonMask = (index) => (
    <Stack
      key={`table-skeleton-mask-${index}`}
      id={`${index}`}
      direction="row"
      sx={{ width: "80%" }}
      spacing={4}
      justifyContent="center"
      alignItems="center"
    >
      <Skeleton variant="text" width={100} height={100} />
      <Skeleton variant="text" width="70%" height={100} />
      <Skeleton variant="text" width={100} height={100} />
    </Stack>
  );

  return (
    <Grid item xs={12} tabIndex="-1" sx={{ outline: "none" }} p={2}>
      {!state.textsLoading &&
        state.texts &&
        Object.keys(state.texts).length > 0 &&
        Object.keys(state.texts).map((id, index) => (
          <TextContainer
            text={state.texts[id]}
            textId={id}
            textIndex={index}
            key={id}
          />
        ))}
      {!state.textsLoading && Object.keys(state.texts).length === 0 && (
        <NoResultsFound />
      )}
      {state.textsLoading && (
        <Stack
          spacing={4}
          direction="column"
          justifyContent="center"
          alignItems="center"
          mt={4}
        >
          {Array(8)
            .fill()
            .map((_, index) => skeletonMask(index))}
        </Stack>
      )}
    </Grid>
  );
};

const NoResultsFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, dispatch] = useContext(ProjectContext);

  const handleRefresh = () => {
    navigate(location.pathname, { replace: true });
  };

  const handleShowFilters = () => {
    dispatch({ type: "SET_VALUE", payload: { showFilterModal: true } });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        p: 3,
      }}
    >
      <Paper variant="outlined" sx={{ textAlign: "center", p: 3 }}>
        <SearchIcon sx={{ fontSize: 60, mb: 2 }} color="primary" />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No Results Found
        </Typography>
        <Typography sx={{ mb: 2 }}>
          We couldn't find any matching results. Try adjusting your filters or
          search criteria.
        </Typography>
        <Box display="flex" gap={2} justifyContent="center" alignItems="center">
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            color="primary"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            startIcon={<FilterAltIcon />}
            variant="outlined"
            color="primary"
            onClick={handleShowFilters}
          >
            Filters
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AnnotationTable;
