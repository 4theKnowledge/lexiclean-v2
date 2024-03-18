import React from "react";
import { Button, Typography, Paper, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container component="main" maxWidth="xs" sx={{ marginTop: "25vh" }}>
          <Box>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h4" gutterBottom>
                Oops! Something went wrong.
              </Typography>
              <Typography variant="body1" paragraph>
                We're sorry for the inconvenience. Please try navigating back or
                you can go to our pages:
              </Typography>
              <Box display="flex">
                <Button
                  size="small"
                  href="/"
                  variant="contained"
                  color="primary"
                  style={{ marginRight: "10px" }}
                  disableElevation
                >
                  Landing Page
                </Button>
                <Button size="small" href="/projects" variant="outlined">
                  Projects Page
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
