import { gql } from '@apollo/client';

export const GET_ALL_CHAPTERS = gql`
  query GetAllChapter(
    $page: Int!
    $size: Int!
    $searchtext: String
    $chapterfilter: CourseFilterInput
  ) {
    getAllChapter(
      page: $page
      size: $size
      searchtext: $searchtext
        chapterfilter: $chapterfilter
    ) {
      count
      data {
        id
        chapterId
        chapterTitle
        chapterDescription
        recomendedDuration
        createdBy
        updatedBy
        createdAt
        updatedAt
        errormessage
        microLearn {
          microlearnId
          microLearnTitle
          microlearnGenId
          isActive
          mappedDate
          mappedBy
          trainerGuideNotes
        }
      }
    }
  }
`;

export const GET_CHAPTER_BY_ID = gql`
  query GetChapterById($id: ID!) {
    getChapterById(id: $id) {
      count
      message
      code
      data{
      id
      chapterId
      chapterTitle
      chapterDescription
      createdBy
      updatedBy
      createdAt
      updatedAt
      errormessage
      microLearn {
        microlearnId
        mappedDate
        mappedBy
        trainerGuideNotes
        microLearnTitle
        isActive
      }
    }
      }
  }
`;

export const UPDATE_CHAPTER = gql`
  mutation UpdateChapter($id: ID!, $input: ChapterInput!) {
    updateChapter(id: $id, input: $input) {
      count
      message
      code
    }
  }
`;

export const GET_CHAPTERS_WITH_FILTER = gql`
  query GetChapters(
    $page: Int!
    $size: Int!
    $searchtext: String
    $chapterIds: [String]
    $languages: [String]
  ) {
    getAllChapters(
      page: $page
      size: $size
      searchtext: $searchtext
      chapterIds: $chapterIds
      languages: $languages
    ) {
      content {
        id
        chapterId
        chapterTitle
        chapterDescription
        microLearn {
          microLearnTitle
        }
      }
      page
      size
      totalPages
      totalElements
      hasMore
    }
  }
`;


export const DELETE_CHAPTER = gql`
  mutation DeleteChapter($id: ID!) {
    deleteChapter(id: $id){
    
      count 
      message
      code
    
    }
  }
`;

export const GET_BOOK_FILTER = gql`
  query GetMicroLearnFilterData($page: Int!, $size: Int!) {
    getMicroLearnFilterData(page: $page, size: $size) {
      book {
        count
        data {
          id
          bookId
          bookTitle
          bookDescription
          recomendedDuration
        }
      }
    }
  }
`;


export const GET_COURSE_FILTER = gql`
  query GetMicroLearnFilterData($page: Int!, $size: Int!) {
    getMicroLearnFilterData(page: $page, size: $size) {
      course {
        count
        data {
          id
          courseId
          courseTitle
          courseCategory
          courseDescription
          durationType
          courseDuration
          thumbNailUrl
          certificateUrl
          startDate
          endDate
          skillLevel
          language
          trainerId
          promotionalContent
        }
      }
    }
  }
`;

// graphql/queries.ts
export const GET_MICROLEARN_FILTER_DATA = gql`
  query GetMicroLearnFilterData(
    $page: Int!
    $size: Int!
    $alphabet: String
    $searchtext: String
    
  ) {
    getMicroLearnFilterData(
      page: $page
      size: $size
      alphabet: $alphabet
      searchtext: $searchtext
    ) {
      course {
        count
        data {
          id
          courseTitle
        }
      }
      microlearn {
        count
        data {
          id
          microLearnId
          microLearnTitle
        }
      }
      book {
        count
        data {
          id
          bookId
          bookTitle
        }
      }
      chapter {
        count
        data {
          id
          chapterId
          chapterTitle
          chapterDescription
          recomendedDuration
          createdBy
          updatedBy
          createdAt
          updatedAt
          errormessage
        }
      }
    }
  }
`;

export const GET_ALL_MAPPED_MODULES = gql`
 query GetAllMappedModules($id: ID!, $type: Modules!) {
  getAllMappedModules(id: $id, type: $type) {
    count
        message
        code
        data {
            chapter
            course
            book
        }
  }
}

`;