import { gql } from "@apollo/client";

export const GET_ML_LIST = gql`
  query GetAllMicroLearns($page: Int!, $size: Int!) {
    getAllMicroLearns(page: $page, size: $size) {
      totalcount
        microlearnmodel {
            id
            microLearnId
            microLearnTitle
            Duration
            shortDescrpition
            category {
                id
                categoryName
            }
            subCategory {
                id
                subCategoryName
            }
            errormessage
            id
        }
    }
  }
`;

export const GET_ML_BY_ID = gql`
  query GetMicroLearnById($id: ID!) {
  getMicroLearnById(id: $id) {
    count
    message
    code
    data {
      id
      microLearnId
      microLearnTitle
      Duration
      category {
        id
        categoryName
      }
      subCategory {
        id
        subCategoryName
      }
      fullDescription
      shortDescrpition
      recomendedChapter {
        chapterId
        comments
      }
      trainingDocs {
        docId
        docType
        docUrl
        trainerGuideNotes
        isActive
        trainerId
        feedbackComment
        filename
      }
    }
  }
}
`;

export const CREATE_ML = gql`
  mutation CreateMicroLearn($input: MicroLearnRequest!) {
    createMicroLearn(input: $input) {
      count
      message
      code
      data
      {
        id
      microLearnId
      microLearnTitle
      Duration
      category {
        id
        categoryName
      }
      subCategory {
        id
        subCategoryName
      }
      shortDescrpition
      errormessage
      }
    }
  }
`;

export const UPDATE_ML = gql`
  mutation UpdateMicroLearn($id: ID!, $input: MicroLearnRequest!) {
    updateMicroLearn(id: $id, input: $input) {
     count
    message
    code
      data{
        microLearnId
      microLearnTitle
      Duration
      category {
        id
        categoryName
      }
      subCategory {
        id
        subCategoryName
      }
      fullDescription
      shortDescrpition
      }
    }
  }
`;

export const ADD_DOCUMENT = gql`
  mutation AddDocument($id: ID!, $file: Upload!, $trainerGuideNotes: String) {
    addDocument(id: $id, file: $file, trainerGuideNotes: $trainerGuideNotes) {
      docId
      docType
      docUrl
      trainerGuideNotes
    }
  }
`;

export const REMOVE_DOCUMENT = gql`
  mutation DeletetrainingDocs($microlearnid: String!, $documentid: String!) {
    deleteTrainingDocs(microlearnid: $microlearnid, documentid: $documentid) {
      count
      message
      code
    data{
      id
      microLearnId
      microLearnTitle
      Duration
      price
      shortDescrpition
      category {
        id
        categoryName
      }
      subCategory {
        id
        subCategoryName
      }
      errormessage
    }
    }
  }
`;

export const DELETE_MICROLEARN = gql`
  mutation DeleteMicroLearn($id: ID!) {
    deleteMicroLearn(id: $id){
      count
      message
      code
    }
  }
`;

export const GET_ALL_SUBCATEGORIES = gql`
  query GetAllSubCategories($id: String!) {
  getAllSubCategories(id: $id) {
    count
    message
    code
    data {
      id
      subCategoryName
      isActive
    }
  }
}
`;

export const GET_ML_BY_SEARCH = gql`
  query GetAllMicroLearns($page: Int!, $size: Int!, $searchtext: String,$microlearnfilter: CourseFilterInput) {
    getAllMicroLearns(page: $page, size: $size, searchtext: $searchtext,microlearnfilter: $microlearnfilter) {
      count
      data {
        id
        microLearnId
        microLearnTitle
        Duration
        skillevel
        pricingType
        fomoMessage
        price
        fullDescription
        shortDescrpition
        createdAt
        updatedAt
        errormessage
        createdBy
        updatedBy
        recomendedChapter {
          chapterId
          comments
        }
        category {
          id
          categoryName
        }
        subCategory {
          id
          subCategoryName
        }
      }
    }
  }
`;

export const GET_ALL_CATEGORIES = gql`
  query GetAllCategories {
    getAllCategories {
      id
      categoryName
      isActive
      errormessage
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_GUIDE_NOTES = gql`
  mutation UpdateGuideNotes(
    $microlearnid: ID!
    $documentid: ID!
    $guidenotes: String!
  ) {
    updateGuideNotes(
      microlearnid: $microlearnid
      documentid: $documentid
      guidenotes: $guidenotes
    ) {
      id
      microLearnId
      microLearnTitle
      Duration
      skillevel
      pricingType
      fomoMessage
      price
      fullDescription
      shortDescrpition
      createdAt
      updatedAt
      errormessage
      createdBy
      updatedBy
    }
  }
`;

export const GET_MICROLEARN_FILTER_DATA = gql`
  query GetMicroLearnFilterData($page: Int!, $size: Int!) {
    getMicroLearnFilterData(page: $page, size: $size) {
      language
      category {
        id
        categoryName
      }
      chapter {
        count
        data {
          id
          chapterTitle
        }
      }
      book {
        count
        data {
          id
          bookTitle
        }
      }
      course {
        count
        data {
          id
          courseTitle
        }
      }
    }
  }
`;
