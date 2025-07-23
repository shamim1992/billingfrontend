// utils/axiosSetup.js
import axios from 'axios';
import { baseURL } from '@/ApiUrl';
import  store  from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const axiosInstance = axios.create({
  baseURL: baseURL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.message === 'Invalid token, access denied') {
      // Clear all auth related data
      store.dispatch(logout());
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;