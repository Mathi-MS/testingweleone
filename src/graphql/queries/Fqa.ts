import { gql } from "@apollo/client";

export const CREATE_FAQ_MUTATION = gql`
  mutation CreateFaq($batchId: String!, $input: [FaqInput]!) {
    createFaq(batchId: $batchId, input: $input) {
      success
      message
      count
      data {
        id
        batchId
        question
        answer
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;



export const DELETE_FAQ_MUTATION = gql`
  mutation DeleteFaq($id: String!) {
    deleteFaq(id: $id) {
      success
      message
      count
      data {
        id
        batchId
        question
        answer
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;


export const GET_FAQS_BY_BATCH_ID = gql`
  query GetFaqsByBatchId($batchId: String!, $page: Int!, $size: Int!) {
    getFaqsByBatchId(batchId: $batchId, page: $page, size: $size) {
      success
      message
      count
      data {
        id
        batchId
        question
        answer
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;



export const GET_FAQ_BY_ID = gql`
  query GetFaqById($id: String!) {
    getFaqById(id: $id) {
      success
      message
      count
      data {
        id
        batchId
        question
        answer
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;



export const UPDATE_FAQ_MUTATION = gql`
  mutation UpdateFaq($id: String!, $input: FaqUpdateInput!) {
    updateFaq(id: $id, input: $input) {
      success
      message
      count
    }
  }
`;