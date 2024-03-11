// This context will manage the user, their preferences, notifications, etc.
import React, { createContext, useContext, useEffect, useReducer } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth0 } from "@auth0/auth0-react";

// Initial state
const initialState = {
  user: null, // User account information
  notifications: [], // User notifications
  preferences: {}, // User preferences
  token: null,
};

// Create context
const AppContext = createContext();

// Define a reducer
function appReducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "LOGOUT_USER":
      return { ...initialState };
    case "SET_TOKEN":
      return { ...state, token: action.payload };
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload };
    case "SET_PREFERENCES":
      return { ...state, preferences: action.payload };
    default:
      return state;
  }
}

// Context provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    isAuthenticated,
    user: auth0User,
    getAccessTokenSilently,
  } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && auth0User) {
      // Fetch additional user data based on Auth0 user information
      async function fetchUserData() {
        try {
          const auth0Token = await getAccessTokenSilently({
            authorizationParams: {
              audience: `https://${process.env.REACT_APP_AUTH0_AUDIENCE}`,
            },
          });
          dispatch({ type: "SET_TOKEN", payload: auth0Token });

          const response = await axiosInstance.get("/api/user/", {
            headers: {
              Authorization: `Bearer ${auth0Token}`,
            },
          });

          if (response.status !== 200) {
            throw new Error("Failed to fetch user data");
          }
          const userData = await response.data;
          dispatch({ type: "SET_USER", payload: userData });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      fetchUserData();
    } else {
      // Handle logout
      dispatch({ type: "LOGOUT_USER" });
    }
  }, [isAuthenticated, auth0User]); // Depend on Auth0's authentication state.

  // Value to be passed to the provider
  const value = { state, dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useAppContext() {
  return useContext(AppContext);
}
