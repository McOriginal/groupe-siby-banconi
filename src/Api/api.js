// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-quincaillerie-groupe-siby.onrender.com/api',
  // 'http://localhost:5000/api',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter token JWT automatiquement
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('authUser');
  const token = user ? JSON.parse(user).token : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// deconnexion automatique si token expiré ou invalide
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
