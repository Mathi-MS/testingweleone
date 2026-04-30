import { gql } from '@apollo/client';

export const GET_ALL_BATCH_QUERY = gql`
  query GetAllBatch($page: Int, $size: Int) {
    getAllBatch(page: $page, size: $size) {
      count
      data {
        id
        batchName
        batchDescription
        batchStartDate
        batchEndDate
        enrollmentEndDate
        duration
        skillsYouGain
        category
        sessionStartTime
        sessionEndTime
        sessionCount
        overAllPercentage
        isMasterClass
        isPublish
        bannerUrl
        courseName
        language
        learnerId
        basePrice
        sellingPrice
        forWhom
        isWebsiteEnable
        isSkillBridgeProgram
        brochureUrl
        isReffered
        trainerList {
          trainerName
        }
      }
    }
  }
`;

export const GET_BATCH_BY_ID_QUERY = gql`
  query GetBatchById($id: String!) {
    getBatchById(id: $id) {
      success
      message
      data {
        id
        batchId
        batchName
        batchType
        batchStartDate
        batchEndDate
        totalDays
        enrollmentStartDate
        enrollmentEndDate
        enrollmentStatus
        minimumMaximumEnrollment
        minimumEnrollmentRequirement
        batchDays
        duration
        timeZone
        sessionStartTime
        sessionEndTime
        bannerUrl
        bannerFileName
        bannerFileType
        certificateUrl
        certificateFileName
        certificateFileType
        courseId
        courseName
        universityId
        entityId
        degreeId
        departmentId
        batchSize
        studentFee
        totalBatchFee
        batchRating
        batchOverview
        batchPrerequisites
        learnerId
        trainerId
        batchRank
        isActive
        createdBy
        updatedBy
        createdAt
        updatedAt
        isMasterClass
        isActive
        isPublish
        basePrice
        sellingPrice
        discountType
        discountValue
        discountStartDateTime
        discountEndDateTime
        enableUpi
        enableCardPayment
        enableNetBanking
        enableWallet
        enableEmi
        category
        forWhom
        track
        isWebsiteEnable
        isSkillBridgeProgram
        brochureUrl
        isReffered
        trainerList {
          trainerName
        }
          
      }
    }
  }
`;

export const GET_ALL_BATCH = gql`
  query GetAllBatch($page: Int!, $size: Int!, $search: String, $filter: filterInput) {
    getAllBatch(page: $page, size: $size, search: $search, filter: $filter) {
      success
      message
      count
      data {
        id
        batchId
        batchName
        batchType
        batchDescription
        batchStartDate
        batchEndDate
        totalDays
        enrollmentStartDate
        enrollmentEndDate
        enrollmentStatus
        minimumMaximumEnrollment
        minimumEnrollmentRequirement
        batchDays
        duration
        skillsYouGain
        whatYouLearn
        timeZone
        sessionStartTime
        sessionEndTime
        overAllPercentage
        nextSessionDate
        bannerUrl
        bannerFileName
        bannerFileType
        certificateUrl
        certificateFileName
        certificateFileType
        bannerWebUrl
        bannerMobileUrl
        courseId
        courseName
        universityId
        entityId
        degreeId
        departmentId
        batchSize
        studentFee
        totalBatchFee
        batchRating
        batchOverview
        batchPrerequisites
        language
        learnerId
        trainerId
        batchRank
        isActive
        createdBy
        updatedBy
        createdAt
        updatedAt
        isPublish
        isActive
        isMasterClass
        category
        forWhom
        isWebsiteEnable
        isSkillBridgeProgram
        brochureUrl
        basePrice
        isReffered
        trainerList {
          trainerName
        }
      }
    }
  }
`;

export const GET_BATCH_BY_ID = gql`
  query GetBatchById($id: String!) {
    getBatchById(id: $id) {
      success
      message
      count
      data {
        id
        batchId
        batchName
        batchType
        batchDescription
        batchStartDate
        batchEndDate
        totalDays
        enrollmentStartDate
        enrollmentEndDate
        enrollmentStatus
        minimumMaximumEnrollment
        minimumEnrollmentRequirement
        batchDays
        duration
        skillsYouGain
        whatYouLearn
        timeZone
        sessionStartTime
        sessionEndTime
        overAllPercentage
        nextSessionDate
        bannerUrl
        bannerFileName
        bannerFileType
        bannerWebUrl
        bannerMobileUrl
        certificateUrl
        certificateFileName
        certificateFileType
        courseId
        courseName
        universityId
        entityId
        degreeId
        departmentId
        batchSize
        studentFee
        totalBatchFee
        batchRating
        batchOverview
        batchPrerequisites
        paymentType
        language
        learnerId
        trainerId
        batchRank
        isActive
        createdBy
        updatedBy
        createdAt
        updatedAt
        isMasterClass
        category
        forWhom
        sessionCount
        isSkillBridgeProgram
        isReffered
        basePrice
        trainerList {
          trainerName
        }
        batchModules {
          id
          batchId
          weekName
          isActive
          createdAt
          updatedAt
          moduleDetails {
            moduleName
            moduleDescription
          }
        }
        testBatch
        track
        isWebsiteEnable
        brochureUrl
      }
    }
  }
`;

// src/graphql/queries/getAllModules.query.ts

export const GET_ALL_MODULES = gql`
  query GetAllmodules($courseIds: [String!]!) {
    getAllmodules(courseIds: $courseIds) {
      count
      message
      code
      data {
        id
        courseName
        book {
          id
          bookName
          chapters {
            id
            chapterName
            microLearn {
              id
              microLearnName
            }
          }
        }
      }
    }
  }
`;



