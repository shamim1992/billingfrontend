// redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { login } from '../actions/authActions';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
      
    },
    setAuthFromStorage: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user; // Store user info here
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

     
  },
});

export const { logout, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
