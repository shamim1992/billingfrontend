
import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';



export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    console.log(credentials)
    const response = await axios.post(`${baseURL}/api/auth/login`, credentials);

    localStorage.setItem('token', response.data.token);   
    return response.data; 
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${baseURL}/api/auth/profile`, config);
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});


