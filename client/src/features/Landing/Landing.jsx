import {
  Button,
  IconButton,
  Typography,
  Stack,
  Container,
  Box,
  Grid,
  Paper,
  Link as MuiLink,
  Skeleton,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GitHubIcon from "@mui/icons-material/GitHub";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import ThemeToggleButton from "../../shared/components/Layout/ThemeToggleButton";
import { getAuthServiceStrategy } from "../../shared/auth/AuthServiceConfig";
import { useContext, useState } from "react";
import { ThemeContext } from "../../shared/context/ThemeContext";

const Landing = () => {
  const useAuthStrategy = getAuthServiceStrategy();
  const { isAuthenticated, login, logout } = useAuthStrategy();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "background.light",
      }}
    >
      <Container component="main" maxWidth="lg" sx={{ flex: 1 }}>
        {/* Header */}
        <Box
          display="flex"
          p="1rem 0rem"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1100,
            backgroundColor: "inherit",
          }}
        >
          {/* Brand */}
          <Stack direction="row" spacing={1} alignItems="center">
            <BubbleChartIcon sx={{ color: "text.brandText" }} />
            <Typography fontWeight={600} color="text.brandText" variant="h6">
              LexiClean
            </Typography>
          </Stack>
          {/* Actions */}
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
        {/* Main Content */}
        <MainContent />
      </Container>
      <Footer />
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
  const { mode } = useContext(ThemeContext);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        height: "calc(100vh - 128px)",
        mt: "-64px",
        overflow: "auto",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item md={4} xs={12}>
          <Stack direction="column" spacing={4}>
            <Typography variant="h4" gutterBottom>
              Transform Your Texts with Precision: Collaborative Multi-Task
              Lexical Normalisation & Entity Tagging
            </Typography>
            <Typography fontSize={16} gutterBottom color="text.secondary">
              Unlock the full potential of your textual data with LexiClean,
              designed to elevate the quality of your texts for downstream NLP
              tasks. Collaborative enhance accuracy, streamline workflows, and
              achieve superior results in all your NLP projects.
            </Typography>
            <Box>
              <ActionButton />
            </Box>
          </Stack>
        </Grid>
        <Grid item md={8} xs={12}>
          <Paper sx={{ borderRadius: 2, height: "100%" }} elevation={4}>
            {!imageLoaded && (
              <Skeleton
                variant="rectangular"
                width="100%"
                sx={{ paddingTop: "56.25%" }} // Aspect ratio of 16:9
              />
            )}
            <Box
              component="img"
              sx={{
                display: imageLoaded ? "block" : "none", // Only display the image once it's loaded
                maxWidth: "100%",
                borderRadius: "inherit",
                maxHeight: "100%",
                objectFit: "contain",
              }}
              src={`${process.env.PUBLIC_URL}/static/annotation_interface_${mode}.png`}
              alt="Annotation Interface"
              onLoad={() => setImageLoaded(true)} // Set imageLoaded to true when the image finishes loading
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        backgroundColor: "background.paper",
        textAlign: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1">
          <MuiLink
            href={`${process.env.REACT_APP_DOCS_URL}/privacy-policy`}
            color="primary"
            underline="hover"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </MuiLink>
          {" | "}
          <MuiLink
            href={`${process.env.REACT_APP_DOCS_URL}/terms-and-conditions`}
            color="primary"
            underline="hover"
            target="_blank"
            rel="noreferrer"
          >
            Terms & Conditions
          </MuiLink>
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Launched into the digital cosmos by{" "}
          <span role="img" aria-label="rocket">
            🚀
          </span>{" "}
          <MuiLink
            href="https://github.com/4theKnowledge"
            color="primary"
            underline="hover"
            target="_blank"
            rel="noreferrer"
          >
            Tyler Bikaun (4theKnowledge)
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Landing;
