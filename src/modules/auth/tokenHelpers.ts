// tokenHelpers.ts


import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../app/store";
// import { refreshTokenAsync } from "./authSlice";
import { useEffect } from "react";
import { refreshTokenAsync } from "../../features/authSlice";
import { useAppDispatch } from "../../app/hook";

const useAutoRefreshToken = () => {
  const dispatch = useAppDispatch();
  const { refreshToken, expiresIn } = useSelector((state: RootState) => state.ar);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;

    // Refresh a little before expiry (e.g., 60 seconds before)
    const refreshTime = (expiresIn - 60) * 1000;

    const timer = setTimeout(() => {
      console.log(refreshToken,'refreshTokenrefreshTokenrefreshTokenrefreshToken');
      
      dispatch(refreshTokenAsync(refreshToken));
    }, refreshTime);

    return () => clearTimeout(timer); // clear timer on unmount or token change
  }, [refreshToken, expiresIn, dispatch]);
};

export default useAutoRefreshToken;
