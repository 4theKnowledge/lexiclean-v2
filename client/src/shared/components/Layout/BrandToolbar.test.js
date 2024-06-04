import BrandToolbar from "./BrandToolbar";
import { render, screen } from "@testing-library/react";
import { withThemeProvider, setupNavigateMock } from "../../../testUtils";
import { BrowserRouter } from "react-router-dom";

describe("BrandToolbar", () => {
  beforeEach(() => {
    setupNavigateMock();
  });
  test("renders BrandToolbar without crashing", () => {
    render(
      <BrowserRouter>
        withThemeProvider(
        <BrandToolbar />)
      </BrowserRouter>
    );
    expect(screen.getByTestId("brand-toolbar")).toBeInTheDocument();
  });

  test("renders 'LexiClean' text", () => {
    render(
      <BrowserRouter>
        withThemeProvider(
        <BrandToolbar />)
      </BrowserRouter>
    );
    expect(screen.getByText("LexiClean")).toBeInTheDocument();
  });

  test("renders local mode chip when in local mode", () => {
    process.env.REACT_APP_AUTH_STRATEGY = "dummy";
    render(
      <BrowserRouter>
        withThemeProvider(
        <BrandToolbar />)
      </BrowserRouter>
    );
    expect(screen.getByText("Local")).toBeInTheDocument();
  });

  test("renders no chip when not in local mode", () => {
    process.env.REACT_APP_AUTH_STRATEGY = "auth0";
    render(
      <BrowserRouter>
        withThemeProvider(
        <BrandToolbar />)
      </BrowserRouter>
    );
    expect(screen.queryByText("Local")).toBeNull();
  });
});
