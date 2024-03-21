import { Stack, Typography } from "@mui/material";
import BubbleChartIcon from "@mui/icons-material/BubbleChart";
import { useNavigate } from "react-router-dom";

const BrandToolbar = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/"); // Navigate to the landing page
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      ml={1}
      onClick={handleClick}
      sx={{ cursor: "pointer" }}
    >
      <BubbleChartIcon sx={{ color: "primary.main" }} />
      <Typography fontWeight={500} fontSize={20} sx={{ color: "primary.main" }}>
        LexiClean
      </Typography>
    </Stack>
  );
};

export default BrandToolbar;
