import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '@/ApiUrl'; // Adjust the base URL as necessary

// Fetch all departments action
// export const fetchDepartments = createAsyncThunk(
//   'departments/fetchAll',
//   async (_, thunkAPI) => {
//     try {
//       const token = localStorage.getItem('token');
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   };
//       const response = await axios.get(`${baseURL}/api/department`, config);
      
//       return response.data; // Return the departments data
//     } catch (error) {
//       return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
//     }
//   }
// ); 


// Fetch all departments action
export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${baseURL}/api/department`, config);
      console.log('Departments API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Department fetch error:', error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

// Other department actions remain the same...


export const fetchDepartmentById = createAsyncThunk(
  'departments/fetchById',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
      const response = await axios.get(`${baseURL}/api/department/${id}`, config);
      return response.data; // Return the department data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Create a new department action
export const createDepartment = createAsyncThunk(
  'departments/create',
  async (newDepartment, thunkAPI) => {
    try {
      const response = await axios.post(`${baseURL}/api/department`, newDepartment, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token if needed
        },
      });
      return response.data.department; // Return the newly created department data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create department');
    }
  }
);

// update
export const updateDepartment = createAsyncThunk(
  'departments/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axios.put(`${baseURL}/api/departments/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.department; // Return the updated department
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Delete department action
export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${baseURL}/api/departments/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return id; // Return the deleted department's ID
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);