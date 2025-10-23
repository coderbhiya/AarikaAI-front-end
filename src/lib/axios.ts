import axios from "axios";

// Create an instance of axios with default config
const axiosInstance = axios.create({
  baseURL: "https://api.brainai.in",
  // baseURL: "http://localhost:3000",
  timeout: 1200000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding token, etc
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authentication token here if needed
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // You can handle global error responses here
    // For example, handle 401 unauthorized errors
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("authToken");
      // Redirect to login page or dispatch logout action
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

