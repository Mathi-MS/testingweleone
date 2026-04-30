import { gql } from "@apollo/client";

export const GET_BLOGS = gql`
  query GetBlogs {
    getBlogs {
      id
      title
      authorName
      authorRole
      authorImage
      bannerImage
      content
      category
      createdAt
    }
  }
`;

export const GET_BLOG_BY_ID = gql`
  query GetBlogById($id: ID!) {
    getBlogById(id: $id) {
      id
      title
      authorName
      authorRole
      authorImage
      bannerImage
      content
      category
      createdAt
    }
  }
`;

export const GET_NEWSLETTERS = gql`
  query GetNewsletters {
    getNewsletters {
      id
      title
      authorName
      authorRole
      authorImage
      bannerImage
      content
      category
      sentCount
      createdAt
    }
  }
`;

