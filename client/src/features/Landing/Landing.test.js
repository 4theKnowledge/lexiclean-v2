// Landing.test.js
import { render, screen } from "@testing-library/react";
import Landing, {
  Features,
  featureContent,
  Footer,
  Header,
  ActionButton,
} from "./Landing";
import { BrowserRouter } from "react-router-dom";
import { setupAuthMock, withThemeProvider } from "../../testUtils";

jest.mock("../../shared/auth/AuthServiceConfig");

describe("Landing", () => {
  beforeEach(() => {
    setupAuthMock();
  });
  test("renders Landing without crashing", () => {
    render(<BrowserRouter>{withThemeProvider(<Landing />)}</BrowserRouter>);
    expect(screen.getByTestId("landing")).toBeInTheDocument();
  });
});

describe("Features", () => {
  test("renders features", () => {
    render(<Features features={featureContent} />);
    featureContent.forEach((feature, index) => {
      const featureElement = screen.getByTestId(`main-feature-${index}`);
      expect(featureElement).toBeInTheDocument();
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.content)).toBeInTheDocument();
    });
  });
});

describe("ActionButton", () => {
  beforeEach(() => {
    setupAuthMock();
  });

  test('should display "Get Started" if the user is not authenticated', () => {
    render(
      <BrowserRouter>
        <ActionButton />
      </BrowserRouter>
    );
    expect(
      screen.getByTestId("action-button-unauthenticated")
    ).toBeInTheDocument();
  });

  test('should display "Enter" if the user is authenticated', () => {
    setupAuthMock(true); // set to authenticated

    render(
      <BrowserRouter>
        <ActionButton />
      </BrowserRouter>
    );
    expect(
      screen.getByTestId("action-button-authenticated")
    ).toBeInTheDocument();
  });
});

describe("Header", () => {
  beforeEach(() => {
    setupAuthMock();
  });

  test("renders header without crashing", () => {
    render(<BrowserRouter>{withThemeProvider(<Header />)}</BrowserRouter>);
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });
});

describe("Footer", () => {
  test("renders footer", () => {
    render(<Footer />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
