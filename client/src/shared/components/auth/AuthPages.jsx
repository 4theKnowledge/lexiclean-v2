import React, { useEffect } from "react";
import UnauthorizedImage from "../../shared/media/unauthorized.jpeg";
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Stack,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";

const AuthPages = ({ page }) => {
  useEffect(() => {
    if (page === "error") {
      setTimeout(() => {
        // history.push("/projects");
      }, 1000);
    }
  }, [page]);

  const pageContent = {
    error: {
      image: UnauthorizedImage,
      content: <ErrorContent />,
      actions: null,
    },
    unauthorized: {
      image: UnauthorizedImage,
      content: <UnauthorizedContent />,
      actions: <ReturnAction />,
    },
    notExist: {
      image: UnauthorizedImage,
      content: <NotExistContent />,
      actions: <ReturnAction />,
    },
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ height: "100vh" }}
    >
      <Card sx={{ width: "25rem" }}>
        <CardMedia component="img" image={pageContent[page].image} />
        <CardContent>{pageContent[page].content}</CardContent>
        <CardActions>{pageContent[page].actions}</CardActions>
      </Card>
    </Grid>
  );
};

const ReturnAction = () => {
  return (
    <Button component={Link} to="/">
      Return to landing page
    </Button>
  );
};

const NotExistContent = () => {
  return (
    <Typography variant="paragraph" gutterBottom>
      Page does not exist
    </Typography>
  );
};

const ErrorContent = () => {
  useEffect(() => {
    setTimeout(() => {
      // history.push("/projects");
    }, 2000);
  }, []);

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Typography variant="button">Oops. Something went wrong</Typography>
      <Typography variant="paragraph">Redirecting to projects</Typography>
      <CircularProgress />
    </Stack>
  );
};

const UnauthorizedContent = () => {
  return (
    <Typography variant="paragraph" gutterBottom>
      Unable to Access Page (Unauthorised)
    </Typography>
  );
};

export default AuthPages;
