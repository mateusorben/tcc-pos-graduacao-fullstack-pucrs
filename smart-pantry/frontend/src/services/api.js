import axios from 'axios';

const api = axios.create({

  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Session expired or invalid cookie
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;