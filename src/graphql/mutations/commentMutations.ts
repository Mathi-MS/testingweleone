import { gql } from "@apollo/client";

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      username
      createdAt
      reactions {
        emoji
      }
    }
  }
`;

export const REPLY_COMMENT = gql`
  mutation ReplyComment($input: ReplyCommentInput!) {
    replyComment(input: $input) {
      id
      content
      parentId
      username
    }
  }
`;

export const EDIT_COMMENT = gql`
  mutation EditComment($input: EditCommentInput!) {
    editComment(input: $input) {
      id
      content
      isEdited
      editedAt
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: ID!, $userId: String!, $userRole: String!, $reason: String) {
    deleteComment(commentId: $commentId, userId: $userId, userRole: $userRole, reason: $reason) {
      id
      isDeleted
      content
    }
  }
`;

export const REACT_TO_COMMENT = gql`
  mutation ReactToComment($commentId: ID!, $userId: String!, $reactionType: String!) {
    reactToComment(commentId: $commentId, userId: $userId, reactionType: $reactionType) {
      id
      reactions {
        emoji
        reaction {
          count
        }
      }
    }
  }
`;
