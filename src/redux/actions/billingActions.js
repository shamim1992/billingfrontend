// redux/actions/billingActions.js
import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { baseURL } from '@/ApiUrl';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Create a new billing record
export const createBilling = createAsyncThunk(
  'billing/createBilling',
  async (billingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/bills`, billingData, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error creating bill');
    }
  }
);

// Fetch all billing records
export const fetchBillings = createAsyncThunk(
  'billing/fetchBillings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/bills`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching bills');
    }
  }
);

// Fetch a single billing record by ID
export const fetchBillingById = createAsyncThunk(
  'billing/fetchBillingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/bills/${id}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching bill');
    }
  }
);

// Fetch billing by bill number
export const fetchBillingByBillNumber = createAsyncThunk(
  'billing/fetchBillingByBillNumber',
  async (billNumber, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/bills/bill-number/${billNumber}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching bill by bill number');
    }
  }
);

// Update a billing record by ID
export const updateBilling = createAsyncThunk(
  'billing/updateBilling',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${baseURL}/api/bills/${id}`, data, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'An error occurred while updating the bill');
    }
  }
);

// Add payment to existing bill
export const addPayment = createAsyncThunk(
  'billing/addPayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/bills/${id}/payment`, paymentData, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error adding payment');
    }
  }
);

// Cancel bill
export const cancelBill = createAsyncThunk(
  'billing/cancelBill',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${baseURL}/api/bills/${id}/cancel`, { reason }, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error cancelling bill');
    }
  }
);

// Get due amount report
export const getDueAmountReport = createAsyncThunk(
  'billing/getDueAmountReport',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${baseURL}/api/bills/due-report?${queryParams}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching due amount report');
    }
  }
);

// Migrate bill numbers (Admin only)
export const migrateBillNumbers = createAsyncThunk(
  'billing/migrateBillNumbers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${baseURL}/api/bills/migrate-bill-numbers`, {}, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error migrating bill numbers');
    }
  }
);

// Receipt Actions
export const fetchAllReceipts = createAsyncThunk(
  'billing/fetchAllReceipts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${baseURL}/api/receipts?${queryParams}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching receipts');
    }
  }
);

export const fetchReceiptsByBillNumber = createAsyncThunk(
  'billing/fetchReceiptsByBillNumber',
  async (billNumber, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/receipts/bill/${billNumber}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching receipts for bill');
    }
  }
);

export const fetchReceiptByNumber = createAsyncThunk(
  'billing/fetchReceiptByNumber',
  async (receiptNumber, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${baseURL}/api/receipts/${receiptNumber}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching receipt');
    }
  }
);

export const getReceiptStats = createAsyncThunk(
  'billing/getReceiptStats',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`${baseURL}/api/receipts/stats?${queryParams}`, getAuthConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching receipt statistics');
    }
  }
);

// In billingActions.js - Add this optimized action

// Get complete bill details via receipt number (single API call)
export const fetchBillDetailsByReceiptNumber = createAsyncThunk(
  'billing/fetchBillDetailsByReceiptNumber',
  async (receiptNumber, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${baseURL}/api/receipts/bill-details/${receiptNumber}`, 
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error fetching bill details via receipt');
    }
  }
);