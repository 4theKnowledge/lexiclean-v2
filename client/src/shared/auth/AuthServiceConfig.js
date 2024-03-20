import { useAuth0Service } from "./Auth0Service";
import { useDummyAuthService } from "./DummyAuthService";

export const getAuthServiceStrategy = () => {
  switch (process.env.REACT_APP_AUTH_STRATEGY) {
    case "AUTH0":
      // console.log("Using auth0 auth service strategy");
      return useAuth0Service;
    case "DUMMY":
      // console.log("Using dummy auth service strategy");
      return useDummyAuthService;
    default:
      // console.log("Using default auth service strategy");
      return useDummyAuthService;
  }
};
