import axios from 'axios';

const api = axios.create({
  // Dinamicamente usa o hostname atual (localhost ou IP da rede)
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`,
  withCredentials: true, // Send cookies automatically
});

api.interceptors.request.use((config) => {
  // No need to manually attach token, browser handles it via Cookies
  // code block removed
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
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