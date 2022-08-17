import React from "react";

import {
  Grid,
  Box,
  AppBar,
  Typography,
  Toolbar,
  Stack,
  IconButton,
} from "@mui/material";

import { Link, Outlet } from "react-router-dom";
import { appTheme } from "../../theme";
import { useDispatch, useSelector } from "react-redux";

const Layout = () => {
  return (
    <Grid container direction="column" justifyContent="center">
      <Grid item sx={{ flexGrow: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="primary"
          sx={{ minHeight: "64px" }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: appTheme.palette.font.light,
                }}
              >
                LexiClean
              </Link>
            </Typography>
            <Box
              sx={{
                flexGrow: 1,
                justifyContent: "left",
                margin: "0rem 2rem",
              }}
            >
              <Link
                style={{
                  color: appTheme.palette.font.light,
                  textDecoration: "none",
                  margin: "0rem 1rem",
                }}
                to="/project/new"
              >
                {" "}
                New Project
              </Link>
              <Link
                style={{
                  color: appTheme.palette.font.light,
                  textDecoration: "none",
                  margin: "0rem 1rem",
                }}
                to="/projects"
              >
                All Projects
              </Link>
              <Link
                style={{
                  color: appTheme.palette.font.light,
                  textDecoration: "none",
                  margin: "0rem 1rem",
                }}
                to="/"
              >
                Logout
              </Link>
            </Box>
          </Toolbar>
        </AppBar>
      </Grid>
      <Grid
        item
        container
        justifyContent="center"
        sx={{
          height: "calc(100vh - 64px)",
          backgroundColor: "bg.main",
        }}
      >
        <Grid
          container
          item
          sx={{
            overflowY: "auto",
            backgroundColor: "bg.light",
            height: "calc(100vh - 64px)",
          }}
          justifyContent="center"
          pt={4}
        >
          <Outlet />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Layout;
