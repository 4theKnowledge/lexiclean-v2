import { Box, Divider, Paper, Typography } from "@mui/material";

const StyledCard = ({ title, children }) => {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <Box>
        {title && (
          <>
            <Typography variant="h6" sx={{ p: 2, color: "text.secondary" }}>
              {title}
            </Typography>
            <Divider flexItem />
          </>
        )}
        <Box p={2}>{children}</Box>
      </Box>
      <Box sx={{ backgroundColor: "background.accent", height: 32 }} />
    </Paper>
  );
};

export default StyledCard;
