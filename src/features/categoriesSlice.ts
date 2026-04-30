import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
 

import { Category } from "../types";
import { mlClient } from "../graphql/client";
import { GET_ALL_CATEGORIES } from "../graphql/queries/categoriesQueries";
import { GET_ALL_SUBCATEGORIES } from "../graphql/queries/mlqueries";
 
interface SubCategory {
  id: string;
  subCategoryName: string;
  isActive: boolean;
}
 
interface CategoryState {
  categories: Category[];
  subCategories: SubCategory[];
  currentCategory: Category | null;
  loading: boolean;
  subLoading: boolean;
  error: string | null;
}
 
const initialState: CategoryState = {
  categories: [],
  subCategories: [],
  currentCategory: null,
  loading: false,
  subLoading: false,
  error: null,
};
 
// ======================================================================
// CATEGORY THUNK
// ======================================================================
export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.query({
        query: GET_ALL_CATEGORIES,
        fetchPolicy: "network-only",
      });
 
      return (data as any).getAllCategories;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
 
// ======================================================================
// SUBCATEGORY THUNK
// ======================================================================
export const fetchSubCategories = createAsyncThunk(
  "categories/fetchSubCategories",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.query({
        query: GET_ALL_SUBCATEGORIES,
        variables: { id: categoryId },
        fetchPolicy: "network-only",
      });
 
      return (data as any).getAllSubCategories.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
 
// ======================================================================
// SLICE
// ======================================================================
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearSubCategories: (state) => {
      state.subCategories = [];
    }
  },
  extraReducers: (builder) => {
    builder
 
      // ==========================================================
      // FETCH ALL CATEGORIES
      // ==========================================================
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
 
      // ==========================================================
      // FETCH SUBCATEGORIES
      // ==========================================================
      .addCase(fetchSubCategories.pending, (state) => {
        state.subLoading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subLoading = false;
        state.subCategories = action.payload;
        console.log("fetchSubCategories:", state.subCategories);
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.subLoading = false;
        state.error = action.payload as string;
      });
  },
});
 
export const {
  clearError,
  clearCurrentCategory,
  clearSubCategories,
} = categorySlice.actions;
 
export default categorySlice.reducer;