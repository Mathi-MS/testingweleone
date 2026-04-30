import { gql } from "@apollo/client";

export const ADD_QUIZ = gql`
  mutation AddQuizQuestion(
    $batchId: String!
    $sessionId: String!
    $quizInput: SessionQuizInput!
    $input: [QuizQuestionInput!]!
  ) {
    addQuizQuestion(
      batchId: $batchId
      sessionId: $sessionId
      quizInput: $quizInput
      input: $input
    ) {
      success
      message
      count
      data {
        id
        quizId
        batchId
        sessionId
        questionType
        answerType
        correctOptions
        marks
        expanded
        isActive
        createdAt
        updatedAt
        options {
          optionId
          optionText
        }
        customField {
          placeholder
          helperText
          required
          minLength
          maxLength
        }
      }
    }
  }
`;


export const UPDATE_QUIZ_QUESTION = gql`
  mutation UpdateQuizQuestion(
    $sessionId: String!
    $quizInput: SessionQuizInput!
    $input: [QuizQuestionInput!]!
  ) {
    updateQuizQuestion(
      sessionId: $sessionId
      quizInput: $quizInput
      input: $input
    ) {
      success
      message
      data {
        id
        quizId
        sessionId
        questionType
        answerType
        marks
      }
    }
  }
`;

export const GET_QUESTION_BY_SESSION_ID = gql`
  query GetQuestionBySessionId($sessionId: String!) {
    getQuestionBySessionId(sessionId: $sessionId) {
       success
        message
        count
        data {
            id
            batchId
            sessionId
            title
            duration
            passMark
            createdAt
            updatedAt
            questions {
                id
                quizId
                batchId
                sessionId
                questionType
                question
                answerType
                correctOptions
                marks
                expanded
                isActive
                createdAt
                updatedAt
                options {
                  optionId
                  optionText
                }
                customField {
                  placeholder
                  helperText
                  required
                  minLength
                  maxLength
                }
            }
        }
    }
  }
`;



export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($sessionId: String!) {
    deleteQuiz(sessionId: $sessionId) {
      success
      message
      count
    }
  }
`;

export const GET_QUESTION_BY_BATCH_ID = gql`
  query GetQuestionByBatchId($batchId: String!) {
    getQuestionByBatchId(batchId: $batchId) {
      success
      message
      count
      data {
        id
        batchId
        sessionId
        title
        duration
        passMark
        createdAt
        updatedAt
      }
    }
  }
`;


