import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { GET_ALL_LEARNER, DELETE_LEARNER, BATCH_MAPPING } from '../graphql/queries/learnerQueries'
import { LearnerState, GetAllLearnerResponse, ImportLearnerResponse } from '../types/learner'
import { batchClient, masterClient } from '../graphql/client'
import { apiClient } from '../services/api'

const initialState: LearnerState = {
  learners: [],
  loading: false,
  error: null,
  count: 0,
  hasMore: true,
  currentPage: 0,
  modalLearners: [],
  modalLoading: false,
  modalHasMore: true,
  modalCurrentPage: 0,
  importLoading: false,
  importResult: null,
}

export const getModalLearners = createAsyncThunk(
  'learner/getModalLearners',
  async (
    { page, size, search, reset = false }: { 
      page?: number; 
      size?: number; 
      search?: string; 
      reset?: boolean 
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await masterClient.query({
        query: GET_ALL_LEARNER,
        variables: { page, size, search: search || "" },
        fetchPolicy: "network-only",
      });
      return { ...((data as any).getAllLearner), reset, page };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const importLearners = createAsyncThunk(
  'learner/importLearners',
  async (
    { batchId, file }: { batchId: any; file: File },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('batchId', batchId);
      formData.append('file', file);
      
      const response = await apiClient.post('/batch/import-learner', formData);
      return response as ImportLearnerResponse;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const batchMapping = createAsyncThunk(
  'learner/batchMapping',
  async (
    { id, learnerId }: { id: string; learnerId: string[] },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: BATCH_MAPPING,
        variables: { id, input: { learnerId } },
      });
      return (data as any).batchMapping;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLearner = createAsyncThunk(
  'learner/delete',
  async (
    { id, learnerId }: { id?: string; learnerId?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: DELETE_LEARNER,
        variables: { id, learnerId },
      });
      return (data as any).delete;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllLearners = createAsyncThunk(
  'learner/fetchAll',
  async (
    { page, size, search, filter, reset = false }: { 
      page?: number; 
      size?: number; 
      search?: string; 
      filter?: any;
      reset?: boolean 
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await masterClient.query({
        query: GET_ALL_LEARNER,
        variables: { page, size, search: search || "", filter },
        fetchPolicy: "network-only",
      });
      console.log(data);
      
      return { ...((data as any).getAllLearner), reset, page };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const learnerSlice = createSlice({
  name: 'learner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearImportResult: (state) => {
      state.importResult = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllLearners.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllLearners.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.success && action.payload.data) {
          const { data, reset, page } = action.payload;
          if (reset || page === 0) {
            state.learners = data;
            state.currentPage = 0;
          } else {
            state.learners = [...state.learners, ...data];
            state.currentPage = page || 0;
          }
          state.count = action.payload.count;
          state.hasMore = data.length === (action.meta.arg.size || 10);
        }
      })
      .addCase(getModalLearners.pending, (state) => {
        state.modalLoading = true
        state.error = null
      })
      .addCase(getModalLearners.fulfilled, (state, action) => {
        state.modalLoading = false
        if (action.payload.success && action.payload.data) {
          const { data, reset, page } = action.payload;
          if (reset || page === 0) {
            state.modalLearners = data;
            state.modalCurrentPage = 0;
          } else {
            state.modalLearners = [...state.modalLearners, ...data];
            state.modalCurrentPage = page || 0;
          }
          state.modalHasMore = data.length === (action.meta.arg.size || 4);
        }
      })
      .addCase(getModalLearners.rejected, (state, action) => {
        state.modalLoading = false
        state.error = action.payload as string;
      })
      .addCase(importLearners.pending, (state) => {
        state.importLoading = true
        state.error = null
      })
      .addCase(importLearners.fulfilled, (state, action) => {
        state.importLoading = false
        state.importResult = action.payload
      })
      .addCase(importLearners.rejected, (state, action) => {
        state.importLoading = false
        state.error = action.payload as string
      })
      .addCase(batchMapping.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(batchMapping.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(batchMapping.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(deleteLearner.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLearner.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(deleteLearner.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearImportResult } = learnerSlice.actions
export default learnerSlice.reducer