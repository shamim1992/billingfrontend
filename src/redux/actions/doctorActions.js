// src/redux/actions/doctorActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '@/ApiUrl'; // Update with the correct baseURL


// Action to fetch doctors by department
export const fetchDoctorsByDepartment = createAsyncThunk(
  'doctors/fetchByDepartment',
  async (departmentId, thunkAPI) => {

    const token = localStorage.getItem('token'); // Get the JWT token from localStorage
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Set the Authorization header with the token
      },
    };
    try {
      const response = await axios.get(`${baseURL}/api/users/doctors/department/${departmentId}`, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Error fetching doctors');
    }
  }
);

// Additional doctor-related actions (if required)
// Example: fetching a doctor by ID
export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchById',
  async (doctorId, thunkAPI) => {
    const token = localStorage.getItem('token'); // Get the JWT token from localStorage
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Set the Authorization header with the token
      },
    };
    try {
      const response = await axios.get(`${baseURL}/api/users/doctors/${doctorId}`, config);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Error fetching doctor');
    }
  }
);

export const fetchDoctor = createAsyncThunk(
  'doctors/fetchDoctor',
  async (_, thunkAPI) => {
    const token = localStorage.getItem('token'); // Get the JWT token from localStorage
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Set the Authorization header with the token
      },
    };
    try {
      const response = await axios.get(`${baseURL}/api/users/doctors`, config);
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message || 'Error fetching doctor');
    }
  }
);

