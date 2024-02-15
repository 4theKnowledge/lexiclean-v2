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
  Container,
  Box,
} from "@mui/material";
import StartIcon from "@mui/icons-material/Start";
import LogoutIcon from "@mui/icons-material/Logout";
import ArticleIcon from "@mui/icons-material/Article";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import { useAuth0 } from "@auth0/auth0-react";

// import { selectIsAuthenticated } from "../auth/userSlice";
import { useNavigate, Link } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import ThemeToggleButton from "../../shared/components/Layout/ThemeToggleButton";

const Landing = () => {
  // const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "background.light", height: "100vh" }}>
      <Container maxWidth="lg">
        <Box
          display="flex"
          p="1rem 0rem"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <BubbleChartIcon sx={{ color: "text.brandText" }} />
            <Typography fontWeight={600} color="text.brandText">
              LexiClean
            </Typography>
          </Stack>
          {/* {isAuthenticated && (
            <IconButton onClick={logout} title="Click to logout">
            <LogoutIcon color="secondary" id="information" />
            </IconButton>
          )} */}
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit">
              <GitHubIcon />
            </IconButton>
            <ThemeToggleButton />
            <Button size="small">Login</Button>
            <Button variant="contained" size="small" disableElevation>
              Get Started
            </Button>
          </Stack>
        </Box>
        <Box
          display="flex"
          mt={"25vh"}
          flexDirection="column"
          alignItems="left"
          justifyContent="left"
        >
          <Stack direction="column" spacing={4}>
            <Typography variant="h3" gutterBottom>
              Transform Your Texts with Precision: Multi-Task Lexical
              Normalisation & Entity Tagging
            </Typography>
            <Typography fontSize={16} gutterBottom color="text.secondary">
              Unlock the full potential of your textual data with LexiClean,
              designed to elevate the quality of your texts for downstream NLP
              tasks. Enhance accuracy, streamline workflows, and achieve
              superior results in all your NLP projects.
            </Typography>
            <Box>
              <LoginButton />
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

const LoginButton = () => {
  // const { loginWithRedirect } = useAuth0();

  const isAuthenticated = true;

  if (isAuthenticated) {
    return (
      <Button
        variant="contained"
        component={Link}
        to="/projects"
        // endIcon={<ArrowForwardIosIcon />}
      >
        Get Started
      </Button>
    );
  } else {
    return (
      <Button
        variant="contained"
        // onClick={() => loginWithRedirect()}
      >
        Login or Sign up
      </Button>
    );
  }
};

export default Landing;
