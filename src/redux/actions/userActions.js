// redux/actions/userActions.js
import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;






export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
  const token = localStorage.getItem('token'); 
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  };
  try {
    const response = await axios.get(`${baseURL}/api/users`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});



// Delete a user (Super Admin)
export const deleteUser = createAsyncThunk('users/delete', async (userId, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.delete(`${baseURL}/users/${userId}`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});


export const fetchUserDetails = createAsyncThunk('users/fetchUserById', async (id, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Attach the token
    },
  };
  try {
    const response = await axios.get(`${baseURL}/api/users/${id}`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to fetch user');
  }
});