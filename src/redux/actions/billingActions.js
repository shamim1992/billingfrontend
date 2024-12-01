// redux/actions/billingActions.js
import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseURL } from '@/ApiUrl';


// Create a new billing record
export const createBilling = createAsyncThunk(
  'billing/createBilling',
  async (billingData, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {

      const response = await axios.post(`${baseURL}/api/bills`, billingData, config);;
      console.log(billingData)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch all billing records
export const fetchBillings = createAsyncThunk(
  'billing/fetchBillings',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(`${baseURL}/api/bills`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch a single billing record by ID
export const fetchBillingById = createAsyncThunk(
  'billing/fetchBillingById',
  async (id, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.get(`${baseURL}/api/bills/${id}`, config);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update a billing record by ID
export const updateBilling = createAsyncThunk(
  'billing/updateBilling',
  async ({ id, data }, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const response = await axios.put(`${baseURL}/api/bills/${id}`, data, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred while updating the bill');
    }
  }
);

