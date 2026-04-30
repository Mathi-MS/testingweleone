import { gql } from "@apollo/client";

export const GET_ALL_COURSE = gql`
  query GetAllCourse($page: Int!, $size: Int!, $searchtext: String, $coursefilter: CourseFilterInput) {
    getAllCourse(page: $page, size: $size, searchtext: $searchtext, coursefilter: $coursefilter) {
      count
      data {
        id
        courseId
        courseTitle
        courseType
        courseDescription
        durationType
        courseDuration
        thumbNailUrl
        skillLevel
        language
        promotionalContent
        skillsYouGain
        whatYouLearn
      }
    }
  }
`;

export const GET_COURSE_BY_ID = gql`
  query GetCourseById($id: ID!) {
    getCourseById(id: $id) {
        count
        message
        code
        data{
      id
      courseId
      courseTitle
      courseType
      courseDescription
      durationType
      courseDuration
      books {
        bookId
        bookName
      }
      thumbNailUrl
      skillLevel
      language
      trainerId
      promotionalContent
      skillsYouGain
      whatYouLearn
      courseCategory {
        id
        categoryName
      }
}
    }
  }
`;


export const GET_ALL_COURSE_CATEGORIES = gql`
  query GetAllCourseCategories {
    getAllCourseCategories {
      id
      categoryName
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id:ID!) {
    deleteCourse(id: $id)
    {
        count
        message
        code
    }
  }
`;
export const GET_MICROLEARN_FILTER_DATA = gql`
  query GetMicroLearnFilterData($page: Int!, $size: Int!, $searchtext: String, $alphabet: String) {
    getMicroLearnFilterData(page: $page, size: $size, searchtext: $searchtext, alphabet: $alphabet) {
      language
      skilllevel
      alphabet
      coursetype
      coursecategory {
        id
        categoryName
      }
      book {
        count
        data {
          id
          bookTitle
        }
      }
    }
  }
`;