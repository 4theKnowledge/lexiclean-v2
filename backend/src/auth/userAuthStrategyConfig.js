// userAuthStrategyConfig.js
import { Auth0UserAuth } from "./Auth0UserAuth.js";
import { DummyUserAuth } from "./DummyUserAuth.js";

export const getAuthStrategy = () => {
  switch (process.env.AUTH_STRATEGY) {
    case "AUTH0":
      // console.log("Using Auth0 strategy");
      return new Auth0UserAuth();
    case "DUMMY":
      // console.log("Using Dummy strategy");
      return new DummyUserAuth();
    default:
      // console.log("Using Default strategy");
      return new DummyUserAuth();
  }
};
