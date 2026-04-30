import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

import { authClient } from "../graphql/client";
import { setCookie, getCookie, removeCookie } from "../utils/cookieUtils";

// clearTokenRefresh removed
import { AuthState, LoginParams, RefreshTokenResponse,  } from "../types";
import {

  CREATE_PASSWORD,
  FORGOT_PASSWORD,
  GET_TOKEN,
  LOGIN_WITH_GOOGLE,
  REFRESH_TOKEN,
  RESEND_OTP,
  RESET_PASSWORD,
  SIGN_UP,
  VALID_RESET_TOKEN_MUTATION,
  VERIFY_OTP,
  GENERATE_OTP,
  RESEND_MOBILE_OTP,
  VERIFY_MOBILE_OTP,
  UPDATE_EMAIL,
  VERIFY_LOGIN_MOBILE_OTP,
  USER_SIGN_UP,
  CREATE_ACCOUNT,
  GET_ONBOARD_DETAILS,
  UPDATE_USER_MOBILE_OTP,
  UPDATE_USER_MOBILE,

} from "../graphql/queries/authqueries";
import { createOnboardDetails } from "./postverifySlice";


const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  token: null,
  roles: [],
  signupMessage: null,
  expiresIn: null,
  tokenType: null,
  scope: null,
  loginres: false,
  otpcheck: null,
  message: null,
  onBoard: false,
  createpassword: null,
  resendopt: null,
  forgotPassword: null,
  ResetUserPassword: null,
  loading: false,
  error: null,
  hasNext: false,
  hasPrevious: false,
  loginUser: null,
  loginWithGoogle: null,
  googleSignup: null,
  email: null,
  userDetails: null,
  // New state fields
  generateOtpStatus: null,
  verifyMobileOtpStatus: null, // Token from verify mobile otp
  mobileSignupStatus: null,
  createAccountStatus: null,
  updateEmailStatus: null,
  verifyLoginMobileOtpStatus: null,
  isInitialized: false,
  onboardDetails: null,
  isMobile: false,
};

interface signupParams {
  userName: string;
  email: string;
  suggestion: boolean;
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password, clientId, clientSecret }: LoginParams) => {
    const { data } = await authClient.query({
      query: GET_TOKEN,
      variables: {
        input: {
          email,
          password,
          clientId,
          clientSecret,
        },
      },
    });
    return (data as any).getToken;
  }
);

export const signUser = createAsyncThunk(
  "auth/signin",
  async ({ userName, email, suggestion }: signupParams) => {
    const { data } = await authClient.mutate({
      mutation: SIGN_UP,
      variables: {
        input: {
          userName,
          email,
          suggestion,
        },

      },
    });

    if ((data as any).signUp.status !== "Success") {
    }
    return (data as any).signUp;
  }
);

export const refreshTokenAsync = createAsyncThunk(
  "auth/refreshToken",
  async (token: string = "", { rejectWithValue }) => {
    try {
      // If no token provided, try to get from cookie
      const tokenToUse = token || getCookie("refreshToken");

      const { data } = await authClient.query({
        query: REFRESH_TOKEN,
        variables: { token: tokenToUse || null },
        fetchPolicy: "no-cache",
      });

      if (data && data.refreshToken && data.refreshToken.data) {
        const {
          accessToken,
          refreshToken,
          expiresIn,
          tokenType,
          scope,
          roles,
          onBoard,
          user
        } = data.refreshToken.data;

        return {
          accessToken,
          refreshToken,
          expiresIn,
          tokenType,
          scope,
          roles,
          onBoard,
          user
        };
      }
      throw new Error("No refresh token data returned");
    } catch (error: any) {
      // return rejectWithValue("TOKEN_EXPIRED");
      return rejectWithValue(error.message || 'Failed to refresh token');
    }
  }
);

// -------------------------
// Auto Refresh Timer
// -------------------------

