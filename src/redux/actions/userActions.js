// redux/actions/userActions.js
import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const createUser = createAsyncThunk('users/create', async (userData, thunkAPI) => {
  const token = localStorage.getItem('token'); 
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  };
  try {
    const response = await axios.post(`${baseURL}/api/auth/register`, userData, config);
    console.log(response)
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to create user');
  }
});


// export const createUser = createAsyncThunk('users/create', async (userData, thunkAPI) => {
//   const token = localStorage.getItem('token');
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   };

//   try {
//     const response = await axios.post(`${baseURL}/api/users`, userData, config);
//     return response.data; // Return the created user data
//   } catch (error) {
//     return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to create user');
//   }
// });



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