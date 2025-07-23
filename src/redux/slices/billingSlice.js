// redux/slices/billingSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { 
  createBilling, 
  fetchBillings, 
  fetchBillingById, 
  fetchBillingByBillNumber,
  updateBilling,
  addPayment,
  cancelBill,
  getDueAmountReport,
  migrateBillNumbers,
  fetchAllReceipts,
  fetchReceiptsByBillNumber,
  fetchReceiptByNumber,
  getReceiptStats
} from '../actions/billingActions';

const billingSlice = createSlice({
  name: 'billing',
  initialState: {
    // Bills
    billings: [],
    billing: null,
    billByNumber: null,
    
    // Receipts
    receipts: [],
    receiptsByBill: [],
    currentReceipt: null,
    receiptStats: null,
    
    // Reports
    dueAmountReport: null,
    
    // UI State
    loading: false,
    receiptsLoading: false,
    error: null,
    receiptsError: null,
    
    // Migration
    migrationStatus: null,
  },
  reducers: {
    resetBillingState: (state) => {
      state.billing = null;
      state.billByNumber = null;
      state.error = null;
    },
    resetReceiptsState: (state) => {
      state.receipts = [];
      state.receiptsByBill = [];
      state.currentReceipt = null;
      state.receiptsError = null;
    },
    clearDueReport: (state) => {
      state.dueAmountReport = null;
    },
    clearMigrationStatus: (state) => {
      state.migrationStatus = null;
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
        state.billings.unshift(action.payload.billing); // Add to beginning for newest first
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

      // Handle fetchBillingByBillNumber
      .addCase(fetchBillingByBillNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingByBillNumber.fulfilled, (state, action) => {
        state.loading = false;
        state.billByNumber = action.payload;
      })
      .addCase(fetchBillingByBillNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateBilling
      .addCase(updateBilling.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBilling.fulfilled, (state, action) => {
        state.loading = false;
        // Update both the billing list and current billing detail
        state.billings = state.billings.map((bill) =>
          bill._id === action.payload.billing._id ? action.payload.billing : bill
        );
        // Update current billing if it matches
        if (state.billing?._id === action.payload.billing._id) {
          state.billing = action.payload.billing;
        }
      })
      .addCase(updateBilling.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle addPayment
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Update billing in list
        state.billings = state.billings.map((bill) =>
          bill._id === action.payload.billing._id ? action.payload.billing : bill
        );
        // Update current billing if it matches
        if (state.billing?._id === action.payload.billing._id) {
          state.billing = action.payload.billing;
        }
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle cancelBill
      .addCase(cancelBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBill.fulfilled, (state, action) => {
        state.loading = false;
        // Update billing in list
        state.billings = state.billings.map((bill) =>
          bill._id === action.payload.billing._id ? action.payload.billing : bill
        );
        // Update current billing if it matches
        if (state.billing?._id === action.payload.billing._id) {
          state.billing = action.payload.billing;
        }
      })
      .addCase(cancelBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle getDueAmountReport
      .addCase(getDueAmountReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDueAmountReport.fulfilled, (state, action) => {
        state.loading = false;
        state.dueAmountReport = action.payload;
      })
      .addCase(getDueAmountReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle migrateBillNumbers
      .addCase(migrateBillNumbers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(migrateBillNumbers.fulfilled, (state, action) => {
        state.loading = false;
        state.migrationStatus = action.payload;
      })
      .addCase(migrateBillNumbers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchAllReceipts
      .addCase(fetchAllReceipts.pending, (state) => {
        state.receiptsLoading = true;
        state.receiptsError = null;
      })
      .addCase(fetchAllReceipts.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        state.receipts = action.payload.receipts || action.payload;
      })
      .addCase(fetchAllReceipts.rejected, (state, action) => {
        state.receiptsLoading = false;
        state.receiptsError = action.payload;
      })

      // Handle fetchReceiptsByBillNumber
      .addCase(fetchReceiptsByBillNumber.pending, (state) => {
        state.receiptsLoading = true;
        state.receiptsError = null;
      })
      .addCase(fetchReceiptsByBillNumber.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        state.receiptsByBill = action.payload;
      })
      .addCase(fetchReceiptsByBillNumber.rejected, (state, action) => {
        state.receiptsLoading = false;
        state.receiptsError = action.payload;
      })

      // Handle fetchReceiptByNumber
      .addCase(fetchReceiptByNumber.pending, (state) => {
        state.receiptsLoading = true;
        state.receiptsError = null;
      })
      .addCase(fetchReceiptByNumber.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        state.currentReceipt = action.payload;
      })
      .addCase(fetchReceiptByNumber.rejected, (state, action) => {
        state.receiptsLoading = false;
        state.receiptsError = action.payload;
      })

      // Handle getReceiptStats
      .addCase(getReceiptStats.pending, (state) => {
        state.receiptsLoading = true;
        state.receiptsError = null;
      })
      .addCase(getReceiptStats.fulfilled, (state, action) => {
        state.receiptsLoading = false;
        state.receiptStats = action.payload;
      })
      .addCase(getReceiptStats.rejected, (state, action) => {
        state.receiptsLoading = false;
        state.receiptsError = action.payload;
      });
  }
});

export const { 
  resetBillingState, 
  resetReceiptsState, 
  clearDueReport, 
  clearMigrationStatus 
} = billingSlice.actions;

export default billingSlice.reducer;