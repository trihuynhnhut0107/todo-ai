const BASE_URL = "https://your-api-domain.com/api";

import axios from "axios";

const api = axios.create({
  baseURL: BASE_URL, // replace with your actual base URL
  timeout: 10000,
});

// Optional: Add interceptors
api.interceptors.request.use(
  (config) => {
    // Add auth token or headers
    // const token = 'yourAuthToken';
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
