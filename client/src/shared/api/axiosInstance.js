import axios from "axios";

// Use environment variable or fallback to a default value
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const axiosInstance = axios.create({
  baseURL: baseURL,
});

export default axiosInstance;
