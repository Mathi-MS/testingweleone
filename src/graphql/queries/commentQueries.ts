import { gql } from "@apollo/client";

export const GET_COMMENTS_BY_SESSION = gql`
  query GetCommentsBySession($sessionId: ID!, $page: Int, $limit: Int, $sort: CommentSort) {
    getCommentsBySession(sessionId: $sessionId, page: $page, limit: $limit, sort: $sort) {
      items {
        id
        content
        username
        userId
        userAvatar
        createdAt
        repliesCount
        isPinned
        reactions {
          emoji
          reaction {
            count
          }
        }
      }
      total
      page
      size
    }
  }
`;
