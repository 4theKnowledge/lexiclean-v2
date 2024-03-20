import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { getAuthServiceStrategy } from "../auth/AuthServiceConfig";

const useApi = () => {
  const useAuthStrategy = getAuthServiceStrategy();
  const { getAccessTokenSilently } = useAuthStrategy();
  const navigate = useNavigate();

  const callApi = async (url, options = {}) => {
    try {
      const token = await getAccessTokenSilently();
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      // Merge the additional Axios options passed to the callApi function
      const response = await axiosInstance({
        ...options,
        url,
        headers,
      });

      // You can also handle response status directly here if you want
      return response.data;
    } catch (error) {
      console.error(`Error making API call: ${error}`);
      // Unauthorized.
      if (error.response && error.response.status === 401) {
        // Redirect to /unauthorized
        navigate("/unauthorized");
      }
      throw error; // Rethrow to handle it specifically in the calling context or for global error handling
    }
  };

  return callApi;
};

export default useApi;
