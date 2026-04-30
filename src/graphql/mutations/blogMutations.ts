import { gql } from "@apollo/client";

export const CREATE_BLOG = gql`
  mutation CreateBlog($input: CreateBlogInput!) {
    createBlog(input: $input) {
      id
      title
      bannerImage
      category
      createdAt
    }
  }
`;

export const CREATE_NEWSLETTER = gql`
  mutation CreateNewsletter($input: CreateNewsletterInput!) {
    createNewsletter(input: $input) {
      id
      title
      sentCount
      createdAt
    }
  }
`;
