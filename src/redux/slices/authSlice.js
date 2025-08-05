// redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { login, forgotPassword, resetPassword, verifyResetToken } from '../actions/authActions';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  // Forgot password states
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,
  forgotPasswordError: null,
  // Reset password states
  resetPasswordLoading: false,
  resetPasswordSuccess: false,
  resetPasswordError: null,
  // Token verification states
  tokenVerificationLoading: false,
  tokenValid: false,
  tokenVerificationError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setAuthFromStorage: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    clearForgotPasswordState: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = false;
      state.forgotPasswordError = null;
    },
    clearResetPasswordState: (state) => {
      state.resetPasswordLoading = false;
      state.resetPasswordSuccess = false;
      state.resetPasswordError = null;
    },
    clearTokenVerificationState: (state) => {
      state.tokenVerificationLoading = false;
      state.tokenValid = false;
      state.tokenVerificationError = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload;
        state.forgotPasswordSuccess = false;
      })
      
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload;
        state.resetPasswordSuccess = false;
      })
      
      // Verify reset token cases
      .addCase(verifyResetToken.pending, (state) => {
        state.tokenVerificationLoading = true;
        state.tokenVerificationError = null;
        state.tokenValid = false;
      })
      .addCase(verifyResetToken.fulfilled, (state, action) => {
        state.tokenVerificationLoading = false;
        state.tokenValid = action.payload.valid;
        state.tokenVerificationError = null;
      })
      .addCase(verifyResetToken.rejected, (state, action) => {
        state.tokenVerificationLoading = false;
        state.tokenValid = false;
        state.tokenVerificationError = action.payload;
      });
  },
});

export const { 
  logout, 
  setAuthFromStorage, 
  clearForgotPasswordState, 
  clearResetPasswordState, 
  clearTokenVerificationState,
  clearAuthError 
} = authSlice.actions;

export default authSlice.reducer;