export const SESSION_COURSE_MAPPING_MUTATION = gql`
  mutation SessionCourseMapping(
    $id: String!
    $input: CourseMappingInput!
  ) {
    sessionCourseMapping(id: $id, input: $input) {
      success
      message
      count
      data {
        id
        batchId
        sessionId
        sessionName
        sessionDate
        day
        sessionStartTime
        sessionEndTime
        courseId
        bookIds
        chapterIds
        microLearningIds
        isRescheduled
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

// graphql/queries/sessionQueries.ts


export const DELETE_SESSION_MUTATION = gql`
  mutation DeleteSession($id: String!, $courseId: String!) {
    deleteSession(id: $id, courseId: $courseId) {
      success
      message
      count
    }
  }
`;

export const BATCH_MAPPING_MUTATION = gql`
  mutation BatchSingleResponse($id: String!, $input: BatchRequest) {
    batchMapping(id: $id, input: $input) {
      success
      message
      count
      data {
        trainerId
      }
    }
  }
`;


// graphql/mutations/publishBatch.ts

export const PUBLISH_BATCH_MUTATION = gql`
  mutation PublishBatch($batchId:  String!) {
    publishBatch(batchId: $batchId) {
      success
      message
      count
      data {
        id
        batchId
        batchName
        isPublish
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_OVERALL_BATCH_BY_LEARNER_ID = gql`
  query GetOverAllBatchByLearnerId($learnerId: String!, $page: Int, $size: Int) {
    getOverAllBatchByLearnerId(learnerId: $learnerId, page: $page, size: $size) {
      success
      message
      count
      data {
        id
        batchId
        batchName
        batchDescription
        batchStartDate
        batchEndDate
        duration
        skillsYouGain
        sessionStartTime
        sessionEndTime
        sessionCount
        overAllPercentage
        isMasterClass
        isPublish
        bannerUrl
        courseName
        language
        basePrice
        sellingPrice
        forWhom
        isReffered
        trainerList {
          trainerName
        }
        sessionList {
          isCompleted
        }
        testBatch
      }
    }
  }
`;


export const ADD_BATCH_MODULE_MUTATION = gql`
  mutation AddBatchModule($batchId: String!, $input: [batchModuleInput]!) {
    addBatchModule(batchId: $batchId, input: $input) {
      success
      message
      count
      data {
        id
        weekName
        batchId
        moduleDetails {
          moduleName
          moduleDescription
        }
      }
    }
  }`
  ;

export const UPDATE_BATCH_MODULE_MUTATION = gql`
  mutation UpdateBatchModule($id: String!, $input: batchModuleInput) {
    updateBatchModule(id: $id, input: $input) {
      success
      message
      count
      data {
        id
        weekName
        batchId
        moduleDetails {
          moduleName
          moduleDescription
        }
      }
    }
  }`
  ;

export const GET_ALL_BATCH_MODULES = gql`
  query GetAllBatchModules($batchId: String!) {
    getAllBatchModules(batchId: $batchId) {
      success
      message
      count
      data {
        id
        batchId
        weekName
        isActive
        moduleId
        createdAt
        updatedAt
        moduleDetails {
          moduleName
          moduleDescription
        }
      }
    }
  }`
  ;

export const GET_BATCH_MODULE_BY_ID = gql`
  query GetBatchModuleById($id: String!) {
    getBatchModuleById(id: $id) {
      success
      message
      count
      data {
        id
        batchId
        weekName
        isActive
        createdAt
        updatedAt
        moduleDetails {
          moduleName
          moduleDescription
        }
      }
    }
  }`
  ;

export const DELETE_BATCH_MODULE_MUTATION = gql`
  mutation DeleteBatchModule($id: String!) {
    deleteBatchModule(id: $id) {
      success
      message
      count
    }
  }`
  ;

export const GET_TRAINER_BATCHES = gql`
  query GetTrainerBatches {
    getTrainerBatches {
      batchId
      batch_name
      batch_description
      activityStatus
    }
  }
`;

export const GET_BATCH_SESSIONS = gql`
  query GetBatchSessions($batchId: ID!) {
    getBatchSessions(batchId: $batchId) {
      sessionId
      sessionName
      chatCount
    }
  }
`;

export const GET_SESSION_LEARNER_CHATS = gql`
  query GetSessionLearnerChats($sessionId: ID!) {
    getSessionLearnerChats(sessionId: $sessionId) {
      chatId
      sessionId
      learnerId
      learnerFullName
      lastMessage
      lastMessageAt
      updatedAt
    }
  }
`;

// features/session/sessionQuery.tsx

export const GET_SESSIONS_BY_LEARNER = gql`
  query GettingSessionByLearnerIdAndBatchId(
    $batchId: String!
    $learnerId: String!
    $page: Int
    $size: Int
  ) {
    gettingSessionByLearnerIdAndBatchId(
      batchId: $batchId
      learnerId: $learnerId
      page: $page
      size: $size
    ) {
      success
      message
      data {
        totalElements
        totalPages
        content {
          id
          sessionId
          sessionName
          sessionDate
          sessionStartTime
          sessionEndTime
          rescheduleDate
          rescheduleStartTime
          rescheduleEndTime
          recordedUrl
          meetingUrl
          isCompleted
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
          isRescheduled
        }
      }
    }
  }
`;