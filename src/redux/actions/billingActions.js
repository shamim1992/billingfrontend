// redux/actions/billingActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchBills = createAsyncThunk('billing/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await axios.get('/api/bills');
    return response.data.bills;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const fetchBillById = createAsyncThunk('billing/fetchById', async (id, thunkAPI) => {
  try {
    const response = await axios.get(`/api/bills/${id}`);
    return response.data.bill;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const updateBillStatus = createAsyncThunk('billing/updateStatus', async ({ id, paymentStatus }, thunkAPI) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    const response = await axios.put(`/api/bills/${id}/status`, { paymentStatus }, config);
    return response.data.bill;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});
