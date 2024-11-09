import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// Fetch all categories
export const fetchCategories = createAsyncThunk('categories/fetchCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${baseURL}/api/category`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Create a new category
export const createCategory = createAsyncThunk('categories/createCategory', async (categoryData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${baseURL}/api/category`, categoryData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Update a category
export const updateCategory = createAsyncThunk('categories/updateCategory', async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${baseURL}/api/category/${id}`, updatedData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Delete a category
export const deleteCategory = createAsyncThunk('categories/deleteCategory', async (id, { rejectWithValue }) => {
    try {
        await axios.delete(`${baseURL}/api/category/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});
