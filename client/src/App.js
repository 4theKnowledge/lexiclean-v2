import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
// import { AuthProvider } from "./features/auth/authcontext";
// import { ProtectedRoute } from "./features/auth/protectedroute";
// import { Unauthorized } from "./features/auth/unauthorized";
import Landing from "./features/landing/Landing";
import Projects from "./features/projects/Projects";
import CreateProject from "./features/projectcreation/CreateProject";
import Project from "./features/project/Project";
import Layout from "./shared/components/Layout";
import Dashboard from "./features/Dashboard";
// import Annotation from "./features/Annotation";
// import Dev from "./features/dev/Dev";
// import { Multiuser } from "./features/dev/Multiuser";
// import ListEditor from "./features/dev/ListEditor";
// import Grammarly from "./features/dev/Grammarly";

import CustomSnackbar from "./shared/components/CustomSnackbar";
import SnackbarProvider from "./shared/context/SnackbarContext";
import { ThemeProvider } from "./shared/context/ThemeContext";
import { AppProvider } from "./shared/context/AppContext";
import ErrorPage from "./shared/components/ErrorPage";
import { ModalProvider } from "./shared/context/ModalContext";
import Account from "./features/Account";

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
    <ThemeProvider>
      <SnackbarProvider>
        <ModalProvider>
          <AppProvider>
            <CustomSnackbar />
            <BrowserRouter>
              <Routes>
                <Route index element={<Landing />} />
                {/* <Route path="/dev/multiuser" element={<Multiuser />} /> */}
                {/* <Route path="/dev/listeditor" element={<ListEditor />} /> */}
                {/* <Route path="/dev/grammarly" element={<Grammarly />} /> */}
                <Route path="/project/:projectId" element={<Project />} />
                {/* <Route path="/dev" element={<Dev />} /> */}
                <Route path="/" element={<Layout />}>
                  <Route path="/projects" element={<Projects />} />
                  <Route
                    exact
                    path="/project/create"
                    element={<CreateProject />}
                  />
                  <Route path="/dashboard/:projectId" element={<Dashboard />} />
                  <Route path="/account" element={<Account />} />
                </Route>
                {/* Catch-all route for undefined paths */}
                {/* <Route path="*" element={<ErrorPage />} /> */}
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </ModalProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
