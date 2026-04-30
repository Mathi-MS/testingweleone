import { gql } from '@apollo/client';

export const CREATE_CHAPTER = gql`
  mutation CreateChapter($input: ChapterInput) {
    createChapter(input: $input) {
      count
      message
      code
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
