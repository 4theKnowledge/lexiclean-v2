import { Button, IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useAppContext } from "../../context/AppContext";

const LogoutButton = ({ drawerOpen = true }) => {
  const { state: appState, dispatch: appDispatch } = useAppContext();

  const handleDummyUserLogout = () => {
    appDispatch({ type: "LOGOUT_DUMMY_USER" });
  };

  const handleDummyUserLogin = () => {
    appDispatch({ type: "LOGIN_DUMMY_USER" });
  };

  if (drawerOpen) {
    return (
      <Button
        variant="outlined"
        startIcon={appState.user ? <LogoutIcon /> : <LoginIcon />}
        onClick={appState.user ? handleDummyUserLogout : handleDummyUserLogin}
      >
        Log{appState.user ? "out" : "in"}
      </Button>
    );
  } else {
    return (
      <Tooltip title={`Click to  ${appState.user ? "logout" : "login"}`}>
        <IconButton
          onClick={appState.user ? handleDummyUserLogout : handleDummyUserLogin}
        >
          {appState.user ? <LogoutIcon /> : <LoginIcon />}
        </IconButton>
      </Tooltip>
    );
  }
};

export default LogoutButton;
