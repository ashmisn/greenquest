import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greenquest_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  login: async (username: string, password: string, role: 'user' | 'admin') => {
    const response = await api.post('/login', { username, password, role });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  }
};

export default api;