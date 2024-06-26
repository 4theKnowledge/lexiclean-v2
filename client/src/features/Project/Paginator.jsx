import { useContext } from "react";
import { TablePagination, Skeleton, Box, Pagination } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ProjectContext } from "../../shared/context/ProjectContext";
// import useProjectActions from "../../shared/hooks/api/project";

const Paginator = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useContext(ProjectContext);

  const handleChangePage = (event, newPage) => {
    dispatch({ type: "SET_PAGE", payload: newPage + 1 });
    navigate(`/project/${state.projectId}?page=${newPage + 1}`, {
      replace: true,
    });
  };

  // const handleChangeRowsPerPage = (event) => {
  //   dispatch({
  //     type: "SET_VALUE",
  //     payload: { pageLimit: parseInt(event.target.value, 10) },
  //   });
  //   dispatch({ type: "SET_PAGE", payload: 1 });

  //   if (Number(state.pageNumber) !== 1) {
  //     navigate(`/project/${state.projectId}/page=1`);
  //   }
  // };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
    >
      {!state.totalTexts ? (
        <Skeleton variant="rectangular" width={300} height={40} />
      ) : Object.keys(state.texts).length === 0 ? null : (
        <Pagination
          component="div"
          count={Math.ceil(state.totalTexts / state.pageLimit) ?? 0}
          page={state.pageNumber}
          onPageChange={handleChangePage}
        />

        // <TablePagination
        //   component="div"
        //   count={state.totalTexts ?? 0}
        //   page={state.pageNumber - 1}
        //   onPageChange={handleChangePage}
        //   rowsPerPage={state.pageLimit}
        //   rowsPerPageOptions={[1, 2, 5, 10, 20]}
        //   onRowsPerPageChange={handleChangeRowsPerPage}
        // />
      )}
    </Box>
  );
};

export default Paginator;
