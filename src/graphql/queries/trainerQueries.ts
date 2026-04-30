import { gql } from '@apollo/client';
// input TrainerFilterInput {
//   trainerIds: [String!]
// }
export const GET_ALL_TRAINER_QUERY = gql`
  query GetAllTrainer($page: Int, $size: Int, $search: String, $filter:filterInput) {
    getAllTrainer(page: $page, size: $size, search: $search, filter: $filter) {
      success
      message
      count
      data {
        id
        trainerId
        trainerName
        primaryEmail
        primaryMobile
        profilePhotoUrl
        expertiseTags
        language
        domain
         availabilitySlot {
                fromTime
                toTime
            }
      }
    }
  }
`;


export const DELETE_TRAINER_MUTATION = gql`
  mutation Delete($id: String!, $trainerId: String, $confirmation: Boolean) {
    delete(id: $id, trainerId: $trainerId, confirmation: $confirmation) {
      success
      message
      data {
        trainerId
      }
    }
  }
`;



export const GET_BATCH_BY_TRAINER_ID = gql`
  query GetBatchByTrainerId($page: Int!, $size: Int!, $trainerId: String!) {
    getBatchByTrainerId(page: $page, size: $size, trainerId: $trainerId) {
      success
      message
      count
      data {
        totalBatches
        activeBatches
        upcomingBatches
        totalStudents
        averagePercentage
        batchList {
          id
          batchId
          batchName
          batchType
          batchDescription
          batchStartDate
          batchEndDate
          totalDays
          studentCount
          sessionCount
          upcomingSessionCount
          attendancePercentage
          overallProgress
          isUpcoming
          isCompleted
          batchModule {
                    id
                    moduleId
                    batchId
                    weekName
                    isActive
                    createdAt
                    updatedAt
                }
        }
      }
    }
  }
`;



export const GET_ASSESSMENT_BY_SESSION_ID = gql`
  query GetAssessmentBySessionId($sessionId: String!, $page: Int!, $size: Int!) {
    getAssessmentBySessionId(sessionId: $sessionId, page: $page, size: $size) {
      success
      message
      count
      data {
        id
        learnerId
        batchId
        sessionId
        quizId
        sessionName
        is_present
        inTime
        outTime
        learnerCode
        learnerName
        learnerEmail
        assessmentCount
        latestAttemptPercentage
        ProfilePhotoUrl
      }
    }
  }
`;



export const GET_ASSESSMENT_BY_ID = gql`
  query GetAssessmentById($id: String!, $attemptFilter: Int) {
    getAssessmentById(id: $id, attemptFilter: $attemptFilter) {
      success
      message
      count
      data {
        id
        learnerId
        batchId
        sessionId
        quizId
        sessionName
        is_present
        inTime
        outTime
        learnerCode
        learnerName
        learnerEmail
        assessmentCount
        latestAttemptPercentage
        assessmentAttempts {
          totalMarks
          scoredMarks
          percentage
          answers {
            questionId
            selectedOption
            question
            questionType
            answerType
            correctOptions
            isCorrect
            options {
              optionId
              optionText
            }
          }
          createdAt
        }
        ProfilePhotoUrl
      }
    }
  }
`;