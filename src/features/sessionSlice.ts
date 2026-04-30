import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { batchClient, } from '../graphql/client';
import { GENERATE_SESSION_MUTATION, GET_SESSION_BY_BATCH_ID_QUERY, DELETE_SESSION_MUTATION, UPDATE_SESSION_MUTATION, CREATE_SESSION_MUTATION, GET_NEXT_AVAILABLE_SESSION_DATE_QUERY, GET_LEARNERS_FROM_BATCH_QUERY, GET_SESSION_BY_ID_QUERY,DELETE_SESSION_MUTATION_COURSE } from '../graphql/queries/sessionQueries';

interface Session {
  id: string;
  batchId: string;
  sessionId: string;
  sessionName: string;
  sessionDate: string;
  day: string;
  sessionStartTime: string;
  sessionEndTime: string;
  courseId: string;
  bookIds: string[];
  chapterIds: string[];
  microLearningIds: string[];
  rescheduleDate?: string;
  rescheduleStartTime?: string;
  rescheduleEndTime?: string;
  rescheduleDay?: string;
  isRescheduled: boolean;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  nextAvailableDate: string | null;
  nextAvailableStatus: string | null;
  learners: any[];
  trainers: any[];
  pagination: {
    page: number;
    hasMore: boolean;
    total: number;
  };
  deleteLoading: boolean;
  deleteSuccess: boolean;
  deleteMessage: string | null;
  deleteCount: number;
}

const initialState: SessionState = {
  sessions: [],
  currentSession: null,
  loading: false,
  error: null,
  nextAvailableDate: null,
  nextAvailableStatus: null,
  learners: [],
  trainers: [],
  pagination: {
    page: 0,
    hasMore: true,
    total: 0,
  },
  deleteLoading: false,
  deleteSuccess: false,
  deleteMessage: null,
  deleteCount: 0,
};

interface DeleteSessionArgs {
  id: string;
  courseId: string;
}

