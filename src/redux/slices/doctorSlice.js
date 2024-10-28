// src/redux/slices/doctorSlice.js
import { createSlice } from '@reduxjs/toolkit';
import  {fetchDoctorsByDepartment, fetchDoctorById, fetchDoctor} from '../actions/doctorActions';

const initialState = {
  doctors: [],  // Make sure this is initialized as an empty array
  doctor: null,
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearDoctor(state) {
      state.doctor = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch doctors by department
    builder
      .addCase(fetchDoctorsByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorsByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctorsByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch doctors';
      });

    // Fetch a specific doctor by ID
    builder
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.doctor = action.payload;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch doctor';
      });


      builder
      .addCase(fetchDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch doctor';
      });
  },
});



export default doctorSlice.reducer;
