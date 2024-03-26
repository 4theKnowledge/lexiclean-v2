import { Box, Link, Paper, Stack, Typography } from "@mui/material";
import BrandToolbar from "./Layout/BrandToolbar";

const ErrorPage = () => {
  return (
    <Box
      id="error-page"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.light",
      }}
    >
      <Box
        as={Paper}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        p={2}
      >
        <BrandToolbar />
        <Stack direction="column" alignItems="center" spacing={2} py={2}>
          <Typography variant="h3">Oops!</Typography>
          <Typography variant="body2">
            Sorry, an unexpected error has occurred.
          </Typography>
        </Stack>
        <Link href="/" alt="home">
          Return home
        </Link>
      </Box>
    </Box>
  );
};

export default ErrorPage;
