import { baseURL } from '@/ApiUrl';
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';


// Fetch all products
export const fetchProducts = createAsyncThunk('products/fetchProducts', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${baseURL}/api/product`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Create a new product
export const createProduct = createAsyncThunk('products/createProduct', async (productData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${baseURL}/api/product`, productData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Update a product
export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, updatedData }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${baseURL}/api/product/${id}`, updatedData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Delete a product
export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id, { rejectWithValue }) => {
    try {
        // await axios.delete(`$${baseURL}/api/product/${id}`);
        // return id;
        toast("Delete option disabled!!! 😲", )
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});
