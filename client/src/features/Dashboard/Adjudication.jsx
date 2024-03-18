import React, { useEffect, useState } from "react";
import StyledCard from "./StyledCard";
import { Box } from "@mui/system";
import {
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from "@mui/material";

const rowsPerPage = 5;

const Adjudication = ({ data }) => {
  return (
    <StyledCard title="Adjudication">
      <AnnotationGrid data={data} />
    </StyledCard>
  );
};

const AnnotationGrid = ({
  data = { tokens: [], annotations: {}, compiled: {} },
}) => {
  const { tokens, annotations, compiled } = data;
  const [page, setPage] = useState(1);
  const annotationsKeys = Object.keys(annotations);
  const count = Math.ceil(annotationsKeys.length / rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  console.log(data);

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, annotationsKeys.length - (page - 1) * rowsPerPage);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }} variant="outlined">
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>User / Token</TableCell>
              {tokens.map((token, index) => (
                <TableCell key={index} align="center">
                  {token}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? annotationsKeys.slice(
                  (page - 1) * rowsPerPage,
                  (page - 1) * rowsPerPage + rowsPerPage
                )
              : annotationsKeys
            ).map((user) => (
              <TableRow key={user}>
                <TableCell component="th" scope="row">
                  {user}
                </TableCell>
                {annotations[user].map((annotation, index) => (
                  <TableCell key={index} align="center">
                    {annotation}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell component="th" scope="row">
                Compiled
              </TableCell>
              {compiled.tokens?.map((comp, index) => (
                <TableCell key={index} align="center">
                  {comp}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Pagination count={count} page={page} onChange={handleChangePage} />
      </Box>
    </Paper>
  );
};

export default Adjudication;