//loginWithGoogle
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async ({ token, entity }: { token: string; entity?: string }) => {
    const { data } = await authClient.query({
      query: LOGIN_WITH_GOOGLE,
      variables: { token, entity },
    });

    return (data as any).loginWithGoogle;
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }: { email: string; otp: string }) => {
    const { data } = await authClient.mutate({
      mutation: VERIFY_OTP,
      variables: { email, otp },
    });

    return (data as any).verifyOtp; // returns message string
  }
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async ({ email }: { email: string }) => {
    const { data } = await authClient.mutate({
      mutation: RESEND_OTP,
      variables: { email },
    });

    return (data as any).resendOtp; // returns message string
  }
);

export const createPassword = createAsyncThunk(
  "auth/createPassword",
  async ({
    email,
    password,
    confirmPassword,
  }: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const { data } = await authClient.mutate({
      mutation: CREATE_PASSWORD,
      variables: {
        input: {
          email,
          password,
          confirmPassword,
        },
      },
    });

    return (data as any).createPassword;
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }) => {
    const { data } = await authClient.mutate({
      mutation: FORGOT_PASSWORD,
      variables: {
        email,
      },
    });

    return (data as any).forgotPassword;
  }
);

export const ResetUserPassword = createAsyncThunk(
  "auth/ResetUserPassword",
  async ({
    input,
  }: {
    input: {
      email: string;
      oldPassword: string;
      newPassword: string;
      confirmPassword: string;
    };
  }) => {
    const { data } = await authClient.mutate({
      mutation: RESET_PASSWORD,
      variables: { input }, // must send as input
    });

    return (data as any).resetPassword; // correct response key
  }
);

export const validateResetToken = createAsyncThunk(
  "auth/validateResetToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: VALID_RESET_TOKEN_MUTATION,
        variables: { token },
      });

      return (data as any).validResetToken;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// =======================
//    NEW THUNKS (Migrated from AuthService)
// =======================

