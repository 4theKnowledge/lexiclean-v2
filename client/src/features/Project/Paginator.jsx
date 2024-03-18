import { useContext } from "react";
import { Skeleton, Box, Pagination } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ProjectContext } from "../../shared/context/ProjectContext";

const Paginator = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useContext(ProjectContext);
  const { projectId } = useParams();

  const handleChangePage = (event, newPage) => {
    dispatch({ type: "SET_PAGE", payload: newPage });
    navigate(`/project/${projectId}?page=${newPage}`, {
      replace: true,
    });
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      p={1}
    >
      {!state.totalTexts ? (
        <Skeleton variant="rectangular" width={300} height={40} />
      ) : Object.keys(state.texts).length === 0 ? null : (
        <Pagination
          component="div"
          shape="rounded"
          count={Math.ceil(state.totalTexts / state.pageLimit) ?? 0}
          page={parseInt(state.pageNumber)}
          onChange={handleChangePage}
          boundaryCount={1}
          siblingCount={1}
        />
      )}
    </Box>
  );
};

export default Paginator;
