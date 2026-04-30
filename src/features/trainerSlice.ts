import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { batchClient, masterClient } from '../graphql/client';
import { GET_ALL_TRAINER_QUERY, DELETE_TRAINER_MUTATION, GET_BATCH_BY_TRAINER_ID, GET_ASSESSMENT_BY_SESSION_ID, GET_ASSESSMENT_BY_ID } from '../graphql/queries/trainerQueries';
import { Trainer, TrainerFilter, TrainerState } from '../types';

const initialState: TrainerState = {
  trainers: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 0,
  modalTrainers: [],
  modalLoading: false,
  modalHasMore: true,
  modalCurrentPage: 0,
  batchList: [],
  batchSummary: null,
  batchLoading: false,
  assessmentList: [],
  assessmentLoading: false,
  assessmentError: null,
  assessmentPagination: { page: 0, size: 10, hasMore: true },
  assessmentById: null,
assessmentByIdLoading: false,
assessmentByIdError: null,
};

export const getAllTrainer = createAsyncThunk(
  'trainer/getAllTrainer',
  async (
    { page, size, search, filter, reset = false }: { 
      page?: number; 
      size?: number; 
      search?: string; 
      filter?: TrainerFilter;
      reset?: boolean 
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await masterClient.query({
        query: GET_ALL_TRAINER_QUERY,
        variables: { page, size, search: search || "", filter },
        fetchPolicy: "network-only",
      });
      return { ...((data as any).getAllTrainer), reset, page };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getModalTrainers = createAsyncThunk(
  'trainer/getModalTrainers',
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
        query: GET_ALL_TRAINER_QUERY,
        variables: { page, size, search: search || "" },
        fetchPolicy: "network-only",
      });
      return { ...((data as any).getAllTrainer), reset, page };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTrainer = createAsyncThunk(
  'trainer/deleteTrainer',
  async ({ id, trainerId,confirmation }: { id?: string; trainerId?: string,confirmation?:boolean }, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: DELETE_TRAINER_MUTATION,
        variables: { id, trainerId,confirmation },
      });
      return (data as any).delete;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBatchByTrainerId = createAsyncThunk(
  "batch/getBatchByTrainerId",
  async (
    {
      page = 0,
      size = 10,
      trainerId,
    }: { page?: number; size?: number; trainerId: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_BATCH_BY_TRAINER_ID,
        variables: { page, size, trainerId },
        fetchPolicy: "network-only",
      });

      return {
        ...data.getBatchByTrainerId,
        page,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAssessmentBySessionId = createAsyncThunk(
  'trainer/getAssessmentBySessionId',
  async (
    { sessionId, page = 0, size = 10 }: { sessionId: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_ASSESSMENT_BY_SESSION_ID,
        variables: { sessionId, page, size },
        fetchPolicy: "network-only",
      });

      return { ...data.getAssessmentBySessionId, page, size };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAssessmentById = createAsyncThunk(
  'trainer/getAssessmentById',
  async (
    { id, attemptFilter }: { id: string; attemptFilter?: number | null },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_ASSESSMENT_BY_ID,
        variables: { id, attemptFilter },
        fetchPolicy: "network-only",
      });

      return data.getAssessmentById;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const trainerSlice = createSlice({
  name: 'trainer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
     clearTrainers: (state) => {
    state.trainers = [];
    state.currentPage = 0;
    state.hasMore = true;

    state.modalTrainers = [];
    state.modalCurrentPage = 0;
    state.modalHasMore = true;
  },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllTrainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTrainer.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          const { data, reset, page } = action.payload;
          if (reset || page === 0) {
            state.trainers = data;
            state.currentPage = 0;
          } else {
            state.trainers = [...state.trainers, ...data];
            state.currentPage = page || 0;
          }
          state.hasMore = data.length === (action.meta.arg.size || 3);
        }
      })
      .addCase(getAllTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getModalTrainers.pending, (state) => {
        state.modalLoading = true;
        state.error = null;
      })
      .addCase(getModalTrainers.fulfilled, (state, action) => {
        state.modalLoading = false;
        if (action.payload.success && action.payload.data) {
          const { data, reset, page } = action.payload;
          if (reset || page === 0) {
            state.modalTrainers = data;
            state.modalCurrentPage = 0;
          } else {
            state.modalTrainers = [...state.modalTrainers, ...data];
            state.modalCurrentPage = page || 0;
          }
          state.modalHasMore = data.length === (action.meta.arg.size || 4);
        }
      })
      .addCase(getModalTrainers.rejected, (state, action) => {
        state.modalLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTrainer.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTrainer.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteTrainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      /* ================= BATCH ================= */

.addCase(getBatchByTrainerId.pending, (state) => {
  state.batchLoading = true;
  state.error = null;
})

.addCase(getBatchByTrainerId.fulfilled, (state, action) => {
  state.batchLoading = false;

  const { success, data, page } = action.payload;

  // ⚠️ your API uses 200 not boolean
  if (success === 200 && data) {
    
    // ✅ summary
    state.batchSummary = {
      totalBatches: data.totalBatches,
      activeBatches: data.activeBatches,
      upcomingBatches: data.upcomingBatches,
      totalStudents: data.totalStudents,
      averagePercentage: data.averagePercentage,
    };

    // ✅ list (pagination)
    if (page === 0) {
      state.batchList = data.batchList;
    } else {
      state.batchList = [...state.batchList, ...data.batchList];
    }
  }
})

.addCase(getBatchByTrainerId.rejected, (state, action) => {
  state.batchLoading = false;
  state.error = action.payload as string;
})

.addCase(getAssessmentBySessionId.pending, (state) => {
  state.assessmentLoading = true;
  state.assessmentError = null;
})

.addCase(getAssessmentBySessionId.fulfilled, (state, action) => {
  state.assessmentLoading = false;

  const { success, data, count, page, size } = action.payload;

  if (success === 200 && data) {
    state.assessmentList = page === 0 ? data : [...state.assessmentList, ...data];
    state.assessmentPagination = {
      page,
      size,
      hasMore: data.length === size,
    };
  }
})

.addCase(getAssessmentBySessionId.rejected, (state, action) => {
  state.assessmentLoading = false;
  state.assessmentError = action.payload as string;
})

.addCase(getAssessmentById.pending, (state) => {
  state.assessmentByIdLoading = true;
  state.assessmentByIdError = null;
})

.addCase(getAssessmentById.fulfilled, (state, action) => {
  state.assessmentByIdLoading = false;

  const { success, data } = action.payload;

  if (success === 200 && data) {
    state.assessmentById = data;
  }
})

.addCase(getAssessmentById.rejected, (state, action) => {
  state.assessmentByIdLoading = false;
  
})
  },
})


export const { clearError,clearTrainers } = trainerSlice.actions;
export default trainerSlice.reducer;