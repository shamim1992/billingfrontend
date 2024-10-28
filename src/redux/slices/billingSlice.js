// redux/slices/billingSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchBills, fetchBillById, updateBillStatus } from '../actions/billingActions';

const initialState = {
  bills: [],
  bill: null,
  loading: false,
  error: null,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all bills
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch bill by ID
      .addCase(fetchBillById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.loading = false;
        state.bill = action.payload;
      })
      .addCase(fetchBillById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update bill status
      .addCase(updateBillStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBillStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bill = action.payload;
        // Update the status of the bill in the bills array
        const index = state.bills.findIndex((bill) => bill._id === action.payload._id);
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })
      .addCase(updateBillStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default billingSlice.reducer;
