import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all patients with authorization header
export const fetchPatients = createAsyncThunk('patients/fetchAll', async (_, thunkAPI) => {
  const token = localStorage.getItem('token'); // Get the JWT token from localStorage
  const config = {
    headers: {
      Authorization: `Bearer ${token}`, // Set the Authorization header with the token
    },
  }; 

  try {
    const response = await axios.get(`${baseURL}/api/patients`, config); // Pass config with headers
  
    return response.data;

  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Create a new patient with authorization header
export const createPatient = createAsyncThunk('patients/create', async (newPatient, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
   
    const response = await axios.post(`${baseURL}/api/patients`, newPatient, config);

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Fetch a patient by ID with authorization header
export const fetchPatientById = createAsyncThunk('patients/fetchById', async (id, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${baseURL}/api/patients/${id}`, config);
    
    return response.data.patient;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to fetch patient');
  }
});

export const deletePatientbyId = createAsyncThunk('patients/deletePatient', async (id, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    await axios.delete(`${baseURL}/api/patients/${id}`, config);
    return { id };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message || 'Failed to delete patient');
  }
});

// Search patients by query
export const searchPatients = createAsyncThunk('patients/search', async (query, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    console.log("Sending search request:", query);  // Debugging log
    const response = await axios.get(`${baseURL}/api/patients/search?query=${query}`, config);
    console.log("Received search response:", response.data);  // Debugging log
    return response.data;
  } catch (error) {
    console.error("Search request failed:", error.response?.data || error.message);  // Debugging log
    return thunkAPI.rejectWithValue(error.response.data.message || 'Search failed');
  }
});