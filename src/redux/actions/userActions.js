// redux/actions/userActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosSetup';

export const createUser = createAsyncThunk('users/create', async (userData, thunkAPI) => {
  try {
    const response = await axiosInstance.post('/api/auth/register', userData);
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create user');
  }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, data }, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`/api/users/${id}`, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update user');
  }
});

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/api/users');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const deleteUser = createAsyncThunk('users/delete', async (userId, thunkAPI) => {
  try {
    const response = await axiosInstance.delete(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const fetchUserDetails = createAsyncThunk('users/fetchUserById', async (id, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/api/users/${id}`);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
  }
});

// // redux/actions/userActions.js
// import { baseURL } from '@/ApiUrl';
// import { createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';


// export const createUser = createAsyncThunk('users/create', async (userData, thunkAPI) => {
//   const token = localStorage.getItem('token'); 
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`, 
//     },
//   };
//   try {
//     const response = await axios.post(`${baseURL}/api/auth/register`, userData, config);
//     console.log(response)
//     return response.data.user;
//   } catch (error) {
//     return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to create user');
//   }
// });


// export const updateUser = createAsyncThunk(
//   'users/update',
//   async ({ id, data }, thunkAPI) => {
//     const token = localStorage.getItem('token');
//     const config = {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     };
    
// console.log("Before update:",data)
//     try {
//       const response = await axios.put(`${baseURL}/api/users/${id}`, data, config);
//       console.log("After update:", response.data);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to update user');
//     }
//   }
// );


// export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
//   const token = localStorage.getItem('token'); 
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`, 
//     },
//   };
//   try {
//     const response = await axios.get(`${baseURL}/api/users`, config);
//     return response.data;
//   } catch (error) {
//     return thunkAPI.rejectWithValue(error.response.data.message);
//   }
// });



// // Delete a user (Super Admin)
// export const deleteUser = createAsyncThunk('users/delete', async (userId, thunkAPI) => {
//   const token = localStorage.getItem('token');
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };

//   try {
//     const response = await axios.delete(`${baseURL}/users/${userId}`, config);
//     return response.data;
//   } catch (error) {
//     return thunkAPI.rejectWithValue(error.response.data.message);
//   }
// });


// export const fetchUserDetails = createAsyncThunk('users/fetchUserById', async (id, thunkAPI) => {
//   const token = localStorage.getItem('token');
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`, // Attach the token
//     },
//   };
//   try {
//     const response = await axios.get(`${baseURL}/api/users/${id}`, config);
//     return response.data;
//   } catch (error) {
//     return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to fetch user');
//   }
// });