import { gql } from "@apollo/client";

export const GET_ALL_BOOKS = gql`
  query GetAllBooks($page: Int!, $size: Int!, $searchText: String, $bookfilter: CourseFilterInput) {
    getAllBooks(page: $page, size: $size, searchText: $searchText, bookfilter: $bookfilter) {
      count
      data {
        id
        bookId
        bookTitle
        bookDescription
        recomendedDuration
        chapter {
         chapterName
          chapterid
          mappedDate
          mappedBy
          isActive
        }
        trainerFeedback {
          trainerId
          feedbackComment
        }
      }
    }
  }
`;


export const CREATE_BOOK = gql`
  mutation CreateBook($input: BookInput!) {
    createBook(input: $input) {
      count
      message
      code
    }
  }
`;

export const UPDATE_BOOK = gql`
  mutation UpdateBook($id: ID!, $input: BookInput!) {
    updateBook(id: $id, input: $input) {
      count
      message
      code
    }
  }
`;

export const GET_BOOK_BY_ID = gql`
  query GetBookById($id: ID!) {
    getBookById(id: $id) {
      count
      message
      code
      data{
      id
      bookId
      bookTitle
      bookDescription
      recomendedDuration
      chapter {
        mappedDate
        mappedBy
        isActive
        chapterid
        chapterName
        
      }
        }
    }
  }
`;


export const DELETE_BOOK = gql`
  mutation DeleteBook($id: ID!) {
    deleteBook(id: $id){
      count 
      message
      code
    }
  }
`;
