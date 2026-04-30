import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { batchClient } from '../graphql/client';
import { GET_ALL_BATCH_QUERY } from '../graphql/queries/batchQueries';

interface BatchData {
  id: string;
  batchId: string;
  batchName: string;
  batchType: string;
  batchDescription: string;
  batchStartDate: string;
  batchEndDate: string;
  enrollmentEndDate?: string;
  duration: number;
  category: {
    id: string;
    categoryName: string;
  }[];
  skillsYouGain: string[];
  whatYouLearn: string;
  nextSessionDate: string;
  sessionStartTime: string;
  sessionEndTime: string;
  overAllPercentage: number;
  bannerUrl: string;
  sellingPrice: number;
  basePrice: number;
  language: string;
  batchOverview: string;
  isMasterClass: boolean;
  isPublish: boolean;
  courseName: string;
  sessionCount?: number;
  trainerList?: {
    trainerName: string;
  }[];
  forWhom?: string;
}

interface AllBatchesState {
  batches: BatchData[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: AllBatchesState = {
  batches: [],
  count: 0,
  loading: false,
  error: null,
};

export const fetchAllBatches = createAsyncThunk(
  'graphql',
  async (
    params: { isMasterClass?: boolean; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_ALL_BATCH_QUERY,
        variables: {
          page: params.page || 0,
          size: params.size || 12,
        },
        fetchPolicy: 'network-only',
      });

      const response: any = data;
      if (response?.getAllBatch?.data) {
        const filteredData = response.getAllBatch.data
          .filter((batch: BatchData) => batch.isPublish === true)
          .filter((batch: BatchData) =>
            params.isMasterClass !== undefined
              ? batch.isMasterClass === params.isMasterClass
              : true
          );

        return {
          data: filteredData,
          count: filteredData.length,
        };
      }
      return rejectWithValue('No data received from server');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch batches');
    }
  }
);

const allBatchesSlice = createSlice({
  name: 'allBatches',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBatches: (state) => {
      state.batches = [];
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBatches.fulfilled, (state, action) => {
        state.loading = false;
        const currentPage = action.meta.arg?.page || 0;

        if (currentPage === 0) {
          state.batches = action.payload.data;
        } else {
          // Append new data for pagination
          state.batches = [...state.batches, ...action.payload.data];
        }
        state.count = action.payload.count;
      })
      .addCase(fetchAllBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBatches } = allBatchesSlice.actions;
export default allBatchesSlice.reducer;
