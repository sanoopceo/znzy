import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Default dev URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Auth token
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle token expiration (e.g., 401 Unauthorized)
      if (error.response.status === 401) {
        // Optional: auto logout or refresh token
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
