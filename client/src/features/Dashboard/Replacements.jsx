// View only component
import { Alert, AlertTitle, Box, Chip, Stack, Tooltip } from "@mui/material";
import StyledCard from "./StyledCard";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  { field: "id", headerName: "ID", width: 90, hide: true },
  {
    field: "input",
    headerName: "Input",
    flex: 1,
    align: "center",
    headerAlign: "center",
    description:
      "The original, incorrect input word that is suggested for replacement.",
  },
  {
    field: "output",
    headerName: "Output",
    flex: 1,
    align: "center",
    headerAlign: "center",
    description: "The correct replacement for the input word.",
    renderCell: (params) =>
      params.value === "" ? (
        <Chip label="Deleted" color="error" size="small" />
      ) : (
        params.value
      ),
  },
  {
    field: "new",
    headerName: "New",
    width: 120,
    align: "center",
    headerAlign: "center",
    description:
      "Indicates if this input/output pair is a new suggestion by annotators.",
    hide: true,
  },
  {
    field: "usedBy",
    flex: 1,
    headerName: "Used By",
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        {Object.entries(params.value).map(([userName, count]) => {
          return (
            <Tooltip
              title={`${userName} used this replacement ${count} times`}
              placement="top"
              arrow
            >
              <Chip
                sx={{ cursor: "help" }}
                key={`usedby-${userName}-${count}`}
                label={`${userName}: ${count}`}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          );
        })}
      </Stack>
    ),
    headerAlign: "center",
    align: "left",
    description:
      "Displays which annotators have used this replacement and how many times.",
    sortable: false,
    filterable: false,
  },
];

const Replacements = ({ data }) => {
  return (
    <StyledCard title="Replacements">
      <Box p={"0rem 0.5rem 1rem 0.5rem"}>
        <Alert severity="info">
          <AlertTitle>Understanding Replacements</AlertTitle>
          Explore token-level transformations, known as "replacements", to
          comprehend annotator consensus and variation. "Input" denotes original
          tokens, while "Output" showcases consensus replacements. The "Used By"
          field quantifies each annotator's adoption, enhancing your oversight
          and enabling refinement.
        </Alert>
      </Box>
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={data?.lists.replacementHistory ?? []}
          columns={columns}
          pageSize={5}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
        />
      </div>
    </StyledCard>
  );
};

export default Replacements;
