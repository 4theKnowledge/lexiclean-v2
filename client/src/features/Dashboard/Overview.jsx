import { Box, Grid, Typography } from "@mui/material";
import StyledCard from "./StyledCard";

const Overview = ({ loading, data }) => {
  return (
    <StyledCard title="Overview">
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
  );
};

export default Overview;
