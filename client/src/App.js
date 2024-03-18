import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Landing from "./features/Landing";
import Projects from "./features/Projects";
import Create from "./features/Create";
import Project from "./features/Project";
import Layout from "./shared/components/Layout";
import Dashboard from "./features/Dashboard";
import CustomSnackbar from "./shared/components/CustomSnackbar";
import SnackbarProvider from "./shared/context/SnackbarContext";
import { ThemeProvider } from "./shared/context/ThemeContext";
import { AppProvider } from "./shared/context/AppContext";
import ErrorPage from "./shared/components/ErrorPage";
import { ModalProvider } from "./shared/context/ModalContext";
import Account from "./features/Account";
import AuthPage from "./shared/components/auth/AuthPage";
import { ProjectProvider } from "./shared/context/ProjectContext";
import ErrorBoundary from "./shared/components/ErrorBoundary";

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <SnackbarProvider>
          <ModalProvider>
            <AppProvider>
              <ProjectProvider>
                <CustomSnackbar />
                <BrowserRouter>
                  <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route index element={<Landing />} />
                    <Route path="/project/:projectId" element={<Project />} />
                    <Route path="/" element={<Layout />}>
                      <Route path="/projects" element={<Projects />} />
                      <Route
                        exact
                        path="/project/create"
                        element={<Create />}
                      />
                      <Route
                        path="/dashboard/:projectId"
                        element={<Dashboard />}
                      />
                      <Route path="/account" element={<Account />} />
                    </Route>
                    {/* Catch-all route for undefined paths */}
                    <Route path="/unauthorized" element={<ErrorPage />} />
                    <Route path="*" element={<ErrorPage />} />
                  </Routes>
                </BrowserRouter>
              </ProjectProvider>
            </AppProvider>
          </ModalProvider>
        </SnackbarProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
