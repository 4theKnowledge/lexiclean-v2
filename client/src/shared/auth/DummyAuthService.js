export const useDummyAuthService = () => {
  const login = () => console.log("Logging in with dummy auth");
  const logout = () => console.log("Logging out with dummy auth");
  const isAuthenticated = true; // Or some logic to determine this
  const user = { name: "Default User", email: "default@user.com" };
  const getAccessTokenSilently = ({ authorizationParams }) => "tyler";
  const authorizationParams = {};

  return {
    login,
    logout,
    isAuthenticated,
    user,
    getAccessTokenSilently,
    authorizationParams,
  };
};
