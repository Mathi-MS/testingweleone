import { Middleware } from '@reduxjs/toolkit';
import { scheduleTokenRefresh, clearTokenRefresh } from './tokenRefresh';

export const tokenRefreshMiddleware: Middleware = () => (next) => (action:any) => {
  const result = next(action);

  // Schedule refresh after successful login or token refresh
  if (action.type === 'auth/loginUser/fulfilled' || 
      action.type === 'auth/refreshTokenAsync/fulfilled') {
    const { expiresIn } = action.payload;
    if (expiresIn) {
      scheduleTokenRefresh(expiresIn);
    }
  }

  // Clear refresh timer on logout or refresh failure
  if (action.type === 'auth/logout' || 
      action.type === 'auth/refreshTokenAsync/rejected') {
    clearTokenRefresh();
  }

  return result;
};