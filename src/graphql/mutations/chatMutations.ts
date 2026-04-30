import { gql } from "@apollo/client";

export const CREATE_CHAT = gql`
  mutation CreateChat($input: CreateChatInput!) {
    createChat(input: $input) {
      id
      courseId
      batchId
      type
      sessionId
      learnerId
      trainerId
      trainerIds
      title
      description
      scope
      admins
      moderators
      participantsCount
      pinnedMessageIds
      createdAt
      updatedAt
      createdBy
    }
  }
`;

export const JOIN_GROUP = gql`
  mutation JoinGroup($chatId: ID!) {
    joinGroup(chatId: $chatId) {
      id
      chatId
      userId
      userType
      role
      status
      type
      createdAt
      updatedAt
    }
  }
`;

export const REQUEST_TO_JOIN_GROUP = gql`
  mutation RequestToJoinGroup($chatId: ID!) {
    requestToJoinGroup(chatId: $chatId) {
      id
      chatId
      userId
      userType
      role
      status
      type
      createdAt
      updatedAt
    }
  }
`;

export const POST_SESSION_FEEDBACK = gql`
  mutation PostSessionFeedback($input: PostFeedbackInput!) {
    postSessionFeedback(input: $input) {
      id
      sessionId
      courseId
      userId
      username
      userType
      content
      rating
      createdAt
      updatedAt
    }
  }
`;

export const GET_MY_FEEDBACK_BY_SESSION = gql`
  query GetMyFeedbackBySession($sessionId: ID!, $userId: String!) {
    getMyFeedbackBySession(sessionId: $sessionId, userId: $userId) {
      id
      sessionId
      courseId
      userId
      username
      userType
      content
      rating
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEEDBACK_BY_SESSION = gql`
  query GetFeedbackBySession($sessionId: ID!, $requesterId: String!, $requesterRole: String!) {
    getFeedbackBySession(sessionId: $sessionId, requesterId: $requesterId, requesterRole: $requesterRole) {
      page
      size
      total
      items {
        id
        sessionId
        courseId
        userId
        username
        userType
        content
        rating
        createdAt
        updatedAt
      }
    }
  }
`;
