// src/redux/appointmentSlice.js

import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all appointments
export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${baseURL}/api/appointments`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Create a new appointment
export const createAppointment = createAsyncThunk('appointments/create', async (newAppointment, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.post(`${baseURL}/api/appointments`, newAppointment, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Update an existing appointment
export const updateAppointment = createAsyncThunk('appointments/update', async ({ id, updatedData }, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.put(`${baseURL}/api/appointments/${id}`, updatedData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Delete an appointment
export const deleteAppointment = createAsyncThunk('appointments/delete', async (id, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    await axios.delete(`${baseURL}/api/appointments/${id}`, config);
    return id; // Return the ID of the deleted appointment to remove it from state
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Update the status of an appointment
export const updateAppointmentStatus = createAsyncThunk('appointments/updateStatus', async ({ id, status }, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.patch(`${baseURL}/api/appointments/${id}/status`, { status }, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const fetchAppointmentById = createAsyncThunk('appointments/fetchById', async (id, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.get(`${baseURL}/api/appointments/${id}`, config);
    console.log(response.data)
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Fetch appointments by patient ID
export const fetchAppointmentsByPatientId = createAsyncThunk(
  'appointments/fetchByPatientId',
  async (patientId, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(`${baseURL}/api/appointments/patient/${patientId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
