import {
  Button,
  IconButton,
  Typography,
  Stack,
  Container,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GitHubIcon from "@mui/icons-material/GitHub";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import ThemeToggleButton from "../../shared/components/Layout/ThemeToggleButton";
import { getAuthServiceStrategy } from "../../shared/auth/AuthServiceConfig";

const Landing = () => {
  const useAuthStrategy = getAuthServiceStrategy();
  const { isAuthenticated, login, logout } = useAuthStrategy();

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
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton color="inherit">
              <GitHubIcon />
            </IconButton>
            <ThemeToggleButton />
            <Button
              size="small"
              onClick={
                isAuthenticated
                  ? () => logout({ returnTo: window.location.origin })
                  : login
              }
            >
              {isAuthenticated ? "Logout" : "Login"}
            </Button>
            <ActionButton size={"small"} />
          </Stack>
        </Box>
        <MainContent />
      </Container>
    </Box>
  );
};

const ActionButton = ({ size = "medium" }) => {
  const useAuthStrategy = getAuthServiceStrategy();
  const { isAuthenticated, login } = useAuthStrategy();

  return isAuthenticated ? (
    <Button
      variant="contained"
      component={Link}
      to="/projects"
      size={size}
      disableElevation
      endIcon={<ArrowForwardIosIcon />}
    >
      Enter
    </Button>
  ) : (
    <Button variant="contained" size={size} disableElevation onClick={login}>
      Get Started
    </Button>
  );
};

const MainContent = () => {
  return (
    <Box
      display="flex"
      mt={"25vh"}
      flexDirection="column"
      alignItems="left"
      justifyContent="left"
    >
      <Stack direction="column" spacing={4}>
        <Typography variant="h3" gutterBottom>
          {/* TODO: Add "Collaborative" when the multi-user functionality is added. */}
          Transform Your Texts with Precision: Multi-Task Lexical Normalisation
          & Entity Tagging
        </Typography>
        <Typography fontSize={16} gutterBottom color="text.secondary">
          Unlock the full potential of your textual data with LexiClean,
          designed to elevate the quality of your texts for downstream NLP
          tasks. Enhance accuracy, streamline workflows, and achieve superior
          results in all your NLP projects.
        </Typography>
        <Box>
          <ActionButton />
        </Box>
      </Stack>
    </Box>
  );
};

export default Landing;
