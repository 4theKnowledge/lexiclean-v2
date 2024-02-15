import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import {
  downloadProjectData,
  deleteProjectById,
  fetchProjectSummaryById,
} from "../../shared/api/dashboard";
import { downloadFile } from "../../shared/utils/dashboard";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import { getReadableString } from "../../shared/utils/dashboard";
import Schema from "./Schema";
import StyledCard from "./StyledCard";

const Dashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const { dispatch: snackbarDispatch } = useSnackbar();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectData = await fetchProjectSummaryById(projectId);
        setData(projectData);
      } catch (error) {
        setError(error);
        snackbarDispatch({
          type: "SHOW",
          message: `Unable to fetch project dashboard information `,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]); // Dependency array to refetch when projectId changes

  const downloadProject = async () => {
    try {
      const response = await downloadProjectData(projectId);
      if (response.status === 200) {
        downloadFile({ data: response.data, fileName: `${data.name}.json` });
      } else {
        throw Error;
      }
    } catch (error) {
      snackbarDispatch({
        type: "SHOW",
        message: `Failed to download project: ${error}`,
        severity: "error",
      });
    }
  };

  const deleteProject = async () => {
    try {
      const response = await deleteProjectById(projectId);
      if (response.status === 200) {
        navigate("/home");
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" width="100%" mt={16}>
        <CircularProgress />
      </Box>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Grid container spacing={2} mt={8}>
      <Grid item xs={12}>
        <StyledCard>
          <Grid container spacing={2} justifyContent="center">
            {data.metrics.map((m, index) => (
              <Grid
                item
                key={index}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={2}
                sx={{
                  minWidth: 80,
                }}
              >
                <Box
                  bgcolor="background.darker"
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    minHeight: 120,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    border: "1px solid",
                    borderColor: "borders.primary",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontSize: 14 }}>
                    {m.name}
                  </Typography>
                  <Typography variant="h6" sx={{ fontSize: 20, mt: 1 }}>
                    {m.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </StyledCard>
      </Grid>
      <Grid item xs={12} container spacing={2}>
        <Grid item xs={6}>
          <StyledCard title="Details">
            <Box display="flex" as={Paper} elevation={0} flexDirection="column">
              <Stack direction="column" spacing={2}>
                {data &&
                  ["name", "createdAt", "description", "parallelCorpus"].map(
                    (i, index) => (
                      <Box key={index} display="flex" alignItems="center">
                        <Typography sx={{ mr: 1, fontWeight: "bold" }}>
                          {getReadableString(i)}:
                        </Typography>
                        <Typography>
                          {i === "createdAt"
                            ? moment.utc(data.details[i]).format("Do MMM YY")
                            : data.details[i].toString()}
                        </Typography>
                      </Box>
                    )
                  )}
                <Box>
                  <Typography sx={{ mr: 1, fontWeight: "bold" }}>
                    Special Tokens
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" spacing={1}>
                    {data &&
                      data.details.specialTokens.map((t, index) => (
                        <Chip key={index} label={t} size="small" />
                      ))}
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Preprocessing
                  </Typography>
                  {data &&
                    Object.entries(data.details.preprocessing).map(
                      ([k, v], index) => (
                        <Box display="flex" key={index} alignItems="center">
                          <Typography sx={{ mr: 1, fontWeight: "bold" }}>
                            {getReadableString(k)}:
                          </Typography>
                          <Typography>{v.toString()}</Typography>
                        </Box>
                      )
                    )}
                </Box>
              </Stack>
            </Box>
          </StyledCard>
        </Grid>
        <Grid item xs={6}>
          <StyledCard title={"Settings"}>
            <Box display="flex" flexDirection="column">
              <Box display="flex" justifyContent="space-between" mb={4}>
                <Typography>Annotate Project</Typography>
                <Button
                  component={Link}
                  to={`/project/${projectId}/page=1`}
                  variant="outlined"
                  size="small"
                >
                  Annotate
                </Button>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={4}>
                <Typography>Download Dataset</Typography>
                <Button
                  variant="outlined"
                  onClick={downloadProject}
                  disabled={loading}
                  size="small"
                >
                  Download
                </Button>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Delete Project</Typography>
                <TextField
                  placeholder="Enter Project Name"
                  onChange={(e) => setDeleteName(e.target.value)}
                  value={deleteName}
                  size="small"
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={deleteProject}
                  disabled={loading || data.name !== deleteName}
                  color="error"
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </StyledCard>

          <StyledCard>
            <Schema loading={loading} data={data} />
          </StyledCard>
        </Grid>
      </Grid>
      <Grid item xs={6}></Grid>
      {/* <Grid item xs={12} mt={2}>
        <Box
          display="flex"
          as={Paper}
          p={4}
          elevation={0}
          sx={{ bgcolor: "background.light" }}
        >
          <Typography>Annotation chart goes here</Typography>
        </Box>
      </Grid> */}
    </Grid>
  );
};

export default Dashboard;
