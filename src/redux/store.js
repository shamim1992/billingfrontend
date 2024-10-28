import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import appointmentReducer from './slices/appointmentSlice';
import billingReducer from './slices/billingSlice';
import reportReducer from './slices/reportSlice';
import userReducer from './slices/userSlice';
import departmentReducer from './slices/departmentSlice';
import doctorReducer from './slices/doctorSlice';
// Persist Config
const persistConfig = {
  key: 'root', // Key for the persisted storage
  storage,     // Storage type (localStorage)
  whitelist: ['auth'], // Which slice(s) of state to persist
};

// Root Reducer
const rootReducer = combineReducers({
  auth: authReducer,
  patients: patientReducer,
  appointments: appointmentReducer,
  billing: billingReducer,
  reports: reportReducer,
  users: userReducer,
  department: departmentReducer, 
  doctor: doctorReducer,
});

// Persisted Reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store Configuration
const store = configureStore({
  reducer: persistedReducer,
  // middleware: [thunk],
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// Persistor
export const persistor = persistStore(store);

export default store;