export const createSession = createAsyncThunk(
  'session/create',
  async (
    input: {
      batchId?: number | string;
      sessionName?: string;
      sessionDescription?: string;
      sessionDate?: string;
      day?: string;
      sessionStartTime?: string;
      sessionEndTime?: string;
      trainerId?: any;
      learnerId?: any;
    },
    { rejectWithValue,dispatch }
  ) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: CREATE_SESSION_MUTATION,
        variables: input,
      });
      const res = (data as any).createSession;
      
      if (res?.success === 200) {
        dispatch(
          getSessionByBatchId({
            batchId: input.batchId as string,
            page: 0,
            size: 10,
          })
        );
      }
      
      return res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSession = createAsyncThunk(
  'session/update',
  async (
    { id, input, reschedule = false }: 
    { id: string; input: any; reschedule?: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: UPDATE_SESSION_MUTATION,
        variables: { 
          id, 
          reschedule,
          ...input
        },
      });
      
      const res = (data as any).updateSession;
      
      if (res?.success === 200) {
        dispatch(
          getSessionByBatchId({
            batchId: input.batchId,
            page: 0,
            size: 10,
          })
        );
      }
      
      return res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteSession = createAsyncThunk(
  'session/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: DELETE_SESSION_MUTATION,
        variables: { id },
      });
      return (data as any).deleteSession;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSessionByBatchId = createAsyncThunk(
  'session/getByBatchId',
  async (
    { batchId, page, size }: { batchId: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_SESSION_BY_BATCH_ID_QUERY,
        variables: { batchId, page, size },
        fetchPolicy: "network-only",
      });
      return (data as any).getSessionByBatchId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getNextAvailableSessionDate = createAsyncThunk(
  'session/getNextAvailableDate',
  async (batchId: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_NEXT_AVAILABLE_SESSION_DATE_QUERY,
        variables: { batchId },
        fetchPolicy: "network-only",
      });
      return (data as any).getNextAvailableSessionDate;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getLearnersFromBatch = createAsyncThunk(
  'session/getLearnersFromBatch',
  async (
    { batchId, page, size }: { batchId: string; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_LEARNERS_FROM_BATCH_QUERY,
        variables: { batchId, page, size },
        fetchPolicy: "network-only",
      });
      return (data as any).getLearnersFromBatch;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// export const getTrainerFromBatch = createAsyncThunk(
//   'session/getTrainerFromBatch',
//   async (
//     { batchId, page, size }: { batchId: string; page?: number; size?: number },
//     { rejectWithValue }
//   ) => {
//     try {
//       const { data } = await batchClient.query({
//         query: GET_TRAINER_FROM_BATCH_QUERY,
//         variables: { batchId, page, size },
//         fetchPolicy: "network-only",
//       });
//       return (data as any).getTrainerFromBatch;
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

export const generateSession = createAsyncThunk(
  "session/generate",
  async (
    { batchId, totalSessions, confirmation }: 
    { batchId: string; totalSessions: number; confirmation: boolean },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: GENERATE_SESSION_MUTATION,
        variables: { batchId, totalSessions, confirmation },
      });

      const res = (data as any).generateSession;
      
      if (res?.success == 200) {
        dispatch(
          getSessionByBatchId({
            batchId,
            page: 0,
            size: 10,
          })
        );
      }

      return res;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSessionById = createAsyncThunk(
  'session/getById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_SESSION_BY_ID_QUERY,
        variables: { id },
        fetchPolicy: "network-only",
      });
      return (data as any).getSessionById;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const deleteSessionThunk = createAsyncThunk(
  "session/deleteSession",
  async ({ id, courseId }: DeleteSessionArgs, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: DELETE_SESSION_MUTATION_COURSE,
        variables: { id, courseId },
      });

      return (data as any)?.deleteSession;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to delete session"
      );
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSessions: (state) => {
      state.sessions = [];
      state.pagination = {
        page: 0,
        hasMore: true,
        total: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.loading = false;
        // Remove deleted session from state
        const deletedId = action.meta.arg;
        state.sessions = state.sessions.filter(session => session.id !== deletedId);
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getSessionByBatchId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSessionByBatchId.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          const newSessions = action.payload.data;
          const currentPage = action.meta.arg.page || 0;
          const pageSize = action.meta.arg.size || 10;
          
          if (currentPage === 0) {
            state.sessions = newSessions;
          } else {
            state.sessions = [...state.sessions, ...newSessions];
          }
          
          // Calculate hasMore based on returned data length
          const hasMore = newSessions.length === pageSize;
          
          state.pagination = {
            page: currentPage,
            hasMore,
            total: state.sessions.length,
          };
        }
      })
      .addCase(getSessionByBatchId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getNextAvailableSessionDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNextAvailableSessionDate.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.nextAvailableDate = action.payload.data;
        }
        else{
          state.nextAvailableStatus = action.payload;
        }
      })
      .addCase(getNextAvailableSessionDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getLearnersFromBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLearnersFromBatch.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.learners = action.payload.data;
        }
      })
      .addCase(getLearnersFromBatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // .addCase(getTrainerFromBatch.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(getTrainerFromBatch.fulfilled, (state, action) => {
      //   state.loading = false;
      //   if (action.payload.success && action.payload.data) {
      //     state.trainers = action.payload.data;
      //   }
      // })
      // .addCase(getTrainerFromBatch.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload as string;
      // })
      .addCase(generateSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSession.fulfilled, (state, action) => {
        state.loading = false;
        // Don't update sessions here - let the component refresh the data
      })
      .addCase(generateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSessionById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.currentSession = action.payload.data;
        }
      })
      .addCase(getSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        state.deleteMessage = action.payload?.message || null;
      
      })
      .addCase(deleteSessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetSessions } = sessionSlice.actions;
export default sessionSlice.reducer;
