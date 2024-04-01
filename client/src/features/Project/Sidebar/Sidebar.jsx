import { useContext } from "react";
import {
  Stack,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Toolbar,
  ListItem,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Link, useParams } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import HomeIcon from "@mui/icons-material/Home";
import { ProjectContext } from "../../../shared/context/ProjectContext";
import EntitySelector from "./EntitySelector";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { styled } from "@mui/material/styles";
import UserDetail from "../../../shared/components/Layout/UserDetail";
import BrandToolbar from "../../../shared/components/Layout/BrandToolbar";
import Contextualiser from "./Contextualiser";
import LogoutButton from "../../../shared/components/Layout/LogoutButton";
import { ANNOTATION_SIDEBAR_WIDTH } from "../../../shared/constants/layout";
import useProjectActions from "../../../shared/hooks/api/project";

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: ANNOTATION_SIDEBAR_WIDTH,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const Sidebar = () => {
  const { projectId } = useParams();
  const [state, dispatch] = useContext(ProjectContext);
  const { saveTexts } = useProjectActions();

  const unsavedItemsCount = state.texts
    ? Object.values(state.texts).length -
      Object.values(state.texts).filter((text) => text.saved).length
    : 0;

  const savePending = unsavedItemsCount !== 0;

  const handlePageSave = async () => {
    await saveTexts({
      projectId,
      textIds: Object.keys(state.texts),
      isSaved: true,
    });
  };

  return (
    <Drawer
      variant="permanent"
      open={true}
      sx={{ backgroundColor: "background.light" }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
          color: "text.secondary",
          backgroundColor: "background.light",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="left"
          width="100%"
        >
          <BrandToolbar />
        </Box>
      </Toolbar>
      <Divider flexItem />
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        height="100%"
        sx={{ backgroundColor: "background.light" }}
      >
        <Box p={2}>
          <Stack direction="column" spacing={2}>
            <EntitySelector />
            <Contextualiser />
          </Stack>
        </Box>
        <Box>
          <Box component="nav" p="1rem 1rem 1rem 0rem">
            <List>
              <Tooltip
                title="Double click to save all texts on the current page"
                placement="right"
              >
                <ListItemButton
                  onDoubleClick={handlePageSave}
                  sx={{ color: "text.secondary" }}
                >
                  <ListItemIcon>
                    <SaveIcon color={savePending ? "primary" : "default"} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Save Page ${
                      savePending ? "(" + unsavedItemsCount + ")" : ""
                    }`}
                  />
                </ListItemButton>
              </Tooltip>
              {state.project && state.project.parallelCorpus && (
                <Tooltip
                  title="Click to toggle reference text visibility"
                  placement="right"
                >
                  <ListItemButton
                    onClick={() =>
                      dispatch({
                        type: "SET_VALUE",
                        payload: { showReferences: !state.showReferences },
                      })
                    }
                    sx={{ color: "text.secondary" }}
                    key="reference-switch-btn"
                  >
                    <ListItemIcon>
                      {state.showReferences ? (
                        <ToggleOnIcon />
                      ) : (
                        <ToggleOffIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`${
                        state.showReferences ? "Hide" : "Show"
                      } Reference Texts`}
                    />
                  </ListItemButton>
                </Tooltip>
              )}
              {/* <ListItemButton
              disabled
              onClick={() =>
                dispatch({
                  type: "SET_VALUE",
                  payload: { showShortcutModal: true },
                })
              }
              sx={{
                minHeight: 48,
                justifyContent: "initial",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: "center",
                  mr: 4,
                }}
              >
                <ShortcutIcon />
              </ListItemIcon>
              <ListItemText primary={"Keyboard Shortcuts"} />
            </ListItemButton> */}
              <ListItem
                component={Link}
                to={`/dashboard/${projectId}`}
                sx={{ color: "text.secondary" }}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem
                component={Link}
                to="/projects"
                sx={{ color: "text.secondary" }}
              >
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Projects" />
              </ListItem>
            </List>
          </Box>
          <Divider />
          <Box display="flex" p={2} justifyContent="center" alignItems="center">
            <Stack
              width="100%"
              spacing={2}
              direction="column"
              alignItems="center"
            >
              <UserDetail />
              <LogoutButton />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
