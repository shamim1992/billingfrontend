// redux/actions/reportActions.js
import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all reports
export const fetchReports = createAsyncThunk('reports/fetchAll', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(`${baseURL}/api/reports`, config);
    return response.data.reports;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Generate a report
export const generateReport = createAsyncThunk('reports/generate', async (reportData, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(`${baseURL}/api/reports`, reportData, config);
    return response.data.report;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});
