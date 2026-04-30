import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { batchClient } from '../graphql/client';
import { GET_OVERALL_BATCH_BY_LEARNER_ID } from '../graphql/queries/batchQueries';

interface BatchData {
  id: string;
  batchId: string;
  batchName: string;
  batchDescription: string;
  batchStartDate: string;
  batchEndDate: string;
  duration: number;
  skillsYouGain: string[];
  sessionStartTime: string;
  sessionEndTime: string;
  overAllPercentage: number;
  bannerUrl: string;
  sellingPrice: number;
  basePrice: number;
  language: string;
  isMasterClass: boolean;
  courseName: string;
  sessionCount?: number;
  trainerList?: {
    trainerName: string;
  }[];
  forWhom?: string;
  isPublish?: boolean;
  testBatch?: boolean;
}

interface LearnerBatchesState {
  batches: BatchData[];
  count: number;
  loading: boolean;
  error: string | null;
}

const initialState: LearnerBatchesState = {
  batches: [],
  count: 0,
  loading: false,
  error: null,
};

export const fetchLearnerBatches = createAsyncThunk(
  'learnerBatches/fetch',
  async (
    params: { learnerId: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_OVERALL_BATCH_BY_LEARNER_ID,
        variables: {
          learnerId: params.learnerId,
          page: params.page || 0,
          size: params.size || 100,
        },
        fetchPolicy: 'network-only',
      });

      if (data?.getOverAllBatchByLearnerId?.success === 200 && data?.getOverAllBatchByLearnerId?.data) {
        const publishedBatches = data.getOverAllBatchByLearnerId.data.filter(
          (batch: BatchData) => batch.isPublish !== false
        );
        return {
          data: publishedBatches,
          count: publishedBatches.length,
        };
      }
      return rejectWithValue(data?.getOverAllBatchByLearnerId?.message || 'No data received from server');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch learner batches');
    }
  }
);

const learnerBatchesSlice = createSlice({
  name: 'learnerBatches',
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
      .addCase(fetchLearnerBatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearnerBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(fetchLearnerBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBatches } = learnerBatchesSlice.actions;
export default learnerBatchesSlice.reducer;
