import { useEffect, useState } from "react";

export const useDummyAuthService = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(() => {
    // Try to get user details from local storage at initial load
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = () => {
    // Redirect to login page.
    window.location.href = "/login";
  };

  const logout = () => {
    // console.log("Logging out with dummy auth");
    setUser(null); // Clear the user on logout
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  // Effect to store user details in local storage or remove them
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("user");
      setIsAuthenticated(false);
    }
  }, [user]);

  const getAccessTokenSilently = async ({ authorizationParams } = {}) => {
    if (user) {
      return user.username;
    }
    return null;
  };

  const authorizationParams = {};

  return {
    login,
    logout,
    isAuthenticated,
    user,
    getAccessTokenSilently,
    authorizationParams,
    setUser,
  };
};
