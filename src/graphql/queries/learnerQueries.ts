import { gql } from '@apollo/client'

export const GET_ALL_LEARNER = gql`
  query GetAllLearner($page: Int!, $size: Int!, $search: String, $filter: filterInput) {
    getAllLearner(page: $page, size: $size,search: $search, filter: $filter) {
      success
      message
      count
      data {
        id
        learnerId
        learnerName
        primaryEmail
        primaryMobile
      }
    }
  }
`

export const DELETE_LEARNER = gql`
  mutation Delete($id: String!, $learnerId: String) {
    delete(id: $id, learnerId: $learnerId) {
      success
      message
      count
      data {
        id
        batchId
        learnerCount
      }
    }
  }
`

export const BATCH_MAPPING = gql`
  mutation BatchMapping($id: String!, $input: BatchRequest) {
    batchMapping(id: $id, input: $input) {
      success
      message
      count
    }
  }
`

export const GET_LEARNER_DASHBOARD = gql`
  query GettingLearnerDashBoard($learnerId: String!) {
    gettingLearnerDashBoard(learnerId: $learnerId) {
      success
      message
      count
      data {
        nextSessionDate
        nextSessionTime
        nextSessionName
        previousSessionName
        previousSessionDate
        previousSessionTime
        latestAssesementScore
        latestAssesmentDate
        latestAssesmentTime
        totalAttendance
        presentAttendance
        averageAssesementScore
      }
    }
  }
`
