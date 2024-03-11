import { useState } from "react";
import { Box, Tab, TextField, Button, Paper } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";

const AuthPage = () => {
  const [value, setValue] = useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.light",
      }}
    >
      <Box
        sx={{
          width: 360,
          typography: "body1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList onChange={handleChange} aria-label="login signup tabs">
                <Tab label="Login" value="1" />
                <Tab label="Signup" value="2" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <LoginForm />
            </TabPanel>
            <TabPanel value="2">
              <SignupForm />
            </TabPanel>
          </TabContext>
        </Paper>
      </Box>
    </Box>
  );
};

const LoginForm = () => {
  return (
    <form>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Sign In
      </Button>
    </form>
  );
};

const SignupForm = () => {
  return (
    <form>
      <TextField
        margin="normal"
        required
        fullWidth
        id="firstName"
        label="First Name"
        name="firstName"
        autoComplete="fname"
        autoFocus
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="lastName"
        label="Last Name"
        name="lastName"
        autoComplete="lname"
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
        Sign Up
      </Button>
    </form>
  );
};

export default AuthPage;
