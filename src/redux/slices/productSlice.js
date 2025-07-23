// productSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { fetchProducts, createProduct, updateProduct, deleteProduct, getProductById } from '../actions/productActions';

const productSlice = createSlice({
    name: 'products',
    initialState: {
        products: [], // Changed from items to products
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products = action.payload; // Changed from items to products
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products.push(action.payload); // Changed from items to products
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Get Product by ID
            .addCase(getProductById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products = action.payload; // Changed from items to product
            })
            .addCase(getProductById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.products.findIndex((product) => product._id === action.payload._id); // Changed from items to products
                if (index !== -1) state.products[index] = action.payload;
            })

            .addCase(updateProduct.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Delete Product
            .addCase(deleteProduct.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.products = state.products.filter((product) => product._id !== action.payload); // Changed from items to products
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export default productSlice.reducer;