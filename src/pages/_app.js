
import '../styles/globals.css'; // Global CSS styles
import { Provider } from 'react-redux';
import store, { persistor } from '../redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      {/* PersistGate delays the rendering of the app's UI until the persisted state has been rehydrated */}
      <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
        <ToastContainer
position="top-center"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
/>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
