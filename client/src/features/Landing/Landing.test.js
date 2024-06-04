// Landing.test.js
import { render, screen } from "@testing-library/react";
import Landing, {
  Features,
  featureContent,
  Footer,
  Header,
  ActionButton,
  MainContent,
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
    render(withThemeProvider(<Features features={featureContent} />));
    featureContent.forEach((feature, index) => {
      const featureElement = screen.getByTestId(`main-feature-${index}`);
      expect(featureElement).toBeInTheDocument();
      const featureElementTitle = screen.getByTestId(
        `main-feature-${index}-title`
      );
      const featureElementContent = screen.getByTestId(
        `main-feature-${index}-content`
      );
      expect(featureElementTitle).toBeInTheDocument();
      expect(featureElementContent).toBeInTheDocument();
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
    setupAuthMock(true);

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

describe("MainContent", () => {
  beforeEach(() => {
    setupAuthMock();
  });

  test("renders main content without crashing and verifies key elements", () => {
    render(<BrowserRouter>{withThemeProvider(<MainContent />)}</BrowserRouter>);

    // Check the main content container
    expect(screen.getByTestId("main-content")).toBeInTheDocument();

    // Verify structural and key elements within MainContent
    expect(screen.getByTestId("main-grid")).toBeInTheDocument();
    expect(screen.getByTestId("content-row")).toBeInTheDocument();
    expect(screen.getByTestId("left-column")).toBeInTheDocument();
    expect(screen.getByTestId("right-column")).toBeInTheDocument();
    expect(screen.getByTestId("text-stack")).toBeInTheDocument();
    expect(screen.getByTestId("main-heading")).toBeInTheDocument();
    expect(screen.getByTestId("main-subtext")).toBeInTheDocument();
    expect(screen.getByTestId("action-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("find-out-more-button")).toBeInTheDocument();
    expect(screen.getByTestId("image-paper")).toBeInTheDocument();

    // Optional: Check if the image is initially hidden until loaded
    expect(screen.getByTestId("image-skeleton")).toBeInTheDocument();
    // To verify the image display post-loading, you might simulate the load event or directly set the state if accessible

    // Check if the Features component renders correctly
    expect(screen.getByTestId("features-grid")).toBeInTheDocument();
  });
});

describe("Footer", () => {
  test("renders footer", () => {
    render(withThemeProvider(<Footer />));
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
  test("renders privacy policy link", () => {
    render(withThemeProvider(<Footer />));
    expect(screen.getByTestId("footer-privacy-policy")).toBeInTheDocument();
  });
  test("renders terms and conditions link", () => {
    render(withThemeProvider(<Footer />));
    expect(
      screen.getByTestId("footer-terms-and-conditions")
    ).toBeInTheDocument();
  });
  test("renders github link", () => {
    render(withThemeProvider(<Footer />));
    expect(screen.getByTestId("footer-github-link")).toBeInTheDocument();
  });
});