export const generateOtp = createAsyncThunk(
  "auth/generateOtp",
  async (emailOrMobile: string, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: GENERATE_OTP,
        variables: { emailOrMobile },
      });
      const response = (data as any).generateOtp;
      if (response.statusCode === 200) {
        return response;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resendMobileOtp = createAsyncThunk(
  "auth/resendMobileOtp",
  async (emailOrMobile: string, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: RESEND_MOBILE_OTP,
        variables: { emailOrMobile },
      });
      const response = (data as any).resendMobileOtp;
      if (response.statusCode === 200) {
        return response;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyMobileOtp = createAsyncThunk(
  "auth/verifyMobileOtp",
  async ({ emailOrMobile, otp }: { emailOrMobile: string; otp: string }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: VERIFY_MOBILE_OTP,
        variables: { emailOrMobile, otp },
      });
      const response = (data as any).verifyMobileOtp;
      if (response.statusCode == 200) {
        return response.data; // This is the temporary token
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEmail = createAsyncThunk(
  "auth/updateEmail",
  async ({ token, email }: { token: string; email: string }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: UPDATE_EMAIL,
        variables: { token, email },
      });
      const response = (data as any).updateEmail;
      if (response.statusCode == 200) {
        return response.data;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyLoginMobileOtp = createAsyncThunk(
  "auth/verifyLoginMobileOtp",
  async ({ emailOrMobile, otp, entity }: { emailOrMobile: string; otp: string; entity?: string }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: VERIFY_LOGIN_MOBILE_OTP,
        variables: { emailOrMobile, otp, entity },
      });
      const response = (data as any).verifyLoginMobileOtp;
      if (response.statusCode == 200) {
        return response.data;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUpMobile = createAsyncThunk(
  "auth/signUpMobile",
  async ({ name, phone }: { name: string; phone?: string }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: USER_SIGN_UP,
        variables: {
          input: {
            fullName: name,
            mobileNumber: phone
          }
        },
      });
      const response = (data as any).userSignUp;
      if (response.statusCode === 200) {
        return {
          id: Date.now().toString(),
          name: name,
          phone: phone
        };
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createAccount = createAsyncThunk(
  "auth/createAccount",
  async ({ phone, email }: { phone: string; email: string }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: CREATE_ACCOUNT,
        variables: { phone, email },
      });
      const response = (data as any).createAccount;
      if (response.statusCode === 200) {
        return response.data;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateUserMobileOtp = createAsyncThunk(
  "auth/updateUserMobileOtp",
  async ({ userId, fullName, mobile, otp }: { userId: string; fullName: string; mobile: string; otp: string }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: UPDATE_USER_MOBILE_OTP,
        variables: { input: { userId, fullName, mobile, otp } },
      });
      const response = (data as any).updateUserMobileOtp;
      if (response.statusCode === 200) {
        return response;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateUserMobile = createAsyncThunk(
  "auth/updateUserMobile",
  async ({ userId, mobile }: { userId: string; mobile: string }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.mutate({
        mutation: UPDATE_USER_MOBILE,
        variables: { userId, mobile },
      });
      const response = (data as any).updateUserMobile;
      if (response.statusCode === 200) {
        return response;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const getOnboardDetails = createAsyncThunk(
  "auth/getOnboardDetails",
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await authClient.query({
        query: GET_ONBOARD_DETAILS,
        variables: { userId },
        fetchPolicy: "no-cache",
      });
      const response = (data as any).getOnboardDetailsByUserId;
      if (response.statusCode === 200) {
        return response.data;
      } else {
        return rejectWithValue(response.statusMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// =======================
//    SLICE
// =======================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      removeCookie("refreshToken");
      // clearTokenRefresh(); // Removed
      // sessionStorage.removeItem("accessToken");
      // sessionStorage.removeItem("refreshToken");
      // sessionStorage.removeItem("user");
      // localStorage.removeItem("authToken");
      // localStorage.clear();
      return initialState;
    },
    setUserFromToken: (state, action) => {
      const token = action.payload;
      if (token) {
        state.accessToken = token; // Added missing assignment
        try {
          const decoded: any = jwtDecode(token);
          state.userDetails = {
            id: decoded.sub || decoded.id,
            name: decoded.name || decoded.userName || decoded.email,
            email: decoded.email,
            roles: decoded.roles || [],
            avatar: decoded.avatar || ""
          };
        } catch (e) {
          console.error("Invalid token", e);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        state.accessToken = action.payload.accessToken;
        if (state.accessToken) {
          // sessionStorage.setItem("accessToken", state.accessToken);
        }
        if (state.refreshToken) {
          setCookie("refreshToken", state.refreshToken);
          // sessionStorage.setItem("refreshToken", state.refreshToken);
        }

        state.expiresIn = action.payload.expiresIn;
        state.tokenType = action.payload.tokenType;
        state.scope = action.payload.scope;
        state.roles = action.payload.roles;
        state.onBoard = action.payload.onBoard;

        if (state.accessToken) {
          try {
            const decoded: any = jwtDecode(state.accessToken);
            state.userDetails = {
              id: action.payload.user?.id || decoded.sub || decoded.id,
              name: action.payload.user?.fullName || "User",
              email: action.payload.email,
              roles: action.payload.roles || [],
              avatar: decoded.avatar || "",
              userType: action.payload.user?.userType || "",
              mobile: action.payload.user?.mobile || "",
              // onBoard: action.payload.onBoard || false
            };
          } catch (e) {
            console.error("Invalid token", e);
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      // =======================
      // SIGNUP HANDLERS
      // =======================
      .addCase(signUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.signupMessage = null;
      })
      .addCase(signUser.fulfilled, (state, action) => {
        state.loading = false;
        state.signupMessage = action.payload; // response string
      })
      .addCase(signUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Signup failed";
      })

      // =======================
      // OTP  HANDLERS
      // =======================
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpcheck = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpcheck = action.payload; // response string
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Signup failed";
      })

      // =======================
      //RESEND OTP  HANDLERS
      // =======================
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resendopt = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.resendopt = action.payload; // response string
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Signup failed";
      })

      // =======================
      //CREATEPASSWORD   HANDLERS
      // =======================

      .addCase(createPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createpassword = null;
      })
      .addCase(createPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.createpassword = action.payload; // response string
      })
      .addCase(createPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Signup failed";
      })

      // =======================
      //FORGOT_PASSWORD  HANDLERS
      // =======================
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.forgotPassword = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPassword = action.payload; // response string
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Signup failed";
      })
      // RESET_PASSWORD

      .addCase(ResetUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.ResetUserPassword = null;
      })
      .addCase(ResetUserPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.ResetUserPassword = action.payload; // response string
      })
      .addCase(ResetUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Signup failed";
      })

      //forgot password validateResetToken

      .addCase(validateResetToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateResetToken.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(validateResetToken.rejected, (state, action) => {
        state.loading = false;
        state.message = action.payload as string;
      })

      .addCase(refreshTokenAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.loading = false;

        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        state.roles = action.payload.roles;
        state.onBoard = action.payload.onBoard;
        state.isMobile = action.payload.user?.isMobile;

        try {
          const decoded: any = jwtDecode(action.payload.accessToken);
          state.userDetails = {
            id: action.payload.user?.id || decoded.sub || decoded.id,
            name: action.payload.user?.fullName,
            email:action.payload.user?.email,
            roles: action.payload.roles || [],
            avatar: decoded.avatar || "",
            userType: action.payload.user?.userType || "",
            mobile: action.payload.user?.mobile || "",
            isMobile:action.payload.user?.isMobile,
          };
        } catch (e) {
          console.error("Invalid token during refresh", e);
        }

        if (action.payload.refreshToken) {
          setCookie("refreshToken", action.payload.refreshToken);
        }
        // sessionStorage.setItem("refreshToken", action.payload.refreshToken);
        state.isInitialized = true;
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = "Refresh token failed";

        state.accessToken = null;
        state.refreshToken = null;
        // sessionStorage.removeItem("accessToken");
        // sessionStorage.removeItem("refreshToken");

        // clearTokenRefresh();
        state.isInitialized = true;
      })
      // .addCase(refreshTokenAsync.rejected, (state, action) => {
      //   state.loading = false;
      //   if (action.payload === "TOKEN_EXPIRED") {
      //   state.accessToken = null;
      //   state.refreshToken = null;
      //   state.expiresIn = null;

      //   // Redirect to login
      //   window.location.href = "/login";
      // }
      // })


      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.email = action.payload.email;
        state.expiresIn = action.payload.expiresIn;
        state.roles = action.payload.roles;
        state.onBoard = action.payload.onBoard;
        state.isMobile = action.payload.isMobile;

        // sessionStorage.setItem("accessToken", action.payload.accessToken);
        if (action.payload.refreshToken) {
          setCookie("refreshToken", action.payload.refreshToken);
          // sessionStorage.setItem("refreshToken", action.payload.refreshToken);
        }

        if (state.accessToken) {
          try {
            const decoded: any = jwtDecode(state.accessToken);
            state.userDetails = {
              id: action.payload.user?.id || decoded.sub || decoded.id,
              name: action.payload.user?.fullName,
              email: action.payload.user?.email,
              roles: action.payload.roles || [],
              avatar: decoded.avatar || "",
              userType: action.payload.user?.userType || "",
              mobile: action.payload.user?.mobile || "",
              isMobile: action.payload.isMobile,
            };
          } catch (e) {
            console.error("Invalid token", e);
          }
        }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // =======================
      // NEW HANDLERS
      // =======================
      .addCase(generateOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.generateOtpStatus = null;
      })
      .addCase(generateOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.generateOtpStatus = action.payload;
      })
      .addCase(generateOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(resendMobileOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendMobileOtp.fulfilled, (state, action) => {
        state.loading = false;
        // reuse resendopt or create new? reusing logic if possible but let's just log or store
      })
      .addCase(resendMobileOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(verifyMobileOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verifyMobileOtpStatus = null;
      })
      .addCase(verifyMobileOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.verifyMobileOtpStatus = action.payload; // This is the temp token
      })
      .addCase(verifyMobileOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.updateEmailStatus = action.payload;

        // Update auth state with returned tokens
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        state.tokenType = action.payload.tokenType;
        state.scope = action.payload.scope;
        state.roles = action.payload.roles;
        state.onBoard = action.payload.onBoard;
        state.email = action.payload.email;

        if (state.accessToken) {
          // sessionStorage.setItem("accessToken", state.accessToken);
          try {
            const decoded: any = jwtDecode(state.accessToken);
            state.userDetails = {
              id: action.payload.user?.id || decoded.sub || decoded.id,
              name: action.payload.user?.fullName ,
              email: action.payload.user?.email,
              roles: action.payload.roles || [],
              avatar: decoded.avatar || "",
              userType: action.payload.user?.userType || "",
              mobile: action.payload.user?.mobile || ""
            };
          } catch (e) {
            console.error("Invalid token", e);
          }
        }
        if (state.refreshToken) {
          setCookie("refreshToken", state.refreshToken);
          // sessionStorage.setItem("refreshToken", state.refreshToken);
        }
      })
      .addCase(updateEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(verifyLoginMobileOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLoginMobileOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.verifyLoginMobileOtpStatus = action.payload;

        // Update auth state with returned tokens
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        state.tokenType = action.payload.tokenType;
        state.scope = action.payload.scope;
        state.roles = action.payload.roles;
        state.onBoard = action.payload.onBoard;
        state.email = action.payload.email;
        state.isMobile = action.payload.isMobile;

        if (state.accessToken) {
          // sessionStorage.setItem("accessToken", state.accessToken);
          try {
            const decoded: any = jwtDecode(state.accessToken);
            state.userDetails = {
              id: action.payload.user?.id || decoded.sub || decoded.id,
              name: action.payload.user?.fullName ,
              email: action.payload.user?.email,
              roles: action.payload.roles || [],
              avatar: decoded.avatar || "",
              userType: action.payload.user?.userType || "",
              mobile: action.payload.user?.mobile || "",
              isMobile: action.payload.isMobile,
            };
          } catch (e) {
            console.error("Invalid token", e);
          }
        }
        if (state.refreshToken) {
          setCookie("refreshToken", state.refreshToken);
          // sessionStorage.setItem("refreshToken", state.refreshToken);
        }
      })
      .addCase(verifyLoginMobileOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(signUpMobile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.mobileSignupStatus = null;
      })
      .addCase(signUpMobile.fulfilled, (state, action) => {
        state.loading = false;
        state.mobileSignupStatus = action.payload;
      })
      .addCase(signUpMobile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createAccountStatus = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.createAccountStatus = action.payload;
        // Maybe update user details?
        state.userDetails = {
          ...(state.userDetails || {} as any),
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          // phone: action.payload.phone 
        };
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getOnboardDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOnboardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.onboardDetails = action.payload;
      })
      .addCase(getOnboardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserMobileOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserMobileOtp.fulfilled, (state, action) => {
        state.loading = false;
        if (state.userDetails && action.payload.statusCode === 200) {
          state.userDetails.name = action.meta.arg.fullName;
          state.userDetails.mobile = action.meta.arg.mobile;
          state.userDetails.isMobile = true;
        }
      })
      .addCase(updateUserMobileOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateUserMobile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserMobile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.userDetails) {
          state.userDetails.mobile = action.payload.data?.mobile || state.userDetails.mobile;
        }
      })
      .addCase(updateUserMobile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createOnboardDetails.fulfilled, (state, action) => {
        if (state.userDetails && action.meta.arg?.fullName) {
          state.userDetails.name = action.meta.arg.fullName;
        }
      });
  },
});

export const { logout, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;
