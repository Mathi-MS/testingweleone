import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom toast configuration with theme colors
const toastConfig: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

// Themed toast functions
export const showToast = {
  success: (message: string) => toast.success(message, toastConfig),
  error: (message: string) => toast.error(message, toastConfig),
  info: (message: string) => toast.info(message, toastConfig),
  warning: (message: string) => toast.warning(message, toastConfig),
};

// Custom ToastContainer with theme styling
export const ThemedToastContainer: React.FC = () => (
  <ToastContainer
    {...toastConfig}
    toastStyle={{
      backgroundColor: '#FFFFFF',
      color: '#343A40',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    }}
     progressClassName="Toastify__progress-bar"
  />
);