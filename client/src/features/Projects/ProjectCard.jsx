import {
  Grid,
  Button,
  Typography,
  Stack,
  Box,
  Paper,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { truncateText } from "../../shared/utils/general";
import ArticleIcon from "@mui/icons-material/Article";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";

const ProjectCard = ({ index, project }) => {
  const projectProperties = [
    {
      value: project.textCount,
      title: "Total Texts",
      icon: <ArticleIcon fontSize="inherit" color="inherit" />,
    },
    {
      value: project.isParallelCorpusProject ? "Parallel" : "Standard",
      title: "Project Type",
      icon: <SettingsIcon fontSize="inherit" color="inherit" />,
    },
    {
      value: project.annotators,
      title: "Annotators",
      icon: <PeopleIcon fontSize="inherit" color="inherit" />,
    },
    {
      value: `${project.saveCount} / ${project.textCount} (${project.progress}%)`,
      title: "Texts Annotated (all annotators)",
      icon: <InsightsIcon fontSize="inherit" color="inherit" />,
    },
    {
      value: `${project.userSaveCount} / ${project.textCount} (${project.userProgress}%)`,
      title: "Texts Annotated (you)",
      icon: <InsightsIcon fontSize="inherit" color="inherit" />,
    },
  ];

  return (
    <Grid
      item
      xs={12}
      md={12}
      lg={6}
      xl={6}
      key={`project-grid-item-${project._id}`}
    >
      <Paper variant="outlined" key={index}>
        <Box p={2} display="flex" justifyContent="space-between">
          <Typography variant="h6" color="text.secondary">
            #{index + 1}
          </Typography>
          <Tooltip title={`Description: ${project.description}`}>
            <Typography variant="h6" gutterBottom sx={{ cursor: "help" }}>
              {truncateText(project.name, 50)}
            </Typography>
          </Tooltip>
        </Box>
        <Tooltip
          placement="top"
          title="This is the progress you have made."
          arrow
        >
          <LinearProgress
            sx={{ cursor: "help", height: 8 }}
            value={project.userProgress}
            variant="determinate"
          />
        </Tooltip>
        <Tooltip
          placement="bottom"
          arrow
          title="This is the overall project progress."
        >
          <LinearProgress
            sx={{ cursor: "help", height: 8 }}
            value={project.progress}
            variant="determinate"
          />
        </Tooltip>
        <Box display="flex" p={2} gap={4}>
          <Stack direction="column" spacing={2}>
            {projectProperties.slice(0, 3).map((p) => (
              <StyledProperty value={p.value} title={p.title} icon={p.icon} />
            ))}
          </Stack>
          <Stack direction="column" spacing={2}>
            {projectProperties.slice(3).map((p) => (
              <StyledProperty value={p.value} title={p.title} icon={p.icon} />
            ))}
          </Stack>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          p={1}
          sx={{ backgroundColor: "background.accent" }}
        >
          <Typography fontSize={12} color="text.secondary">
            Created: {new Date(project.createdAt).toDateString()}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              color="primary"
              variant="outlined"
              component={Link}
              to={`/dashboard/${project._id}`}
              size="small"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>
            <Button
              component={Link}
              color="primary"
              variant="contained"
              to={`/project/${project._id}`}
              startIcon={<ModeEditIcon />}
              disableElevation
              size="small"
            >
              Annotate
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Grid>
  );
};

const StyledProperty = ({ title, value, icon }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ color: "text.secondary" }}
    >
      {icon}
      <Typography fontSize={12}>{title}:</Typography>
      <Typography fontSize={12}>{value}</Typography>
    </Stack>
  );
};

export default ProjectCard;
