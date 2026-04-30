import { gql } from "@apollo/client";

export const GET_ALL_CHATS = gql`
  query getAllChat {
    getAllChats {
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
      icon
      scope
      admins
      moderators
      category
      participantsCount
      pinnedMessageIds
      participantFullNames
      createdAt
      updatedAt
      createdBy
    }
  }
`;

export const GET_MESSAGES_BY_CHAT_ID = gql`
  query getMessagesByChatId($chatId: ID!) {
    getMessagesByChatId(chatId: $chatId) {
      id
      chatId
      courseId
      userId
      content
      isEdited
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const SEARCH_CHATS = gql`
  query SearchChats($keyword: String, $page: Int, $size: Int) {
    searchChats(keyword: $keyword, page: $page, size: $size) {
      page
      size
      total
      items {
        id
        courseId
        batchId
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
  }
`;

export const SEARCH_MESSAGES = gql`
  query SearchMessages(
    $chatId: ID!
    $keyword: String!
    $page: Int
    $size: Int
  ) {
    searchMessages(
      chatId: $chatId
      keyword: $keyword
      page: $page
      size: $size
    ) {
      page
      size
      total
      items {
        id
        chatId
        courseId
        userId
        content
        replyToMessageId
        isEdited
        isDeleted
        isPinned
        deletedBy
        deletedByRole
        deleteReason
        createdAt
        updatedAt
        editableUntil
      }
    }
  }
`;

export const GET_MESSAGE = gql`
  query GetMessages(
    $chatId: ID!
    $messageId: ID
    $type: String!
    $size: Int!
  ) {
    GetMessages(
      chatId: $chatId
      messageId: $messageId
      type: $type
      size: $size
    ) {
      items {
        id
        userId
        username
        chatId
        content
        createdAt
        isPinned
        isEdited
        replyToMessageId
        reactions {
          emoji
          reaction {
            count
          }
        }
      }
      page
      size
      total
    }
  }
`;

export const GET_PINNED_MESSAGES = gql`
  query GetPinnedMessages($chatId: ID!) {
    getPinnedMessages(chatId: $chatId) {
      id
      content
    }
  }
`;

export const GET_CHAT_CATEGORIZATION = gql`
  query GetChatCategorization {
    getChatCategorization {
      hot {
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
        icon
        scope
        admins
        moderators
        participantsCount
        participantUserIds
        participantFullNames
        pinnedMessageIds
        createdAt
        updatedAt
        createdBy
        category
        overAllmesageCount
        last24hoursmessagecount
      }
      warm {
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
        icon
        scope
        admins
        moderators
        participantsCount
        participantUserIds
        participantFullNames
        pinnedMessageIds
        createdAt
        updatedAt
        createdBy
        category
        overAllmesageCount
        last24hoursmessagecount
      }
      cool {
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
        icon
        scope
        admins
        moderators
        participantsCount
        participantUserIds
        participantFullNames
        pinnedMessageIds
        createdAt
        updatedAt
        createdBy
        category
        overAllmesageCount
        last24hoursmessagecount
      }
    }
  }
`;

export const GET_MESSAGE_LOCATION = gql`
  query GetMessageLocation($messageId: ID!, $pageSize: Int!) {
    getMessageLocation(messageId: $messageId, pageSize: $pageSize) {
      page
      size
    }
  }
`;

export const GET_CHAT_PARTICIPANTS = gql`
  query GetChatParticipants($chatId: ID!) {
    getChatParticipants(chatId: $chatId) {
      id
      username
      avatarUrl
      role
      lastActive
    }
  }
`;
