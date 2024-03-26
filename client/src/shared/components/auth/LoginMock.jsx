import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  CssBaseline,
  Paper,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BrandToolbar from "../Layout/BrandToolbar";
import axiosInstance from "../../api/axiosInstance";
import { getAuthServiceStrategy } from "../../auth/AuthServiceConfig";

const LoginMock = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const useAuthStrategy = getAuthServiceStrategy();
  const { setUser } = useAuthStrategy();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Start loading
    setLoginError(""); // Reset login error
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    // Simple validation example
    if (username.length < 3) {
      setError(true);
      setLoading(false);
    } else {
      setError(false);
      try {
        const response = await axiosInstance({
          method: "GET",
          url: "/api/user",
          headers: { authorization: `Bearer ${username}` },
        });
        if (response.data) {
          setUser(response.data);
          window.location.href = "/";
        }
      } catch (error) {
        console.log(`error: ${error}`);
        setLoginError("Failed to login. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container component="main">
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: (theme) => theme.spacing(2),
            borderRadius: "10px",
          }}
        >
          <BrandToolbar />
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h6" gutterBottom>
            Login
          </Typography>
          <Box width="100%" maxWidth={300} sx={{ textAlign: "center" }} py={1}>
            <Typography variant="caption">
              <strong>Local Mode Enabled:</strong> New accounts are created on
              first login using your chosen username, which then allows
              password-free access within this app.
            </Typography>
          </Box>
          <Box
            component="form"
            noValidate
            sx={{ mt: 1, width: "100%", maxWidth: "300px" }}
            onSubmit={handleSubmit}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="off"
              autoFocus
              error={error}
              helperText={error ? "Username must be at least 3 characters" : ""}
            />
            {loginError && <Typography color="error">{loginError}</Typography>}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginMock;
