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
import { useLocation } from "react-router-dom";

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
  const location = useLocation(); // Hook from React Router to get the current location
  const { state } = useAppContext();
  const unreadNotificationsCount = state.notifications.filter(
    (n) => !n.read
  ).length;

  const locationSlugs = location.pathname.split("/").filter(Boolean);
  const currentPageContext =
    locationSlugs[
      location.pathname.includes("dashboard") ? 0 : locationSlugs.length - 1
    ];
  const breadcrumbs = locationSlugs.join(" / ");

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
          <IconButton color="inherit">
            <Tooltip title={getNotificationTitle(unreadNotificationsCount)}>
              <Badge badgeContent={unreadNotificationsCount} color="primary">
                <NotificationsIcon />
              </Badge>
            </Tooltip>
          </IconButton>
          <ThemeToggleButton />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;
