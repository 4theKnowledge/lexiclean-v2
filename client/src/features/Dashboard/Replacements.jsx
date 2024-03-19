// View only component
import { Chip, Stack, Tooltip } from "@mui/material";
import StyledCard from "./StyledCard";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "input",
    headerName: "Input",
    flex: 1,
    align: "center",
    headerAlign: "center",
    description: "This is the incorrect input word that is to be replaced",
  },
  {
    field: "output",
    headerName: "Output",
    flex: 1,
    align: "center",
    headerAlign: "center",
    description: "This is the correct output word that is the replacement",
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
    description: "Is this input/output pair newly introduced by annotators?",
  },
  {
    description: "This is the frequency of usage by project annotators",
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
    sortable: false,
    filterable: false,
  },
];

const Replacements = ({ data }) => {
  return (
    <StyledCard title="Replacements">
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={data?.lists.replacementHistory ?? []}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
            columns: {
              columnVisibilityModel: {
                id: false,
                new: false,
              },
            },
          }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick={true}
        />
      </div>
    </StyledCard>
  );
};

export default Replacements;
