import { gql } from "@apollo/client";

export const BATCH_MAPPING_MUTATION = gql`
  mutation BatchMapping($id: String!, $courseId: [String!]) {
    batchMapping(
      input: { courseId: $courseId }
      id: $id
    ) {
      success
      message
      count
      data {
        id
        batchId
        batchName
        batchType
        batchStartDate
        batchEndDate
        totalDays
        batchDays
        duration
        sessionStartTime
        sessionEndTime
        timeZone
        courseId
        isActive
      }
    }
  }
`;
