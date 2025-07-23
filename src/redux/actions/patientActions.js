import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const fetchPatients = createAsyncThunk('patients/fetchAll', async (_, thunkAPI) => {
  const token = localStorage.getItem('token'); 
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }; 
  try {
    const response = await axios.get(`${baseURL}/api/patients`, config); 
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

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


export const updatePatient = createAsyncThunk('patients/update', async ({ id, data }, thunkAPI) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      // Use the _id from the patient data if available
      const patientId = data._id || id;
      const response = await axios.put(`${baseURL}/api/patients/${patientId}`, data, config);
      return response.data.patient;
    } catch (error) {
      console.error('Update error:', error.response?.data || error); // Debug log
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update patient'
      );
    }
  }
);

// In patientActions.js - Enhanced version
export const searchPatients = createAsyncThunk('patients/search', async (query, thunkAPI) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    try {
      // Add validation
      if (!query || query.trim() === '') {
        return [];
      }
      
      const response = await axios.get(
        `${baseURL}/api/patients/search?query=${encodeURIComponent(query.trim())}`, 
        config
      );
      
      console.log("Received search response:", response.data);  
      return response.data;
    } catch (error) {
      console.error("Search request failed:", error.response?.data || error.message);
      
      // Better error handling
      const message = error.response?.data?.message || 
                     error.message || 
                     'Search failed';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);