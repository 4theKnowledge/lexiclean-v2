import { useState, useEffect, useContext } from "react";
import {
  Modal,
  Paper,
  Typography,
  Box,
  TextField,
  Divider,
  Stack,
  Button,
  Grid,
  MenuItem,
  Chip,
  Tooltip,
} from "@mui/material";
import { ProjectContext } from "../../../shared/context/ProjectContext";
import { modalStyle } from "../../../shared/constants/layout";
import { initialState as projectInitialState } from "../../../shared/context/ProjectContext";

const getFiltersAndSorts = ({ flagOptions }) => [
  {
    name: "searchTerm",
    filter: true,
    show: true,
    title: "Text Search",
    helper: "Search within texts for specified terms.",
    placeholder: "Enter search term(s), separated by commas",
    tooltip:
      "Search is case-insensitive and matches full words. Multiple terms are combined with 'AND'.",
    options: null,
  },
  {
    name: "saved",
    filter: true,
    show: true,
    title: "Saved Texts",
    helper: "Narrow down to texts that have been saved.",
    tooltip: "Choose to view all texts, only those saved, or those not saved.",
    options: [
      { value: "all", label: "All" },
      { value: "true", label: "True" },
      { value: "false", label: "False" },
    ],
  },
  // {
  //   name: "candidates",
  //   filter: true,
  //   show: true,
  //   title: "Candidate Words",
  //   helper: "Filter texts by the presence of out-of-vocabulary words.",
  //   tooltip:
  //     "Select to view all texts, or filter by texts with or without candidate words.",
  //   options: [
  //     { value: "all", label: "All" },
  //     { value: "true", label: "True" },
  //     { value: "false", label: "False" },
  //   ],
  // },
  {
    name: "flags",
    filter: true,
    show: true,
    title: "Flagged Texts",
    helper: "Filter by the presence of flags on texts.",
    tooltip: "View texts that have been flagged for review or attention.",
    options: [{ value: "all", label: "All" }, ...flagOptions],
  },
  // {
  //   name: "quality",
  //   filter: true,
  //   show: true,
  //   title: "Quality Filters",
  //   helper:
  //     "Filter texts based on the quality of token transformations and tags.",
  //   tooltip:
  //     "Choose from all, accepted, or suggested based on quality criteria.",
  //   options: [
  //     { value: "all", label: "All" },
  //     { value: "accepted", label: "Accepted" },
  //     { value: "suggested", label: "Suggested" },
  //   ],
  // },
  {
    name: "externalIds",
    filter: true,
    show: true,
    title: "External Identifiers",
    helper: "Locate texts using external identifiers.",
    placeholder: "Enter external identifier(s), separated by commas",
    tooltip: "Enter one or more external IDs to find specific texts directly.",
    options: null,
  },
  // {
  //   name: "referenceSearchTerm",
  //   filter: true,
  //   show: false,
  //   title: "Reference Text Search",
  //   helper: "Search within reference texts for specific terms.",
  //   placeholder: "Enter search term(s), separated by commas",
  //   tooltip:
  //     "Matches are case-insensitive, for whole words. Use 'AND' logic for multiple terms.",
  //   options: null,
  // },
  {
    name: "rank",
    show: true,
    filter: false,
    title: "Sort by Rank",
    helper: "Order texts by their rank.",
    tooltip:
      "Higher ranks first or lower ranks first - choose your preference. Lower numbers are higher in the ranking.",
    options: [
      { value: 1, label: "High to Low" },
      { value: -1, label: "Low to High" },
    ],
  },
];

const haveFiltersChanged = (currentFilters, initialFilters) => {
  return Object.keys(initialFilters).some(
    (key) => currentFilters[key] !== initialFilters[key]
  );
};

