import React, { useContext } from "react";
import "../common/Footer.css";
import history from "../utils/history";
import { Grid, Button, Stack } from "@mui/material";
import StartIcon from "@mui/icons-material/Start";

import { selectIsAuthenticated } from "../auth/userSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  return (
    <Grid container>
      <Grid item>
        <Grid item id="row-signup">
          <Stack>
            <Button
              variant="contained"
              onClick={
                isAuthenticated
                  ? () => navigate("/feed")
                  : () => navigate("/signup")
              }
            >
              {isAuthenticated ? (
                <>
                  Enter <StartIcon />
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
            {!isAuthenticated && (
              <p
                style={{
                  textAlign: "right",
                  marginRight: "0.5rem",
                }}
                onClick={() => navigate("/login")}
              >
                or <strong style={{ cursor: "pointer" }}>login</strong>
              </p>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Landing;
