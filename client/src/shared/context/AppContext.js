// This context will manage the user, their preferences, notifications, etc.

import React, { createContext, useContext, useEffect, useReducer } from "react";
import axiosInstance from "../api/axiosInstance";

// Initial state
const initialState = {
  user: null, // User account information
  notifications: [], // User notifications
  preferences: {}, // User preferences
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

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await axiosInstance.get("/api/user/system");
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
  }, []); // Empty dependency array ensures this runs once on mount

  // Value to be passed to the provider
  const value = { state, dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use the context
export function useAppContext() {
  return useContext(AppContext);
}
