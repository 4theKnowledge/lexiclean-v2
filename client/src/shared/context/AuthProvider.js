import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

/**
 * Provides authentication services for the application. Dynamically selects
 * between Auth0 and a dummy authentication system based on environment configuration.
 *
 * @param {ReactNode} children The child components to render within the provider.
 * @returns {ReactNode} The children wrapped with the appropriate authentication context.
 */
const AuthProvider = ({ children }) => {
  // Determine the authentication strategy from the environment variable.
  switch (process.env.REACT_APP_AUTH_STRATEGY) {
    case "AUTH0":
      return (
        <Auth0Provider
          authorizationParams={{
            redirect_uri: window.location.origin,
            audience: `https://${process.env.REACT_APP_AUTH0_AUDIENCE}`,
          }}
          cacheLocation="localstorage"
          clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
          domain={`https://${process.env.REACT_APP_AUTH0_DOMAIN}`}
          useRefreshTokens={true}
          useRefreshTokensFallback={true}
        >
          {children}
        </Auth0Provider>
      );
    case "DUMMY":
    default:
      // For the dummy auth system, directly return children as no additional context/provider is required.
      // Implement a context provider here if you need to share auth state across your application.
      return <>{children}</>;
  }
};

export default AuthProvider;
