import { useContext, useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Stack,
  Chip,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import axiosInstance from "../../../shared/api/axiosInstance";
import { ProjectContext } from "../../../shared/context/project-context";

const Contextualiser = () => {
  const [state, dispatch] = useContext(ProjectContext);
  const [data, setData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance.post("/api/token/search", {
        projectId: state.projectId,
        value: state.selectedToken.value,
      });

      setData(response.data);
    };

    if (state.selectedToken && state.selectedToken.value) {
      fetchData();
    }
  }, [state.selectedToken]);

  return (
    <Paper sx={{ backgroundColor: "background.default" }} elevation={0}>
      <Box
        display="flex"
        p={2}
        flexDirection="column"
        sx={{ whiteSpace: "normal", overflowWrap: "break-word" }}
      >
        <Typography fontWeight="bold" color="text.secondary" gutterBottom>
          Contextualiser
        </Typography>
        <Divider />
        <Box p={1}>
          {state.selectedToken ? (
            <Stack>
              <Typography fontSize={12}>
                Current Value: {state.selectedToken.currentValue}
              </Typography>
              {state.selectedToken.currentValue !==
                state.selectedToken.value && (
                <Typography fontSize={12}>
                  Original Value: {state.selectedToken.value}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2">Nothing Selected</Typography>
          )}
          {state.selectedToken && data && (
            <>
              <Typography variant="caption">
                Replacements made on similar tokens:
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                pt={1}
                sx={{
                  flexWrap: "wrap",
                  gap: 0.5,
                  justifyContent: "flex-start",
                }}
              >
                {Object.keys(data.replacements).length === 0 ? (
                  <Chip label={"Nothing found"} size="small" />
                ) : (
                  Object.keys(data.replacements).map((value) => (
                    <Chip
                      color="primary"
                      key={`replacement-${value}-${data.replacements[value]}`}
                      label={`${value}: ${data.replacements[value]}`}
                      size="small"
                    />
                  ))
                )}
              </Stack>
              {/* <Typography variant="caption">Similar Terms</Typography>
            <Stack direction="row" spacing={2} p={1}>
              {data.similar.map((item) => (
                <Chip key={`similar-${item}`} label={item} size="small" />
              ))}
            </Stack> */}
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default Contextualiser;
