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

// Setup navigate mock before the jest.mock call
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // keep other exports of react-router-dom
  useNavigate: () => mockNavigate, // return the mock function directly
}));

export const setupNavigateMock = () => {
  mockNavigate.mockReset(); // reset any previous mock usage
  return mockNavigate; // return the mock for further assertions in tests
};
