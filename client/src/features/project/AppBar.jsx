import { useContext } from "react";
import {
  Typography,
  Toolbar,
  Stack,
  // IconButton,
  // CircularProgress,
  Button,
  Tooltip,
  Chip,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import { ProjectContext } from "../../shared/context/project-context";
import { styled } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ANNOTATION_SIDEBAR_WIDTH } from "../../shared/constants/layout";
import { truncateText } from "../../shared/utils/general";
import ThemeToggleButton from "../../shared/components/Layout/ThemeToggleButton";
import LinearProgressWithLabel from "./LinearProgressWithLabel";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: ANNOTATION_SIDEBAR_WIDTH,
    width: `calc(100% - ${ANNOTATION_SIDEBAR_WIDTH}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const ProjectAppBar = () => {
  const [state, dispatch] = useContext(ProjectContext);

  return (
    <AppBar
      position="absolute"
      color="secondary"
      open
      elevation={0}
      sx={{
        backgroundColor: "background.light",
        borderBottom: (theme) => `1px solid ${theme.palette.borders.primary}`,
      }}
    >
      <Toolbar sx={{ pr: "24px", color: "text.secondary" }}>
        {!state.projectLoading && (
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {truncateText(state.project.name, 35)}
          </Typography>
        )}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* {state.submitting && <CircularProgress size={18} />} */}
          {/* <FilterButton /> */}
          <ThemeToggleButton />
        </Stack>
      </Toolbar>
      <LinearProgressWithLabel />
    </AppBar>
  );
};

const FilterButton = () => {
  return (
    <Tooltip title="Toggle annotation filters">
      <Button
        // disabled
        variant="outlined"
        // onClick={() =>
        //   dispatch({
        //     type: "SET_VALUE",
        //     payload: { showFilterModal: true },
        //   })
        // }
        sx={{ backgroundColor: "background.default" }}
        startIcon={
          <FilterListIcon
          // sx={{ color: theme.palette.primary.main }}
          />
        }
        endIcon={
          <Chip
            label={
              <Typography
                fontSize={12}
                fontWeight={500}
                sx={{
                  textTransform: "capitalize",
                  cursor: "pointer",
                }}
              >
                Ctrl + F
              </Typography>
            }
            variant="outlined"
            sx={{ height: "22px" }}
            size="small"
            // disabled
          />
        }
      >
        Filters
      </Button>
    </Tooltip>
  );
};

export default ProjectAppBar;
