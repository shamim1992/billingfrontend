import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
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

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, thunkAPI) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }
    
    const response = await axiosInstance.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response?.data || error.message);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, newPassword }, thunkAPI) => {
  try {
    if (!token || !newPassword) {
      throw new Error('Token and new password are required');
    }
    
    const response = await axiosInstance.post('/api/auth/reset-password', { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error.message);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to reset password');
  }
});

export const verifyResetToken = createAsyncThunk('auth/verifyResetToken', async (token, thunkAPI) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }
    
    const response = await axiosInstance.get(`/api/auth/verify-reset-token/${token}`);
    return response.data;
  } catch (error) {
    console.error('Verify token error:', error.response?.data || error.message);
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Invalid or expired token');
  }
});