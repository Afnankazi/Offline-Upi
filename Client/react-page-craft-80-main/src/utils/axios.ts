import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.mediastack.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Important: Set this to false for CORS
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add any request modifications here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors here
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 