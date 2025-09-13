import axios from 'axios';

//const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Use a more specific key for your token to avoid conflicts
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
  },
  assignPoints: async (phone: string, wasteType: string, weight: number) => {
    const response = await api.post('/assign-points', { phone, wasteType, weight });
    return response.data;
  }
};

// V V V V V  ADD THE NEW CODE BLOCK BELOW  V V V V V

export const pickupAPI = {
  // --- User-facing functions ---

  /**
   * Schedules a new pickup for the logged-in user.
   * @param pickupData - The details of the pickup (wasteTypes, quantity, etc.).
   */
  schedulePickup: async (pickupData: any) => {
    // Corresponds to: POST /api/pickups
    const response = await api.post('/pickups', pickupData);
    return response.data;
  },

  /**
   * Gets the pickup history for the logged-in user.
   */
  getUserPickups: async () => {
    // Corresponds to: GET /api/pickups/my-pickups
    const response = await api.get('/pickups/my-pickups');
    return response.data;
  },

  // --- Admin-facing functions ---

  /**
   * Gets all pickup requests from all users. (Admin only)
   */
  getAllPickups: async () => {
    // Corresponds to: GET /api/pickups/all
    const response = await api.get('/pickups/all');
    return response.data;
  },

  /**
   * Updates the status of a specific pickup. (Admin only)
   * @param pickupId - The ID of the pickup to update.
   * @param newStatus - The new status (e.g., 'Confirmed', 'Completed').
   */
  updatePickupStatus: async (pickupId: string, newStatus: string) => {
    // Corresponds to: PUT /api/pickups/:id
    const response = await api.put(`/pickups/${pickupId}`, { status: newStatus });
    return response.data;
  }
};
