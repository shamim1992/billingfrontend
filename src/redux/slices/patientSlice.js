// redux/slices/patientSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchPatients, createPatient, fetchPatientById, deletePatientbyId, searchPatients } from '../actions/patientActions';

const initialState = {
  patients: [],
  patient: null,
  searchResults: [],
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create new patient 
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients.push(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


      builder
      .addCase(fetchPatientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientById.fulfilled, (state, action) => {
        state.loading = false;
        state.patient = action.payload;
      })
      .addCase(fetchPatientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch patient';
      })
      // Delete a patient
      builder
     .addCase(deletePatientbyId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
     .addCase(deletePatientbyId.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.patients.findIndex((patient) => patient._id === action.payload.id);
        if (index >= 0) {
          state.patients.splice(index, 1);
        }
      })
      .addCase(deletePatientbyId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete patient';
      })

      .addCase(searchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to search patients';
      });
  },
});

export default patientSlice.reducer;
