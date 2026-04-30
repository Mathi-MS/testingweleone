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
      email
    }
  }
`;

export const REFRESH_TOKEN = gql`
  query RefreshToken($token: String!) {
    refreshToken(token: $token) {
      statusCode
      statusMessage
      data {
        refreshToken
        accessToken
        expiresIn
        tokenType
        scope
        roles
        onBoard
        email
        isMobile
        user {
            id
            username 
            email 
            mobile 
            firstName 
            lastName 
            fullName 
            roles 
            userType 
            isActive 
            createdAt 
            updatedAt 
            isMobile
          }
      }
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
      email
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
  query LoginWithGoogle($token: String!, $entity: String!) {
    loginWithGoogle(token: $token, entity: $entity) {
      refreshToken
      accessToken
      expiresIn
      tokenType
      scope
      roles
      onBoard
      email
      isMobile
      user {
            id
            username 
            email 
            mobile 
            firstName 
            lastName 
            fullName 
            roles 
            userType 
            isActive 
            createdAt 
            updatedAt 
        }
    }
  }
`;

export const GENERATE_OTP = gql`
  mutation GenerateOtp($emailOrMobile: String!) {
    generateOtp(emailOrMobile: $emailOrMobile) {
      statusCode
      statusMessage
      data
    }
  }
`;

export const RESEND_MOBILE_OTP = gql`
  mutation ResendMobileOtp($emailOrMobile: String!) {
    resendMobileOtp(emailOrMobile: $emailOrMobile) {
      statusCode
      statusMessage
      data
    }
  }
`;

export const VERIFY_MOBILE_OTP = gql`
  mutation VerifyMobileOtp($emailOrMobile: String!, $otp: String!) {
    verifyMobileOtp(emailOrMobile: $emailOrMobile, otp: $otp) {
      statusCode
      statusMessage
      data
    }
  }
`;

export const UPDATE_EMAIL = gql`
  mutation UpdateEmail($token: String!, $email: String!) {
    updateEmail(token: $token, email: $email) {
      statusCode
      statusMessage
      data {
          refreshToken
          accessToken
          expiresIn
          tokenType
          scope
          roles
          email
          onBoard
          user {
            id
            username 
            email 
            mobile 
            firstName 
            lastName 
            fullName 
            roles 
            userType 
            isActive 
            createdAt 
            updatedAt 
          }
      }
    }
  }
`;

export const VERIFY_LOGIN_MOBILE_OTP = gql`
  mutation VerifyLoginOtp($emailOrMobile: String!, $otp: String!, $entity: String!) {
    verifyLoginMobileOtp(emailOrMobile: $emailOrMobile, otp: $otp, entity: $entity) {
      statusCode
      statusMessage
      data {
          refreshToken
          accessToken
          expiresIn
          tokenType
          scope
          roles
          email
          onBoard
          user {
            id
            username 
            email 
            mobile 
            firstName 
            lastName 
            fullName 
            roles 
            userType 
            isActive 
            createdAt 
            updatedAt 
          }
      }
    }
  }
`;

export const USER_SIGN_UP = gql`
  mutation UserSignUp($input: UserSignUpRequest!) {
    userSignUp(input: $input) {
      statusCode
      statusMessage
      data
    }
  }
`;

export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($phone: String!, $email: String!) {
    createAccount(phone: $phone, email: $email) {
      statusCode
      statusMessage
      data {
        id
        name
        phone
        email
      }
    }
  }
`;

export const GET_ONBOARD_DETAILS = gql`
  query GetOnboardDetailsByUserId($userId: String!) {
    getOnboardDetailsByUserId(userId: $userId) {
      statusCode
      statusMessage
      data {
            id
            fullName
            age
            dob
            mobileNumber
            email
            userStage
            isActive
            profileImg
            isDeleted
            createdAt
            updatedAt
            professionalDetails {
                companyName
                currentDomain
                currentRole
                yearsOfExperience
                targetDomain
                dreamCareer
                degree {
                    id
                    degreeName
                }
            }
            jobSeekerDetails {
                yearOfGraduation
                preferredDomain
                dreamCareer
                degree {
                    id
                    degreeName
                }
                specialization {
                    id
                    specializationName
                    degreeName
                }
                college {
                    id
                    collegeName
                    state
                    district
                    collegeType
                    management
                    universityName
                    universityType
                }
            }
            collegeDetails {
                academicYear
                hasInternship
                internshipDetails
                dreamCareer
                college {
                    id
                    collegeName
                    state
                    district
                    collegeType
                    management
                    universityName
                    universityType
                }
                specialization {
                    id
                    specializationName
                    degreeName
                }
                degree {
                    id
                    degreeName
                }
            }
            schoolDetails {
                schoolStandard
                dreamCareer
                school {
                    id
                    schoolName
                    block
                    district
                    state
                    management
                    category
                    pincode
                }
            }
            district {
                id
                stateName
                districtName
            }
        }
    }
  }
`;
export const UPDATE_USER_MOBILE_OTP = gql`
  mutation UpdateUserMobileOtp($input: UpdateUserMobileOtpInput!) {
    updateUserMobileOtp(input: $input) {
      statusCode
      statusMessage
      data
    }
  }
`;
export const UPDATE_USER_MOBILE = gql`
  mutation UpdateUserMobile($userId: String!, $mobile: String!) {
    updateUserMobile(userId: $userId, mobile: $mobile) {
      statusCode
      statusMessage
      data
    }
  }
`;