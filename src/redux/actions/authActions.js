
import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
//   try {
//     console.log(credentials)
//     const response = await axios.post(`${baseURL}/api/auth/login`, credentials);
//     localStorage.setItem('token', response.data.token);   
//     return response.data; 
//   } 
//   catch (error) 
//   {
//     localStorage.removeItem('token');
//     return thunkAPI.rejectWithValue(error.response.data.message);
//   }
// });

// authActions.js
import axiosInstance from '../../utils/axiosSetup';

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and Password are required');
    }
    
    const response = await axiosInstance.post('/api/auth/login', credentials);
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Invalid credentials provided');
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});


// export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
//   try {
//     const response = await axios.post(`${baseURL}/api/auth/login`, credentials);
    
//     // Log the response to verify the data structure
//     console.log('Login response:', response.data);
    
//     if (response.data.token) {
//       // Store token in localStorage
//       localStorage.setItem('token', response.data.token);
//       // Store user data if needed
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     }
    
//     return response.data;
//   } catch (error) {
//     console.error('Login error:', error.response?.data);
//     localStorage.removeItem('token'); // Clear any existing token
//     localStorage.removeItem('user');  // Clear any existing user data
//     return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed');
//   }
// });


// export const fetchProfile = createAsyncThunk('auth/profile', async (_, thunkAPI) => {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     return thunkAPI.rejectWithValue('No token provided');
//   }
//   try {
//     const response = await axios.get(`${baseURL}/api/auth/profile`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data.user;
//   } catch (error) {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     return thunkAPI.rejectWithValue(error.response.data.message);
//   }
// });



