// store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import {thunk} from 'redux-thunk';
import authReducer, { setAuthFromStorage } from './slices/authSlice'; // ✅ Check import here
import patientReducer from './slices/patientSlice';
import appointmentReducer from './slices/appointmentSlice';
import billingReducer from './slices/billingSlice';
import reportReducer from './slices/reportSlice';
import userReducer from './slices/userSlice';
import departmentReducer from './slices/departmentSlice';
import doctorReducer from './slices/doctorSlice';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';

import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => ({
  getItem() {
    return Promise.resolve(null);
  },
  setItem() {
    return Promise.resolve();
  },
  removeItem() {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== 'undefined'
    ? require('redux-persist/lib/storage').default
    : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientReducer,
  appointments: appointmentReducer,
  billing: billingReducer,
  reports: reportReducer,
  users: userReducer,
  department: departmentReducer, 
  doctor: doctorReducer,
  products: productReducer,
  category: categoryReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, thunk }),
});

export const persistor = persistStore(store);

// ✅ Token Consistency Check
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
        store.dispatch(setAuthFromStorage({ token, user })); // Corrected here
    }
}

export default store;
