import { gql } from '@apollo/client'

export const GET_TOKEN = gql`
  query GetToken($input: AuthRequest!) {
    getToken(input: $input) {
      refreshToken
      accessToken
      expiresIn
      tokenType
      scope
      roles
      onBoard
    }
  }
`;

export const REFRESH_TOKEN = gql`
  query RefreshToken($token: String!) {
    refreshToken(token: $token) {
      refreshToken
      accessToken
      expiresIn
      tokenType
      scope
      roles
      onBoard
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpRequest!) {
    signUp(input: $input) {
      userName
      email
      status  
      message
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation verifyOtp($email: String!, $otp: String!) {
    verifyOtp(email: $email, otp: $otp) {
      message
      status
    }
  }
`;
//resendotp

 export const RESEND_OTP = gql`
  mutation ResendOtp($email: String!) {
    resendOtp(email: $email) {
      message
      status
    }
  }
`;

//createpassword



 export const CREATE_PASSWORD = gql`
  mutation CreatePassword($input: CreatePassword!) {
    createPassword(input: $input) {
      message
      status
    }
  }
`;

// FORGOTPASSWORD

 export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      status
      message
    }
  }
`;

//  RESETOTPPASSWORD

export const RESET_PASSWORD = gql`
  mutation ResetUserPassword($input: ResetPassword!) {
    resetPassword(input: $input) {
      status
      message
    }
  }
`;

export const VALID_RESET_TOKEN_MUTATION = gql`
  mutation ValidResetToken($token: String!) {
    validResetToken(token: $token) {
      status
      message
    }
  }
`;


export const LOGIN_WITH_GOOGLE = gql`
  query LoginWithGoogle($token: String!) {
    loginWithGoogle(token: $token) {
      refreshToken
      accessToken
      expiresIn
      tokenType
      scope
      roles
      onBoard
      email
    }
  }
`;
