import React, { useContext } from "react";
// import history from "../utils/history";
import {
  AppBar,
  Button,
  Grid,
  Toolbar,
  IconButton,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import StartIcon from "@mui/icons-material/Start";
import LogoutIcon from "@mui/icons-material/Logout";
import ArticleIcon from "@mui/icons-material/Article";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useAuth0 } from "@auth0/auth0-react";

// import { selectIsAuthenticated } from "../auth/userSlice";
import { useNavigate, Link } from "react-router-dom";

const Landing = () => {
  // const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      style={{ zIndex: 999 }}
    >
      <Grid item xs={12} style={{ flexGrow: 1 }}>
        <AppBar position="fixed" elevation={0} style={{ background: "none" }}>
          <Toolbar style={{ display: "flex", justifyContent: "right" }}>
            {/* {isAuthenticated && (
              <IconButton onClick={logout} title="Click to logout">
                <LogoutIcon color="secondary" id="information" />
              </IconButton>
            )} */}
          </Toolbar>
        </AppBar>
      </Grid>
      <Grid
        container
        item
        justifyContent="center"
        alignItems="center"
        direction="column"
        sx={{ textAlign: "center", height: "100vh", zIndex: 999 }}
        spacing={2}
      >
        <Grid container item spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h3" gutterBottom>
              LexiClean
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              An annotation tool for rapid multi-task lexical normalisation
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <LoginButton />
        </Grid>
      </Grid>
    </Grid>
  );
};

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const isAuthenticated = true;

  if (isAuthenticated) {
    return (
      <Button
        variant="contained"
        component={Link}
        to="/projects"
        endIcon={<ArrowForwardIosIcon />}
      >
        Enter
      </Button>
    );
  } else {
    return (
      <Button variant="contained" onClick={() => loginWithRedirect()}>
        Log In or Sign up
      </Button>
    );
  }
};

export default Landing;
