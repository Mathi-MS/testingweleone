import { gql } from '@apollo/client';

export const GENERATE_SESSION_MUTATION = gql`
  mutation GenerateSession($batchId: String!, $totalSessions: Int!, $confirmation: Boolean!) {
    generateSession(
      batchId: $batchId
      totalSessions: $totalSessions
      confirmation: $confirmation
    ) {
      success
      message
      data {
        id
        batchId
        sessionId
        sessionName
        sessionDescription
        sessionDate
        day
        sessionStartTime
        sessionEndTime
        courseId
        bookIds
        chapterIds
        microLearningIds
        rescheduleDate
        rescheduleStartTime
        rescheduleEndTime
        rescheduleDay
        isRescheduled
        isActive
        createdBy
        updatedBy
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_NEXT_AVAILABLE_SESSION_DATE_QUERY = gql`
  query GetNextAvailableSessionDate($batchId: String!) {
    getNextAvailableSessionDate(batchId: $batchId) {
      success
      message
      data
    }
  }
`;

// export const GET_TRAINER_FROM_BATCH_QUERY = gql`
//   query GetTrainerFromBatch($batchId: String!, $page: Int, $size: Int) {
//     getTrainerFromBatch(batchId: $batchId, page: $page, size: $size) {
//       success
//       message
//       count
//       data {
//         id
//         trainerId
//         trainerName
//       }
//     }
//   }
// `;

export const GET_LEARNERS_FROM_BATCH_QUERY = gql`
  query GetLearnersFromBatch($batchId: String!, $page: Int, $size: Int) {
    getLearnersFromBatch(batchId: $batchId, page: $page, size: $size) {
      success
      message
      count
      data {
        id
        learnerId
        learnerName
        userId
        primaryMobile
        secondaryMobile
      }
    }
  }
`;

export const GET_SESSION_BY_BATCH_ID_QUERY = gql`
  query GetSessionByBatchId($batchId: String!, $page: Int, $size: Int) {
    getSessionByBatchId(batchId: $batchId, page: $page, size: $size) {
      success
      message
      data {
        id
        batchId
        sessionId
        sessionName
        sessionDescription
        sessionDate
        day
        sessionStartTime
        sessionEndTime
        courseId
        bookIds
        chapterIds
        microLearningIds
        rescheduleDate
        rescheduleStartTime
        rescheduleEndTime
        rescheduleDay
        isRescheduled
        trainerId
        isActive
        createdBy
        updatedBy
        createdAt
        updatedAt
        batchStartDate
        batchEndDate
      }
    }
  }
`;

export const DELETE_SESSION_MUTATION = gql`
  mutation DeleteSession($id: String!) {
    deleteSession(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_SESSION_MUTATION = gql`
  mutation CreateSession(
    $batchId: String!
    $sessionName: String
    $sessionDescription : String
    $sessionDate: Date!
    $day: DayOfWeek!
    $sessionStartTime: LocalTime!
    $sessionEndTime: LocalTime!
    $trainerId: [String!]
  ) {
    createSession(
      input: {
        batchId: $batchId
        sessionName: $sessionName
        sessionDescription:$sessionDescription
        sessionDate: $sessionDate
        day: $day
        sessionStartTime: $sessionStartTime
        sessionEndTime: $sessionEndTime
        trainerId: $trainerId
      }
    ) {
      success
      message
    }
  }
`;

export const UPDATE_SESSION_MUTATION = gql`
  mutation UpdateSession(
    $id: String!
    $batchId: String!
    $sessionName: String
    $sessionDescription : String
    $sessionDate: Date!
    $day: DayOfWeek!
    $sessionStartTime: LocalTime!
    $sessionEndTime: LocalTime!
    $reschedule: Boolean!
    $trainerId: [String!]
  ) {
    updateSession(
      id: $id
      input: {
        batchId: $batchId
        sessionName: $sessionName
        sessionDescription:$sessionDescription
        sessionDate: $sessionDate
        day: $day
        sessionStartTime: $sessionStartTime
        sessionEndTime: $sessionEndTime
        trainerId: $trainerId
      }
      reschedule: $reschedule
    ) {
      success
      message
    }
  }
`;

export const GET_SESSION_BY_ID_QUERY = gql`
  query GetSessionById($id: String!) {
    getSessionById(id: $id) {
      success
      message
      count
      data {
        id
        batchId
        sessionId
        sessionName
        sessionDescription
        sessionDate
        day
        sessionStartTime
        sessionEndTime
        recordedUrl
        trainerId
          sessionDocuments {
                documentUrl
                id
                documentFileName
                documentFileType
                documentName
                documentDescription
                isStudentVisble
            }
        rescheduleDate
            rescheduleStartTime
            rescheduleEndTime
            rescheduleDay
            isRescheduled
        trainerList {
          id
          trainerId
          trainerName
          profilePhotoUrl
          domain
        }
        batchStartDate
        batchEndDate
        meetingUrl
        learnerDetails {
          learnerId
          isPresent
          checkIn
          checkOut
          attendedHours
          attendedMins
          seenRecordings
          isTestCompleted
          isCompleted
          learnerName
          isDropOff
          
        }
      }
    }
  }
`;


// graphql/mutations/sessionMutations.ts


export const DELETE_SESSION_MUTATION_COURSE = gql`
  mutation DeleteSession($id: String!, $courseId: String!) {
    deleteSession(id: $id, courseId: $courseId) {
      success
      message
      count
    }
  }
`;

export const GET_QUIZ_BY_SESSION_ID_QUERY = gql`
  query GetQuizBySessionId($sessionId: String!) {
    getQuizBySessionId(sessionId: $sessionId) {
      success
      message
      count
      data {
        id
        batchId
        sessionId
        title
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_QUESTION_BY_QUIZ_ID_QUERY = gql`
  query GetQuestionByQuizId($quizId: String!) {
    getQuestionByQuizId(quizId: $quizId) {
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
        question
        correctOptions
        isActive
        createdAt
        updatedAt
        options {
          optionId
          optionText
        }
      }
    }
  }
`;

export const UPDATE_LEARNER_ASSESSMENT_MUTATION = gql`
  mutation UpdateLearnerAssessment(
    $learnerId: ID!
    $batchId: ID!
    $sessionId: ID!
    $quizId: String!
    $answer: [AnswerInput!]!
  ) {
    updateLearnerAssessment(
      input: {
        learnerId: $learnerId
        batchId: $batchId
        sessionId: $sessionId
        quizId: $quizId
        answer: $answer
      }
    ) {
      success
      message
      count
      data {
        id
        learnerId
        batchId
        sessionId
        sessionName
        is_present
        inTime
        outTime
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
        }
      }
    }
  }
`;

export const GET_ASSESSMENT_BY_SESSION_AND_LEARNER_QUERY = gql`
  query GetAssessmentBySessionIdAndLearnerId($sessionId: String!, $learnerId: String!, $quizId: String!) {
    getAssessmentBySessionIdAndLearnerId(sessionId: $sessionId, learnerId: $learnerId, quizId: $quizId) {
      success
      message
      count
      data {
        id
        learnerId
        batchId
        sessionId
        sessionName
        is_present
        inTime
        outTime
        assessmentAttempts {
          totalMarks
          scoredMarks
          percentage
          answers {
            questionId
            selectedOption
            question
            questionType
            correctOptions
            isCorrect
            options {
              optionId
              optionText
            }
          }
        }
      }
    }
  }
`;