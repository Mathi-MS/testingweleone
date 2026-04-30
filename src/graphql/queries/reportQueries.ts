import { gql } from "@apollo/client";

export const GET_LEARNERS_REPORT = gql`
  query GetlearnersReport($page: Int, $size: Int, $isMasterClass: Boolean!) {
    getlearnersReport(isMasterClass: $isMasterClass, page: $page, size: $size) {
      success
      message
      count
      data {
        userId
        userName
        mobileNumber
        email
        learnerId
        batch {
          batchStartDate
          batchEndDate
          courseName
          paymentType
          updatedAt
        }
      }
    }
  }
`;

export const GET_BATCH_REPORT = gql`
  query GetBatchReport($page: Int!, $size: Int!, $isMasterClass: Boolean!) {
    getBatchReport(page: $page, size: $size, isMasterClass: $isMasterClass) {
      success
      message
      count
      enrolledUsersCount
      data {
        id
        batchStartDate
        batchEndDate
        batchId
        batchName
        paymentType
        updatedAt
        usereportresponse {
          userId
          userName
          mobileNumber
          email
          learnerId
          userType
          source
          time
          date
        }
      }
    }
  }
`;

export const GET_BATCH_REPORT_WITH_FILTER = gql`
  query GetBatchReportWithFilter(
    $page: Int!
    $size: Int!
    $isMasterClass: Boolean
    $batchId: [String]  
    $paymentType: PaymentType
    $updatedAt: String        
  ) {
    getBatchReport(
      page: $page
      size: $size
      isMasterClass: $isMasterClass
      Filter: {
        batchId: $batchId
        paymentType: $paymentType
        updatedAt: $updatedAt  
      }
    ) {
      success
      message
      count
      data {
        id
        batchStartDate
        batchEndDate
        batchId
        batchName
        paymentType
        updatedAt
        usereportresponse {
          userId
          userName
          mobileNumber
          email
          learnerId
          userType
          source
          time
          date
        }
      }
    }
  }
`;

export const FILTER_ASSESSMENT_RESULTS = gql`
  query FilterAssessmentResults(
  $page: Int!
  $limit: Int!
  $tracks: [String]
  $completedAt: String
) {
  filterAssessmentResults(
    page: $page
    limit: $limit
    tracks: $tracks
    completedAt: $completedAt
  ) {
    items {
      id
      userId
      sessionId
      primaryTrack
      secondaryTrack
      completedAt
      fullName
      mobileNumber
      email
      fullName
      updatedAt
      createdAt
      trackResults {
        id
        trackName
        score
        details {
          cogPercent
          behPercent
          trackStrengthPercent
        }
      }
    }
  }
}
`;

export const GET_AI_DAILY_USAGE = gql`
  query GetAIDailyUsage(
    $filter: AIUsageFilterInput
    $page: Int
    $size: Int
  ) {
    getAIDailyUsage(filter: $filter, page: $page, size: $size) {
      totalAiUsage
      totalAppAiUsage
      aiUsage {
        id
        date
        tokensUsed
        messagesCount
        createdAt
        updatedAt
      }
      appAiUsage {
        id
        date
        tokensUsed
        messagesCount
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_BROCHURE_HISTORY = gql`
  query GetBrochureHistory($page: Int!, $size: Int!) {
    getBrochureHistory(page: $page, size: $size) {
      success
      message
      count
      data {
        id
        name
        mobileNumber
        email
        batchName
        downloadedAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_CONTACT_INQUIRY = gql`
  query GetContactInquiry($page: Int!, $size: Int!) {
    getContactInquiry(page: $page, size: $size) {
      success
      message
      count
      data {
        id
        name
        email
        mobileNo
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_COURSE_LEAD = gql`
  query GetCourseLead($page: Int!, $size: Int!) {
    getCourseLead(page: $page, size: $size) {
      success
      message
      count
      data {
        id
        name
        email
        mobileNo
        isActive
        createdAt
        updatedAt
        batchDetails {
          batchId
          createdAt
          batchName
        }
      }
    }
  }
`;

