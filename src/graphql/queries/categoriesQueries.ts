import { gql } from "@apollo/client";
 
 
export const GET_ALL_CATEGORIES = gql`
query GetAllCategories{
getAllCategories{
  id
  categoryName
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
 