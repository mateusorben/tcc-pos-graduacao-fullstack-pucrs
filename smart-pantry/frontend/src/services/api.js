import axios from 'axios';

const api = axios.create({
  // Dinamicamente usa o hostname atual (localhost ou IP da rede)
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;