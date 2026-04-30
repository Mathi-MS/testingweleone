import { gql } from "@apollo/client";

export const GET_ALL_ENTITY = gql`
  query GetAllEntity($page: Int, $size: Int) {
    getAllEntity(page: $page, size: $size) {
      count
      data {
        id
        entityId
        entityName
        entityType
        parentEntityId
        isUniversity
        collegeType
        universityType
        primaryAdmin
        ContactPersonName
        contactEmail
        contactPhone
        logoUrl
        address
        state
        district
        city
        pincode
        degrees {
          degreeType
          departments
        }
      }
    }
  }
`;

export const GET_ENTITY_BY_ID = gql`
  query GetEntityById($id: String!) {
    getEntityById(id: $id) {
      id
      entityId
      entityName
      entityType
      parentEntityId
      isUniversity
      collegeType
      universityType
      primaryAdmin
      ContactPersonName
      contactEmail
      contactPhone
      logoUrl
      address
      state
      district
      city
      pincode
      degrees {
        degreeType
        departments
      }
    }
  }
`;

export const GET_ALL_UNIVERSITY = gql`
  query GetAllUniversity($page: Int!, $size: Int!, $universityName: String) {
    getAllUniversity(page: $page, size: $size, universityName: $universityName) {
      hasPrevious
      hasNext
      dataList {
        universityName
      }
    }
  }
`;

export const GET_ALL_COLLEGE = gql`
  query GetAllCollege($page: Int!, $size: Int!, $universityName: String, $collegeName: String) {
    getAllColleges(page: $page, size: $size, universityName: $universityName, collegeName: $collegeName) {
      hasPrevious
      hasNext
      dataList {
        id
        collegeName
        state
        district
        collegeType
        universityName
        universityType
        isActive
      }
    }
  }
`;

export const DELETE_ENTITY = gql`
  mutation DeleteEntity($id: String!) {
    deleteEntity(id: $id)
  }
`;
export const GET_ALL_STATE = gql`
  query GetAllState($page: Int, $size: Int, $search: String) {
    getAllState(page: $page, size: $size, search: $search) {
      id
      stateName
    }
  }
`;

export const GET_ALL_DISTRICT = gql`
  query GetAllDistrict($stateName: String, $page: Int, $size: Int, $search: String) {
    getAllDistrictByStateName(stateName: $stateName, page: $page, size: $size, search: $search) {
      id
      districtName
    }
  }
`;

export const GET_ALL_CITY = gql`
  query GetAllCity($districtName: String, $page: Int, $size: Int, $search: String) {
    getAllCityByDistrictName(districtName: $districtName, page: $page, size: $size, search: $search) {
      id
      cityName
    }
  }
`;