const FilterModal = ({ onFilterOrSortChange }) => {
  const { filters: initialStatefilters } = projectInitialState;

  const [state, dispatch] = useContext(ProjectContext);
  const [initialFilters, setIntialFilters] = useState({ ...state.filters });
  const [filters, setFilters] = useState({ ...state.filters });
  const [filtersChanged, setFiltersChanged] = useState(false);

  const filtersAndSorts = getFiltersAndSorts({
    flagOptions:
      state?.project?.flags.map((f) => ({
        value: f._id,
        label: f.name,
      })) ?? [],
  });

  useEffect(() => {
    const filtersHaveChanged = haveFiltersChanged(filters, initialFilters);
    setFiltersChanged(filtersHaveChanged);
  }, [filters]);

  useEffect(() => {
    setFilters({ ...state.filters });
    setIntialFilters({ ...state.filters });
  }, [state.filters]);

  const handleApply = () => {
    onFilterOrSortChange({ newFilters: filters });
    handleClose();
  };

  const handleClose = () => {
    dispatch({ type: "SET_VALUE", payload: { showFilterModal: false } });
  };

  const handleChange = ({ key, value }) => {
    setFilters((prevState) => ({ ...prevState, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialStatefilters);
  };

  return (
    <Modal open={state.showFilterModal} onClose={handleClose}>
      <Box sx={modalStyle} as={Paper} variant="outlined">
        <FilterHeader handleClose={handleClose} />
        <Divider flexItem />
        <Box sx={{ maxHeight: 600, overflowY: "auto" }} p="1rem 2rem">
          {filtersAndSorts
            .filter((item) => item.show)
            .map((item) => (
              <FilterItem
                {...item}
                filters={filters}
                handleChange={handleChange}
              />
            ))}
        </Box>
        <FilterActionButtons
          filtersChanged={filtersChanged}
          resetFilters={resetFilters}
          handleClose={handleClose}
          handleApply={handleApply}
        />
      </Box>
    </Modal>
  );
};

const FilterHeader = ({ handleClose }) => {
  return (
    <Box p="1rem 2rem">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="column">
          <Typography variant="h6">Filters</Typography>
          <Typography variant="caption">
            Filter project dataset for items with the following attributes or
            content
          </Typography>
        </Stack>
        <Chip
          label="esc"
          sx={{ fontWeight: 700, fontSize: 12 }}
          onClick={handleClose}
          variant="outlined"
          clickable
          color="primary"
        />
      </Stack>
    </Box>
  );
};

const FilterItem = ({
  name,
  title,
  helper,
  placeholder,
  tooltip,
  options,
  filters,
  handleChange,
}) => {
  return (
    <Grid item xs={12} container alignItems="center" spacing={2} mb={1}>
      <Grid item xs={4}>
        <Stack direction="column">
          <Stack
            direction="row"
            alignItems="center"
            sx={{ color: "text.secondary" }}
          >
            <Tooltip title={tooltip} arrow placement="right">
              <Typography fontSize={16} sx={{ cursor: "help" }}>
                {title}
              </Typography>
            </Tooltip>
          </Stack>
          <Typography variant="caption">{helper}</Typography>
        </Stack>
      </Grid>
      <Grid item xs={8} xl={8}>
        {options ? (
          <TextField
            id={`annotation-filter-sort-select-${name}`}
            select
            fullWidth
            value={filters[name]}
            onChange={(e) => handleChange({ key: name, value: e.target.value })}
            sx={{ textTransform: "capitalize" }}
          >
            {options.map((option) => (
              <MenuItem
                key={`menu-item-${name}-${option.value}`}
                value={option.value}
                sx={{ textTransform: "capitalize" }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <TextField
            required
            id={`annotation-filter-sort-textfield-${name}`}
            type="text"
            margin="normal"
            placeholder={placeholder}
            fullWidth
            value={filters[name]}
            onChange={(e) => handleChange({ key: name, value: e.target.value })}
            autoComplete="false"
          />
        )}
      </Grid>
    </Grid>
  );
};

const FilterActionButtons = ({
  filtersChanged,
  resetFilters,
  handleClose,
  handleApply,
}) => {
  return (
    <Box
      sx={{
        bgcolor: "background.accent",
        borderRadius: "0px 0px 16px 16px",
      }}
    >
      <Stack direction="row" justifyContent="right" spacing={2} p="0.5rem 2rem">
        <Button
          onClick={resetFilters}
          title="Click to reset filters"
          size="small"
        >
          Reset Filters
        </Button>
        <Divider flexItem orientation="vertical" />
        <Button
          variant="outlined"
          title="Click to close"
          onClick={handleClose}
          sx={{
            textDecoration: "none",
          }}
          disableElevation
          size="small"
        >
          Discard
        </Button>
        <Button
          variant="contained"
          title="Click to apply filters"
          onClick={handleApply}
          disableElevation
          size="small"
          disabled={!filtersChanged}
        >
          Apply Filter
        </Button>
      </Stack>
    </Box>
  );
};

export default FilterModal;
