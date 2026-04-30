import { gql } from "@apollo/client";

export const CREATE_CAREER_COMPASS = gql`
  mutation CreateCareerCompass($input: OnboardingInput!) {
    createCareerCompass(input: $input) {
      status
      message
    }
  }
`;

export const CREATE_ONBOARD_DETAILS = gql`
  mutation CreateOnboardDetails(
    $fullName: String!
    $mobileNumber: String
    $age: Int
    $dob: String
    $email: String
    $district: String
    $school: SchoolInput
    $college: CollegeInput
    $jobSeeker: JobSeekerInput
    $professional: WorkingProfessionalInput
    $userStage: String
    $userId: String
  ) {
    createOnboardDetails(
      input: {
        fullName: $fullName
        mobileNumber: $mobileNumber
        age: $age
        dob: $dob
        email: $email
        userId: $userId
        district: $district
        school: $school
        college: $college
        jobSeeker: $jobSeeker
        professional: $professional
        userStage: $userStage
      }
    ) {
      statusCode
      statusMessage
      data
    }
  }
`;

export const GET_ALL_DISTRICTS = gql`
 query($districtName: String, $page: Int!, $size: Int!) {
  getAllDistricts(districtName: $districtName, page: $page, size: $size) {
    dataList {
      id
      districtName
      stateName
      createdAt
      updatedAt
      isActive
    }
    page
    size
    hasPrevious
    hasNext
  }
}
`;


export const GET_ALL_SCHOOLS = gql`
  query ($schoolName: String, $page: Int!, $size: Int!) {
    getAllSchools(schoolName: $schoolName, page: $page, size: $size) {
      dataList {
        id
        schoolName
        district
        state
        management
        category
        pincode
        isActive
        createdAt
        updatedAt
      }
      page
      size
      hasNext
      hasPrevious
    }
  }
`;


export const GET_ALL_UNIVERSITY = gql`
  query GetAllUniversity(
    $universityName: String
    $page: Int!
    $size: Int!
  ) {
    getAllUniversity(
      universityName: $universityName
      page: $page
      size: $size
    ) {
      dataList {
        universityName
      }
      page
      size
      hasNext
      hasPrevious
    }
  }
`;

export const GET_ALL_COLLEGES = gql`
  query GetAllColleges($universityName: String, $collegeName: String, $page: Int!, $size: Int!) {
    getAllColleges(
      universityName: $universityName
      collegeName: $collegeName
      page: $page
      size: $size
    ) {
      dataList {
        id
        collegeName
        state
        district
        collegeType
        universityName
        universityType
        isActive
        createdAt
        updatedAt
      }
      page
      size
      hasPrevious
      hasNext
    }
  }
`;


// 5️⃣ Degrees
export const GET_ALL_DEGREES = gql`
  query GetAllDegrees($degreeName: String, $page: Int!, $size: Int!) {
    getAllDegrees(degreeName: $degreeName, page: $page, size: $size) {
      dataList {
        id
        degreeName
        isActive
        createdAt
        updatedAt
      }
      page
      size
      hasNext
      hasPrevious
    }
  }
`;


export const GET_ALL_SPECIALIZATIONS = gql`
  query (
    $degreeName: String
    $specializationName: String
    $page: Int!
    $size: Int!
  ) {
    getAllSpecializations(
      degreeName: $degreeName
      specializationName: $specializationName
      page: $page
      size: $size
    ) {
      dataList {
        id
        specializationName
        degreeName
        isActive
        createdAt
        updatedAt
      }
      page
      size
      hasPrevious
      hasNext
    }
  }
`;