import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const auth = true;
  return auth ? children : <Navigate to="/" />;
};

export default PrivateRoute;

// import { Redirect, Route, Navigate, Outlet } from "react-router-dom";
// import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
// import { CircularProgress } from "@mui/material";

// const ProtectedRoute = ({ component, ...args }) => {
//   // Using isAuthenticated here rediects users to unauthorized page if they refresh the page...
//   const { isAuthenticated } = useAuth0();
//   // if (isAuthenticated) {
//   return (
//     <Route
//       component={withAuthenticationRequired(component, {
//         onRedirecting: () => (
//           <div>
//             <CircularProgress />
//           </div>
//         ),
//       })}
//       {...args}
//     />
//   );
//   // } else {
//   //   return <Redirect to="/unauthorized" />;
//   // }
// };

// export default ProtectedRoute;
