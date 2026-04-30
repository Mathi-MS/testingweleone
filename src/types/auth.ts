import { District } from "./postverify";

// Login parameters
export interface LoginParams {
  email: string;
  password: string;
  clientId: string;
  clientSecret: string;
  userType?:string;
  mobile?: string;
  onBoard?: boolean;
}

// Signup parameters
export interface SignupParams {
  userName: string;
  email: string;
  suggestion: boolean;
}

// Create password response
export interface CreatePasswordResponse {
  message: string;
  status: string;
  email: string;
}

export interface UserDetails {
  id: string;
  learnerId?: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
  userType?: string;
  mobile?: string;
  isMobile?: boolean;
}

// Auth state interface
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null | undefined;
  roles: string[];
  hasNext: boolean;

  hasPrevious: boolean;
  expiresIn: number | null;
  tokenType: string | null;
  scope: string | null;
  onBoard: boolean;
  loginUser: string | null;
  signupMessage: string | null;
  otpcheck: string | null;
  createpassword: CreatePasswordResponse | null;
  loginWithGoogle: string | null;
  googleSignup: string | null;
  resendopt: string | null;
  forgotPassword: string | null;
  ResetUserPassword: string | null;

  loginres: boolean;
  loading: boolean;

  message: string | null;
  error: string | null;
  token: any;
  email: string | null;
  isMobile: boolean;
  userDetails: UserDetails | null;

  // New State Fields for Mobile/OTP Flow
  generateOtpStatus: any | null;
  verifyMobileOtpStatus: any | null;
  mobileSignupStatus: any | null;
  createAccountStatus: any | null;
  updateEmailStatus: any | null;
  verifyLoginMobileOtpStatus: any | null;
  isInitialized: boolean;
  onboardDetails: any | null;
}

//post verify
export interface PostVerifyLoginParams {
  email: string;
}

export interface PostVerifyAuthState {
  postverify: string | null;
  districtList: [];
  loading: boolean;
  error: string | null;
}

export interface SignupParams {
  userName: string;
  email: string;
  suggestion: boolean;
}

export interface UniversityState {
  universities: any[];
  universityLoading: boolean;
  hasNext: boolean;
  error: string | null;
}

export interface RefreshTokenResponse {
  refreshToken: {
    statusCode: number;
    statusMessage: string;
    data: {
      accessToken: string;
      refreshToken?: string;
      expiresIn: number;
      tokenType: string;
      scope: string;
      roles: string[];
      onBoard?: boolean | null | any;
      email: string;
      userType?: string;
      mobile?: string;
      isMobile?: boolean;
      user?: {
        userType?: string;
        mobile?: string;
        onBoard?: boolean;
        isMobile?: boolean;
      };
    }
  };
}
