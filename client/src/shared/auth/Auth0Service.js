import { useAuth0 } from "@auth0/auth0-react";

export const useAuth0Service = () => {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  const authorizationParams = {
    audience: `https://${process.env.REACT_APP_AUTH0_AUDIENCE}`,
  };

  return {
    login: loginWithRedirect,
    logout: () => logout({ returnTo: window.location.origin }),
    isAuthenticated,
    user,
    getAccessTokenSilently,
    authorizationParams,
  };
};
