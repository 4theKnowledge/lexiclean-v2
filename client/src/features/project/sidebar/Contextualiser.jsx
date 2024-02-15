import { useContext, useEffect, useState } from "react";
import { Typography, Grid, Stack, Chip, Box, Paper } from "@mui/material";
import axios from "axios";
import { ProjectContext } from "../../../shared/context/project-context";

const Contextualiser = () => {
  const [state, dispatch] = useContext(ProjectContext);
  const [data, setData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.post("/api/token/search", {
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
        {state.selectedToken ? (
          <Typography>Selected: {state.selectedToken.value}</Typography>
        ) : (
          <Typography>Nothing Selected</Typography>
        )}
        {state.selectedToken && data && (
          <>
            <Typography variant="caption">
              Replacements made on tokens of the same value:
            </Typography>
            <Stack direction="row" spacing={2} pt={1}>
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
    </Paper>
  );
};

export default Contextualiser;
