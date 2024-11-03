// redux/actions/billingActions.js
import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseURL } from '@/ApiUrl';

// Create a new billing record
export const createBilling = createAsyncThunk(
  'billing/createBilling',
  async (billingData, { rejectWithValue }) => {    
    try {
      const response = await axios.post(`${baseURL}/api/bills`, billingData);
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
    try {
      const response = await axios.get(`${baseURL}/api/bills`);
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
    try {
      const response = await axios.get(`${baseURL}/api/billing/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
