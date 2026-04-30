import { store } from "../app/store";
import { refreshTokenAsync } from "../features/authSlice";
// import { refreshTokenAsync } from "../modules/auth/authSlice";

let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Schedule automatic token refresh before expiration
 * @param expiresIn - Token expiration time in seconds
 */
export const scheduleTokenRefresh = (expiresIn: number) => {

    console.log(expiresIn, "expiresIn")
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  const refreshTime = (expiresIn - 30) * 1000;

  const timeout = Math.max(refreshTime, 0);

  console.log(`Token will refresh in ${timeout / 1000} seconds`);

  refreshTimer = setTimeout(async () => {
    const state = store.getState();
    const refreshToken = state.ar.refreshToken;

    if (refreshToken) {
      console.log('Auto-refreshing token...');
      try {
        await store.dispatch(refreshTokenAsync(refreshToken));
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }
  }, timeout);
};

/**
 * Clear the token refresh timer
 */
export const clearTokenRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

/**
 * Initialize token refresh on app load
 */
export const initializeTokenRefresh = () => {
  const state = store.getState();
  const { expiresIn, accessToken } = state.ar;

  if (accessToken && expiresIn) {
    scheduleTokenRefresh(expiresIn);
  }
};