// testUtils.js
import * as AuthServiceConfig from "./shared/auth/AuthServiceConfig";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Create a basic default theme
export const mockTheme = createTheme({
  palette: {
    background: {
      light: "#ffffff", // Just a dummy value to fill in required theme structure
    },
  },
});

// Function to wrap components with a theme provider during tests
export const withThemeProvider = (children) => (
  <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

export const setupAuthMock = (isAuthenticated = false) => {
  AuthServiceConfig.getAuthServiceStrategy.mockImplementation(() => () => ({
    isAuthenticated,
    login: jest.fn(),
    logout: jest.fn(),
  }));
};
