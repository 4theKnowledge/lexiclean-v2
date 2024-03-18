import {
  Badge,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { styled } from "@mui/material/styles";

import { PRIMARY_SIDEBAR_WIDTH } from "../../constants/layout";
import ThemeToggleButton from "./ThemeToggleButton";
import { useAppContext } from "../../context/AppContext";
import { useLocation, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ProjectContext } from "../../context/ProjectContext";
import useProjectActions from "../../hooks/api/project";
import useApi from "../../hooks/useApi";
import NotificationsBell from "./NotificationsBell";

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: PRIMARY_SIDEBAR_WIDTH,
    width: `calc(100% - ${PRIMARY_SIDEBAR_WIDTH}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const getNotificationTitle = (count) => {
  if (count === 0) {
    return "You have no unread notifications";
  } else if (count === 1) {
    return "You have 1 unread notification";
  } else {
    return `You have ${count} unread notifications`;
  }
};

const CustomAppBar = ({ drawerOpen, handleDrawerToggle }) => {
  const location = useLocation();
  const { projectId } = useParams();
  const { state } = useAppContext();
  const { getProjectName } = useProjectActions();
  const [currentPageContext, setCurrentPageContext] = useState("Loading...");
  const unreadNotificationsCount = state.notifications.filter(
    (n) => !n.read
  ).length;
  const locationSlugs = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = "/ " + locationSlugs.join(" / ");

  useEffect(() => {
    const fetchProjectDetail = async () => {
      // Assuming the 'dashboard' segment in the URL indicates viewing a specific project
      if (location.pathname.includes("/dashboard/") && projectId) {
        try {
          const name = await getProjectName({ projectId });
          setCurrentPageContext(name);
        } catch (error) {
          console.error("Failed to fetch project name:", error);
          setCurrentPageContext("Dashboard"); // Fallback text
        }
      } else {
        // Update currentPageContext based on the last segment of the URL or a specific rule
        setCurrentPageContext(
          locationSlugs[
            location.pathname.includes("/dashboard")
              ? locationSlugs.findIndex((slug) => slug === "dashboard") + 1
              : locationSlugs.length - 1
          ]
        );
      }
    };

    fetchProjectDetail();
  }, [location, projectId]);

  return (
    <AppBar
      position="absolute"
      open={drawerOpen}
      elevation={0}
      color="secondary"
      sx={{
        backgroundColor: "background.light",
        borderBottom: (theme) => `1px solid ${theme.palette.borders.primary}`,
      }}
    >
      <Toolbar
        sx={{
          pr: "24px", // keep right padding when drawer closed
          color: "text.secondary",
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{
            marginRight: "36px",
            ...(drawerOpen && { display: "none" }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Stack sx={{ flexGrow: 1 }}>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ textTransform: "capitalize" }}
          >
            {currentPageContext}
          </Typography>
          <Typography fontSize={10}>{breadcrumbs}</Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <NotificationsBell notifications={state.notifications} />
          {/* <IconButton color="inherit">
            <Tooltip title={getNotificationTitle(unreadNotificationsCount)}>
              <Badge badgeContent={unreadNotificationsCount} color="primary">
                <NotificationsIcon />
              </Badge>
            </Tooltip>
          </IconButton> */}
          <ThemeToggleButton />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
