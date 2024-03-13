import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
// import { ProtectedRoute } from "./features/auth/protectedroute";
// import { Unauthorized } from "./features/auth/unauthorized";
import Landing from "./features/landing/Landing";
import Projects from "./features/projects/Projects";
import CreateProject from "./features/projectcreation/CreateProject";
import Project from "./features/project/Project";
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
import { ErrorBoundaryProvider } from "./shared/context/ErrorBoundaryContext";

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <ModalProvider>
          <AppProvider>
            <ProjectProvider>
              <CustomSnackbar />
              <BrowserRouter>
                <ErrorBoundaryProvider>
                  <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route index element={<Landing />} />
                    <Route path="/project/:projectId" element={<Project />} />
                    <Route path="/" element={<Layout />}>
                      <Route path="/projects" element={<Projects />} />
                      <Route
                        exact
                        path="/project/create"
                        element={<CreateProject />}
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
                </ErrorBoundaryProvider>
              </BrowserRouter>
            </ProjectProvider>
          </AppProvider>
        </ModalProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
