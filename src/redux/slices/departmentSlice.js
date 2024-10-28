import { createSlice } from '@reduxjs/toolkit';
import { fetchDepartments, createDepartment, fetchDepartmentById, updateDepartment, deleteDepartment } from '../actions/departmentActions';

// Initial state
const initialState = {
  departments: [],
  department: null,
  loading: false,
  error: null,
  success: false,
};

// Department slice
const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create department
    builder
      .addCase(createDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.departments.push(action.payload); // Add the new department to the list
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

      builder
      .addCase(fetchDepartmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.department = action.payload;
      })
      .addCase(fetchDepartmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });


       // Update department
    builder
    .addCase(updateDepartment.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateDepartment.fulfilled, (state, action) => {
      state.loading = false;
      state.success = true;
      state.department = action.payload; // Update the current department details
    })
    .addCase(updateDepartment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

  // Delete department
  builder
    .addCase(deleteDepartment.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteDepartment.fulfilled, (state, action) => {
      state.loading = false;
      state.departments = state.departments.filter(department => department._id !== action.payload); // Remove from list
    })
    .addCase(deleteDepartment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default departmentSlice.reducer;
