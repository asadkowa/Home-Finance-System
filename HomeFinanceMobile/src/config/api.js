import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration for different environments
// - Use localhost for iOS simulator
// - Use 10.0.2.2 for Android emulator
// - Use your computer's IP for physical devices
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.10:5000/api'  // Replace with your local IP for physical device
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
