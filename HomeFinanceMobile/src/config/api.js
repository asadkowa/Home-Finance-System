import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use localhost for Android emulator, 10.0.2.2 for Android physical device
const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api'
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigate to login will be handled by the component
    }
    return Promise.reject(error);
  }
);

export default api;
