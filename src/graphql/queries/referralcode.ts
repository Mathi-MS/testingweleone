import { gql } from "@apollo/client";

export const CREATE_REFERRAL_MUTATION = gql`
  mutation CreateReferral($input: ReferralInput!) {
    createReferral(input: $input) {
      success
      message
      count
      data {
        id
        name
        mobileNumber
        mailId
        category
        referralCode
        createdAt
        updatedAt
        expiryDate
        expiryTime
        discountAmount
        batchDetails {
            batchId
            batchName
            batchGenId
        }
      }
    }
  }
`;

export const GET_ALL_REFERRALS_QUERY = gql`
  query GetAllReferrals($page: Int!, $size: Int!) {
    getAllReferrals(page: $page, size: $size) {
      id
      name
      mobileNumber
      mailId
      category
      referralCode
      createdAt
      updatedAt
      expiryDate
      expiryTime
      discountAmount
      batchDetails {
            batchId
            batchName
            batchGenId
       }
    }
  }
`;

export const GET_REFERRAL_BY_ID = gql`
  query GetReferralById($id: ID!) {
    getReferralById(id: $id) {
      success
      message
      data {
        id
        name
        mobileNumber
        mailId
        category
        referralCode
        createdAt
        updatedAt
        expiryDate
        expiryTime
        discountAmount
        batchDetails {
            batchId
            batchName
            batchGenId
        }
      }
    }
  }
`;

export const UPDATE_REFERRAL_MUTATION = gql`
  mutation UpdateReferral($id: ID!, $input: ReferralInput!) {
    updateReferral(id: $id, input: $input) {
      success
      message
      count
      data {
        id
        name
        mobileNumber
        mailId
        category
        referralCode
        createdAt
        updatedAt
        expiryDate
        expiryTime
        discountAmount
        batchDetails {
          batchId
          batchName
          batchGenId
        }
      }
    }
  }
`;

export const DELETE_REFERRAL_MUTATION = gql`
  mutation DeleteReferral($id: ID!) {
    deleteReferral(id: $id) {
      status
      message
    }
  }
`;


export const GET_DISCOUNT_PRICE = gql`
  query GetDiscountPrice($input: ReferralPriceRequest!) {
    getDiscountPrice(input: $input) {
      success
      message
      data {
        id
        referralCode
        mobileNumber
        mailId
        batchName
        expiryDate
        expiryTime
        discountAmount
      }
    }
  }
`;

export const GET_REFERRALS_CATEGORY = gql`
  query GettingrefferalsCategory {
    gettingrefferalsCategory {
      success
      message
      count
      data {
        id
        name
        abbrevation
      }
    }
  }
`;
