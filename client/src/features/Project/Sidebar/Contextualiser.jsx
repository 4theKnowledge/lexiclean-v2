import { useContext, useEffect, useState } from "react";
import { Typography, Stack, Chip, Box, Paper, Divider } from "@mui/material";
import { ProjectContext } from "../../../shared/context/ProjectContext";
import useMiscActions from "../../../shared/hooks/api/misc";
import { useParams } from "react-router-dom";

const Contextualiser = () => {
  const [state, dispatch] = useContext(ProjectContext);
  const [data, setData] = useState();
  const { getTokenContext } = useMiscActions();
  const { projectId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTokenContext({
        projectId,
        tokenValue: state.selectedToken.value,
      });

      setData(data);
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
        <Box p="0.5rem 0rem">
          <Typography variant="caption" fontWeight="bold">
            Details
          </Typography>
          {state.selectedToken ? (
            <Stack direction="column" spacing={1}>
              <Typography variant="caption">
                Current value: {state.selectedToken.currentValue}
              </Typography>
              {state.selectedToken.currentValue !==
                state.selectedToken.value && (
                <Typography variant="caption">
                  Original value: {state.selectedToken.value}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2">Nothing Selected</Typography>
          )}
          {state.selectedToken && data && (
            <>
              <Typography variant="caption" fontWeight="bold">
                Actions performed on similar tokens
              </Typography>
              <Stack direction="column" spacing={1} pt={1}>
                {data.length === 0 ? (
                  <Typography variant="caption">Nothing found</Typography>
                ) : (
                  data.map((d) => (
                    <>
                      <Typography
                        variant="caption"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {d.type}s {d.isSuggestion && "(suggested)"}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          flexWrap: "wrap",
                          gap: 0.5,
                          justifyContent: "flex-start",
                        }}
                      >
                        {Object.entries(d.matches).map(([name, count]) => (
                          <Chip
                            color="primary"
                            label={`${
                              d.type === "tag"
                                ? state.project.schemaMap[name].name
                                : name
                            }: ${count}`}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </>
                  ))
                )}
              </Stack>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default Contextualiser;
