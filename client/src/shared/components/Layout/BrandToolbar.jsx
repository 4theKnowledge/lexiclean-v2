import { Chip, Stack, Tooltip, Typography } from "@mui/material";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import { useNavigate } from "react-router-dom";

const BrandToolbar = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} ml={1}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ cursor: "pointer" }}
        onClick={handleClick}
      >
        <BubbleChartIcon sx={{ color: "primary.main" }} />
        <Typography
          fontWeight={500}
          fontSize={20}
          sx={{ color: "primary.main" }}
        >
          LexiClean
        </Typography>
      </Stack>
      {process.env.REACT_APP_AUTH_STRATEGY.toLowerCase() === "dummy" && (
        <Tooltip
          title="You are running LexiClean in local mode"
          arrow
          placement="bottom"
        >
          <Chip
            label="Local"
            size="small"
            sx={{ fontSize: 10, pointer: "none", cursor: "help" }}
          />
        </Tooltip>
      )}
    </Stack>
  );
};

export default BrandToolbar;
