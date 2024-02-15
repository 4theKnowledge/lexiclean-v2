import { useEffect, useState, useContext } from "react";
import { LinearProgress, Box, Tooltip } from "@mui/material";
import { ProjectContext } from "../../shared/context/project-context";

const LinearProgressWithLabel = () => {
  const [{ progress }, dispatch] = useContext(ProjectContext);
  const [progressState, setProgressState] = useState({ value: 0, text: "" });

  useEffect(() => {
    if (progress) {
      const { value, title } = progress;
      setProgressState({
        value: value,
        text: title,
      });
    }
  }, [progress]);

  return (
    <Tooltip
      title={`Current annotation progress: ${progressState.text}`}
      placement="top"
    >
      <Box sx={{ width: "100%", cursor: "help" }}>
        <LinearProgress
          variant="determinate"
          value={progressState.value}
          sx={{ height: "6px" }}
        />
      </Box>
    </Tooltip>
  );
};

export default LinearProgressWithLabel;
