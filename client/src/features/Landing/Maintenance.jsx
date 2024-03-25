import {
  Button,
  Typography,
  Stack,
  Container,
  Box,
  Grid,
  Paper,
  Link as MuiLink,
  Skeleton,
  useMediaQuery,
  Alert,
  AlertTitle,
} from "@mui/material";
import { Link } from "react-router-dom";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import ThemeToggleButton from "../../shared/components/Layout/ThemeToggleButton";
import { getAuthServiceStrategy } from "../../shared/auth/AuthServiceConfig";
import { useContext, useState } from "react";
import { ThemeContext } from "../../shared/context/ThemeContext";

const features = [
  {
    title: "Elevate & Protect Your Data",
    content:
      "Boost your data’s quality and safeguard privacy with LexiClean. Our tool combines advanced normalisation and tagging capabilities to refine your text data meticulously, ensuring precision and protection effortlessly.",
  },
  {
    title: "Collaboration Meets Innovation",
    content:
      "Embrace collaborative intelligence with LexiClean. Our platform empowers you to join forces with peers, enhancing data accuracy and unveiling deep insights, all within a shared, innovative workspace.",
  },
  {
    title: "Empowering the Future, Openly",
    content:
      "Commitment to open-source is at our core. LexiClean invites you to refine text quality and protect sensitive data with full confidence, leveraging our transparent, community-driven solutions in your own environment.",
  },
  {
    title: "Machine Learning Ready",
    content:
      "Streamline your annotation tasks with LexiClean’s OpenAI integration. Access annotated datasets effortlessly, readying your machine learning models for the future, faster and more efficiently.",
  },
];

const Landing = () => {
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
        <Header />
        <Alert severity="info">
          <AlertTitle>
            <strong>Heads Up - We're Sprucing Things Up!</strong>
          </AlertTitle>
          <p>
            The LexiClean platform is currently getting a bit of a polish during
            maintenance. We're working hard to make it sparkle and shine for you
            as soon as possible!
          </p>
          <p>
            While you wait, why not connect with us directly through the GitHub
            link in our website's footer. Your insights and queries are always
            welcome!
          </p>
          <p>
            Thank you for your patience and understanding. We're excited to
            welcome you back with an even better LexiClean experience very soon!
          </p>
        </Alert>

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
      //   to="/projects"
      size={size}
      disableElevation
      endIcon={<ArrowForwardIosIcon />}
      disabled
    >
      Enter
    </Button>
  ) : (
    <Button
      variant="contained"
      size={size}
      disableElevation
      disabled
      //   onClick={login}
    >
      Get Started
    </Button>
  );
};

const Header = () => {
  const useAuthStrategy = getAuthServiceStrategy();
  const { isAuthenticated, login, logout } = useAuthStrategy();
  return (
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
        {/* <Button size="small">Documentation</Button> */}
        {/* <IconButton color="inherit">
          <GitHubIcon />
        </IconButton> */}
        <ThemeToggleButton />
        <Button
          size="small"
          disabled
          //   onClick={
          //     isAuthenticated
          //       ? () => logout({ returnTo: window.location.origin })
          //       : login
          //   }
        >
          {isAuthenticated ? "Logout" : "Login"}
        </Button>
        <ActionButton size={"small"} />
      </Stack>
    </Box>
  );
};

const MainContent = () => {
  const { mode } = useContext(ThemeContext);
  const [imageLoaded, setImageLoaded] = useState(false);
  const matches = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        flex: 1,
        my: { xs: "72px", sm: "64px" },
        overflow: "auto",
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid container item xs={12} spacing={4} direction="row">
          <Grid item lg={4} md={12} xs={12}>
            <Stack
              direction="column"
              spacing={4}
              sx={{ textAlign: { xs: "center", md: "center", lg: "left" } }}
            >
              <Typography variant="h3" gutterBottom>
                Unlock the Full Potential of Your NLP Data!
              </Typography>
              <Typography fontSize={16} gutterBottom color="text.secondary">
                Are dirty texts jamming your NLP pipelines? Concerned about
                sensitive information lurking in your data? Say no more!
                LexiClean is here to support your lexical normalisation and
                entity tagging projects, offering a powerful solution to refine
                and secure your data effortlessly.
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={2}
              >
                <ActionButton />
                {/* <Button
                  variant="outlined"
                  as={Link}
                  //   to={`${process.env.REACT_APP_DOCS_URL}`}
                  disabled
                  sx={{ textDecoration: "none" }}
                >
                  Find Out More
                </Button> */}
              </Box>
            </Stack>
          </Grid>
          <Grid item lg={8} md={12} xs={12}>
            <Paper sx={{ borderRadius: 2 }} elevation={4}>
              {!matches && (
                <>
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
                      display: imageLoaded ? "block" : "none",
                      maxWidth: "100%",
                      borderRadius: "inherit",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                    src={`${process.env.PUBLIC_URL}/static/annotation_interface_${mode}.png`}
                    alt="Annotation Interface"
                    onLoad={() => setImageLoaded(true)}
                  />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
        <Grid
          item
          container
          md={12}
          xs={12}
          mt={4}
          spacing={4}
          sx={{ display: "flex", alignItems: "stretch" }}
        >
          <Features />
        </Grid>
      </Grid>
    </Box>
  );
};

const Features = () => {
  return features.map((feature, index) => (
    <Grid
      item
      xs={12}
      lg={3}
      md={6}
      key={`feature-${index}`}
      sx={{ display: "flex" }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          borderRadius: 2,
          textAlign: "center",
        }}
        variant="outlined"
      >
        <Typography variant="h6" component="h3" gutterBottom>
          {feature.title}
        </Typography>
        <Typography variant="body2">{feature.content}</Typography>
      </Paper>
    </Grid>
  ));
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
