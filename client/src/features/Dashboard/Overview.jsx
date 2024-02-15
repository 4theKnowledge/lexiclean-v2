/**
 The dashboard will summarise the progress made on the project. It will
 also allow the user to update and add their meta tags. Downloads will be
 available here also. It will also allow the user to customise the color
 theme of replaced tokens (rp), unassigned tokens (ua), suggested tokens
 (st) and IV english tokens (en).
 */
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { pink, teal, indigo, amber } from "@mui/material/colors";
import { alpha } from "@mui/material";

const COLOR_LEVEL = 50;
const METRIC_COLOR = indigo[COLOR_LEVEL];

const Overview = ({ loading, data }) => {
  const metrics = [
    {
      name: "Documents saved",
      value: 0, //data.savedCount / data.textCount,
      color: pink[COLOR_LEVEL],
    },
    {
      name: "Vocabulary reduction",
      value: 0,
      color: teal[COLOR_LEVEL],
    },
    {
      name: "Vocabulary corrections",
      value: 0,
      color: indigo[COLOR_LEVEL],
    },
    {
      name: "Project type",
      value: "Hello world",
      color: amber[COLOR_LEVEL],
    },
  ];

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-evenly"
        width={"100%"}
        p={2}
      >
        {metrics.map((m) => (
          <MetricContainer
            name={m.name}
            value={m.value}
            title={m.title}
            color={m.color}
          />
        ))}
      </Box>
      {/* <div>
         startingVocabSize: {!loading && data.metrics.startingVocabSize}
         <br />
         startingOOVTokenCount: {!loading && data.metrics.startingOOVTokenCount}
       </div> */}
      <Box component={Paper} variant="outlined" p={4} width={"100%"}>
        <BarChart />
      </Box>
    </Box>
  );
};

const MetricContainer = ({ name, value, title, color }) => {
  return (
    <Box
      component={Paper}
      variant="outlined"
      p={4}
      sx={{ textAlign: "left", bgcolor: alpha(color, 0.325) }}
    >
      <Stack direction="column" spacing={2}>
        <Typography fontSize={14}>{name}</Typography>
        <Typography fontWeight={700} fontSize={20}>
          {value}
        </Typography>
      </Stack>
    </Box>
  );
};

const BarChart = () => {
  return <p>Chart goes here</p>;
};

export default Overview;
