import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Auth0Provider
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: `https://${process.env.REACT_APP_AUTH0_AUDIENCE}`,
    }}
    cacheLocation={"localstorage"}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
    domain={`https://${process.env.REACT_APP_AUTH0_DOMAIN}`}
    useRefreshTokens={true}
    useRefreshTokensFallback={true}
  >
    <App />
  </Auth0Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
