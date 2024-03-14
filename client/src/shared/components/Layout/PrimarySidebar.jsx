import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CreateIcon from "@mui/icons-material/Create";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link, useLocation } from "react-router-dom";
import { PRIMARY_SIDEBAR_WIDTH } from "../../constants/layout";
import UserDetail from "./UserDetail";
import BrandToolbar from "./BrandToolbar";
import LogoutButton from "./LogoutButton";

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: PRIMARY_SIDEBAR_WIDTH,
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

const PrimarySidebar = ({ drawerOpen, handleDrawerToggle }) => {
  const location = useLocation();

  const activeStyle = (path) => ({
    color: location.pathname === path ? "text.active" : "text.secondary",
    fontWeight: location.pathname === path && "bold",
    backgroundColor: location.pathname === path && "background.active",
    "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
      // Directly style the children
      color: "inherit", // Ensures that both text and icons inherit the ListItem color
    },
  });

  return (
    <Drawer variant="permanent" open={drawerOpen}>
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
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <BrandToolbar />
          <IconButton onClick={handleDrawerToggle} color="text.secondary">
            <ChevronLeftIcon />
          </IconButton>
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
        <Box p="1rem 1rem 1rem 0rem">
          <List>
            <ListItem
              component={Link}
              to="/projects"
              sx={activeStyle("/projects")}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary={"Projects"} />
            </ListItem>
            <ListItem
              component={Link}
              to="/project/create"
              sx={activeStyle("/project/create")}
            >
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText primary={"New Project"} />
            </ListItem>
          </List>
        </Box>
        <Box>
          <Box component="nav" p="1rem 1rem 1rem 0rem">
            <List>
              <ListItemButton
                component={Link}
                disabled={!process.env.REACT_APP_DOCS_URL}
                to={process.env.REACT_APP_DOCS_URL}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "text.secondary",
                }}
              >
                <ListItemIcon>
                  <ArticleIcon />
                </ListItemIcon>
                <ListItemText primary={"Documentation"} />
              </ListItemButton>
              <ListItemButton
                disabled
                // component={Link}
                // to="/settings"
                sx={{
                  color: "text.secondary",
                }}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary={"Settings"} />
              </ListItemButton>
            </List>
          </Box>
          <Divider />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={2}
            width="100%"
          >
            <Stack
              width="100%"
              spacing={2}
              direction="column"
              alignItems="center"
            >
              {/* {process.env.REACT_APP_SINGLE_USER ? (
                <Box>
                  <Typography>Single User Mode</Typography>
                </Box>
              ) : ( */}
              <UserDetail
                drawerOpen={drawerOpen}
                handleDrawerToggle={handleDrawerToggle}
              />
              {/* )} */}
              <LogoutButton drawerOpen={drawerOpen} />
            </Stack>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
export default PrimarySidebar;
