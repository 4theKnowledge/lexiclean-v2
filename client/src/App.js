import React from "react";
import { Helmet } from "react-helmet";
import { ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { appTheme } from "./theme";
// import { AuthProvider } from "./features/auth/authcontext";
// import { ProtectedRoute } from "./features/auth/protectedroute";
// import { Unauthorized } from "./features/auth/unauthorized";
import Landing from "./features/landing/Landing";
import Projects from "./features/projects/Projects";
import CreateProject from "./features/projectcreation/CreateProject";
import Project from "./features/project/Project";
import history from "./features/utils/history";
import Layout from "./shared/components/Layout";
// import Annotation from "./features/Annotation";
import Dev from "./features/dev/Dev";

function App() {
  // return (
  //   <Router history={history}>
  //     <AuthProvider>
  //       <Switch>
  //         <ProtectedRoute path="/project/:projectId/page=:pageNumber">
  //           <Helmet>
  //             <title>Annotation | LexiClean</title>
  //           </Helmet>
  //           <Project />
  //           <Footer />
  //           <PortalModal />
  //         </ProtectedRoute>

  //         <ProtectedRoute path="/project/new">
  //           <Helmet>
  //             <title>New Project | LexiClean</title>
  //           </Helmet>
  //           <Create />
  //           <Footer />
  //         </ProtectedRoute>

  //         <ProtectedRoute path="/feed">
  //           <Helmet>
  //             <title>Project Feed | LexiClean</title>
  //           </Helmet>
  //           <Feed />
  //           <Footer />
  //           <PortalModal />
  //         </ProtectedRoute>

  //         <Route exact path="/unauthorized" component={Unauthorized} />

  //         <Route exact path="/login">
  //           <Helmet>
  //             <title>Login | LexiClean</title>
  //           </Helmet>
  //           <Login />
  //         </Route>
  //         <Route exact path="/signup">
  //           <Helmet>
  //             <title>Signup | LexiClean</title>
  //           </Helmet>
  //           <SignUp />
  //         </Route>
  //         <Route path="/">
  //           <Helmet>
  //             <title>LexiClean | Multi-task Lexnorm Annotation</title>
  //           </Helmet>
  //           <Landing />
  //         </Route>
  //       </Switch>
  //     </AuthProvider>
  //   </Router>
  // );

  return (
    <ThemeProvider theme={appTheme}>
      <BrowserRouter>
        <Routes>
          <Route index element={<Landing />} />
          <Route
            path="/project/:projectId/page=:pageNumber"
            element={<Project />}
          />
          {/* <Route path="/dev" element={<Dev />} /> */}
          <Route path="/" element={<Layout />}>
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/new/:step" element={<CreateProject />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
