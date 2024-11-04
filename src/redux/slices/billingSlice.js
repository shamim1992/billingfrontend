// redux/slices/billingSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { createBilling, fetchBillings, fetchBillingById, updateBilling } from '../actions/billingActions';

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    billings: [],
    billing: null,
    loading: false,
    error: null
  },
  reducers: {
    resetBillingState: (state) => {
      state.billing = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle createBilling
      .addCase(createBilling.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBilling.fulfilled, (state, action) => {
        state.loading = false;
        state.billings.push(action.payload.billing);
      })
      .addCase(createBilling.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchBillings
      .addCase(fetchBillings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillings.fulfilled, (state, action) => {
        state.loading = false;
        state.billings = action.payload;
      })
      .addCase(fetchBillings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchBillingById
      .addCase(fetchBillingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingById.fulfilled, (state, action) => {
        state.loading = false;
        state.billing = action.payload;
      })
      .addCase(fetchBillingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update a bill
      .addCase(updateBilling.fulfilled, (state, action) => {
        state.loading = false;
        // Update both the billing list and current billing detail
        state.billings = state.billings.map((bill) =>
          bill._id === action.payload._id ? action.payload : bill
        );
        // Update current billing if it matches
        if (state.billing?._id === action.payload._id) {
          state.billing = action.payload;
        }
      })


  }
});

export const { resetBillingState } = billingSlice.actions;
export default billingSlice.reducer;
