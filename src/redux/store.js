import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
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
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
// Persist Config
// const persistConfig = {
//   key: 'root',
//   storage,    
//   whitelist: ['auth'], 
// };

// Root Reducer
// const rootReducer = combineReducers({
//   auth: authReducer,
//   patients: patientReducer,
//   appointments: appointmentReducer,
//   billing: billingReducer,
//   reports: reportReducer,
//   users: userReducer,
//   department: departmentReducer, 
//   doctor: doctorReducer,
//   products: productReducer,
//   category: categoryReducer
// });
// const persistedReducer = persistReducer(persistConfig, rootReducer);
// const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ serializableCheck: false }),
// });
// export const persistor = persistStore(store);
// export default store;





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
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export default store;

