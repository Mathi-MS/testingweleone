import { gql } from "@apollo/client";

export const UPDATE_LEARNERS_SESSION = gql`
  mutation UpdateLearnersSession(
    $learnerId: String!
    $sessionId: String!
    $learnerdetails: LearnerSessionInput!
  ) {
    updateLearnersSession(
      learnerId: $learnerId
      sessionId: $sessionId
      learnerdetails: $learnerdetails
    ) {
      success
      message
      count
    }
  }
`;
