import React from "react";
import { Helmet } from "react-helmet";
import { ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { appTheme } from "./theme";
import { AuthProvider } from "./features/auth/authcontext";
import Login from "./features/auth/login";
import SignUp from "./features/auth/Signup";
// import { ProtectedRoute } from "./features/auth/protectedroute";
// import { Unauthorized } from "./features/auth/unauthorized";
// import { Footer } from "./features/common/footer";
// import NavBar from "./features/common/navbar";
import Projects from "./features/projects/Projects";
// import { PortalModal } from "./features/modals/modalportal";
import Create from "./features/project/create/Create";
import Project from "./features/project/Project";
import history from "./features/utils/history";

import Landing from "./features/landing/Landing";
import Layout from "./features/common/Layout";

import Annotation from "./features/Annotation";

function App() {
  // return (
  //   <Router history={history}>
  //     <AuthProvider>
  //       <Switch>
  //         <ProtectedRoute path="/project/:projectId/page/:pageNumber">
  //           <Helmet>
  //             <title>Annotation | LexiClean</title>
  //           </Helmet>
  //           <NavBar />
  //           <Project />
  //           <Footer />
  //           <PortalModal />
  //         </ProtectedRoute>

  //         <ProtectedRoute path="/project/new">
  //           <Helmet>
  //             <title>New Project | LexiClean</title>
  //           </Helmet>
  //           <NavBar />
  //           <Create />
  //           <Footer />
  //         </ProtectedRoute>

  //         <ProtectedRoute path="/feed">
  //           <Helmet>
  //             <title>Project Feed | LexiClean</title>
  //           </Helmet>
  //           <NavBar />
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
          <Route path="/" element={<Layout />}>
            {/* <Route index element={<Landing />} /> */}
            {/* <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} /> */}
            <Route index element={<Projects />} />
            {/* path="/projects" */}
            <Route
              path="/project/:projectId/page/:pageNumber"
              element={<Annotation />}
            />
            <Route path="/project/new" element={<Create />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

const LandingTest = () => {
  return <h1>hello</h1>;
};

export default App;
