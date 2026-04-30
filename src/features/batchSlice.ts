import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { batchClient, mlClient } from '../graphql/client';
import {
  ADD_BATCH_MODULE_MUTATION,
  BATCH_MAPPING_MUTATION,
  GET_ALL_BATCH,
  GET_ALL_MODULES,
  GET_BATCH_BY_ID,
  GET_BATCH_BY_ID_QUERY,
  GET_SESSIONS_BY_LEARNER,
  PUBLISH_BATCH_MUTATION,
  SESSION_COURSE_MAPPING_MUTATION,
} from '../graphql/queries/batchQueries';
import { DELETE_SESSION_MUTATION } from '../graphql/queries/sessionQueries';

/* ===================== MODULE TYPES ===================== */

export interface Chapter {
  id: string;
  chapterName: string;
}

export interface Book {
  id: string;
  bookName: string;
}

export interface MicroLearn {
  id: string;
  microLearnName: string;
}

export interface Module {
  id: string;
  courseName: string;
  chapter: Chapter[];
  book: Book[];
  microLearn: MicroLearn[];
}

export interface GetAllModulesResponse {
  count: number | null;
  message: string;
  code: number;
  data: Module[];
}

/* ===================== BATCH TYPES ===================== */

interface Batch {
  id: string;
  batchId: string;
  batchName: string;
  batchType: string;
  batchStartDate: string;
  batchEndDate: string;
  totalDays: number;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  enrollmentStatus: string;
  minimumMaximumEnrollment: string;
  minimumEnrollmentRequirement: number;
  batchDays: string[];
  duration: string;
  timeZone: string;
  sessionStartTime: string;
  sessionEndTime: string;
  bannerUrl: string;
  bannerFileName: string;
  bannerFileType: string;
  certificateUrl: string;
  certificateFileName: string;
  certificateFileType: string;
  courseId: string;
  courseName: string;
  universityId: string;
  entityId: string;
  degreeId: string;
  departmentId: string;
  batchSize: number;
  studentFee: number;
  totalBatchFee: number;
  batchRating: number;
  batchOverview: string;
  batchPrerequisites: string;
  learnerId: string;
  trainerId: string;
  batchRank: number;
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

/* ===================== SESSION COURSE MAPPING ===================== */

export interface SessionCourseMappingInput {
  courseId: string;
  bookIds?: string[] | null;
  chapterIds?: string[] | null;
  microLearningIds?: string[] | null;
}

export interface SessionCourseMappingData {
  id: string;
  batchId: string;
  sessionId: string;
  sessionName: string;
  sessionDate: string;
  day: string;
  sessionStartTime: string;
  sessionEndTime: string;
  courseId: string;
  bookIds: string[] | null;
  chapterIds: string[] | null;
  microLearningIds: string[] | null;
  isRescheduled: boolean;
  isActive: boolean;
}

export interface SessionCourseMappingResponse {
  success: number;
  message: string;
  count: number;
  data: SessionCourseMappingData;
}
interface FetchSessionsArgs {
  batchId: string;
  learnerId: string;
  page: number;
  size: number;
}
interface PublishBatchResponse {
  success: number;
  message: string;
  count: number;
  data: any | null;
}
/* ===================== STATE ===================== */
interface DeleteSessionArgs {
  id: string;
  courseId: string;
}
interface BatchState {
  batch: Batch[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  size: number;
  batchedit: any;
  batcheditsession:any;
  modules: Module[];
  deleteResult: any;
  publishedBatch:any;
  // ✅ ADDED (NO FLOW CHANGE)
  data: SessionCourseMappingData | null;
  success: boolean;
  message: string;
  mappingLoading: boolean;
  sessionsLearner:[];
  totalPages:number;
  totalElements:boolean
}

const initialState: BatchState = {
  batch: [],
  loading: false,
  error: null,
  totalCount: 0,
  page: 0,
  size: 20,
  batchedit: null,
  batcheditsession:null,
  modules: [],
  deleteResult: null,
  // ✅ ADDED
  data: null,
  success: false,
  message: '',
  mappingLoading: false,
  publishedBatch:[],
  sessionsLearner:[],
  totalPages:0,
  totalElements:false
};

export const batchMapping = createAsyncThunk(
  'batch/batchMapping',
  async ({ id, trainerId }: { id: string; trainerId: string[] }, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: BATCH_MAPPING_MUTATION,
        variables: { id, input: { trainerId } },
      });
      return (data as any).batchMapping;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBatchById = createAsyncThunk<
  Batch,
  string,
  { rejectValue: string }
>('batch/getBatchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await batchClient.query({
      query: GET_BATCH_BY_ID_QUERY,
      variables: { id },
      fetchPolicy: 'network-only',
    });

    return (data as any).getBatchById;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

export const getAllBatchThunk = createAsyncThunk(
  "batch/getAll",
  async (
    {
      page,
      size,
      search = null,
      filters,
    }: {
      page: number;
      size: number;
      search?: string | null;
      filters?: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const variables = {
        page,
        size,
        search,
        filter: filters ?? null,
      };

      console.log("🚀 GraphQL Request Variables:", variables);

      const { data } = await batchClient.query({
        query: GET_ALL_BATCH,
        variables,
        fetchPolicy: "no-cache",
      });

      return {
        batches: data.getAllBatch.data,
        totalCount: data.getAllBatch.count,
        page,
        size,
      };
    } catch (error: any) {
      console.error("❌ API Error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const  getBatchByIdThunk = createAsyncThunk(
  'batch/getById',
  async ({ batchId }: { batchId: string }, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_BATCH_BY_ID,
        variables: { id: batchId },
        fetchPolicy: 'network-only',
      });

      return (data as any).getBatchById?.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllModules = createAsyncThunk<
  GetAllModulesResponse,
  { courseIds: string[] }
>("modules/fetchAllModules", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await mlClient.query({
      query: GET_ALL_MODULES,
      variables: payload,
    });

    return data.getAllmodules;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch modules");
  }
});

interface ThunkArgs {
  id: string;
  input: SessionCourseMappingInput;
}

export const sessionCourseMappingThunk = createAsyncThunk<
  SessionCourseMappingResponse,
  ThunkArgs,
  { rejectValue: string }
>('sessionCourseMapping/update', async ({ id, input }, { rejectWithValue }) => {
  try {
    const { data } = await batchClient.mutate({
      mutation: SESSION_COURSE_MAPPING_MUTATION,
      variables: { id, input },
    });

    return (data as any).sessionCourseMapping;
  } catch (error: any) {
    return rejectWithValue(
      error?.message || 'Session course mapping failed'
    );
  }
});




export const deleteSessionThunk = createAsyncThunk(
  "session/deleteSession",
  async ({ id, courseId }: DeleteSessionArgs, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: DELETE_SESSION_MUTATION,
        variables: { id, courseId },
      });

      return ( data as any).deleteSession;
    } catch (error: any) {
      return rejectWithValue(error.message || "Delete session failed");
    }
  }
);


export const publishBatchThunk = createAsyncThunk<
  PublishBatchResponse,
  { batchId: string },
  { rejectValue: string }
>(
  "batch/publish",
  async ({ batchId }, { rejectWithValue }) => {
    try {
      const res :any = await batchClient.mutate({
        mutation: PUBLISH_BATCH_MUTATION,
        variables: { batchId },
      });

      const response = res.data?.publishBatch;

      // backend validation error (like session not mapped)
      if (response.success !== 200) {
        return rejectWithValue(response.message);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to publish batch"
      );
    }
  }
);

export const addBatchModule = createAsyncThunk(
  'batch/addModule',
  async ({ batchId, input }: { batchId: string; input: any[] }, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: ADD_BATCH_MODULE_MUTATION,
        variables: { batchId, input },
      });
      return (data as any).addBatchModule;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);  

export const fetchSessionsByLearner = createAsyncThunk(
  "session/fetchSessionsByLearner",
  async ({ batchId, learnerId, page, size }:{batchId:string; learnerId:string; page:number; size:number;}, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_SESSIONS_BY_LEARNER,
        variables: { batchId, learnerId, page, size },
        fetchPolicy: "network-only",
      });

      // ✅ Drill into the nested response correctly
      return data.gettingSessionByLearnerIdAndBatchId.data.content;
    } catch (err: any) {
      return rejectWithValue(err.message || "Error fetching sessions");
    }
  }
);
/* ===================== SLICE ===================== */

const batchSlice = createSlice({
  name: 'batch',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBatch: (state) => {
      state.batch = [];
    },
    clearBatchEdit: (state) => {
      state.batchedit = null;
    },
    clearModules: (state) => {
    state.modules = [];
  },
  clearsessionsLearner:(state)=>{
    state.sessionsLearner=[];
  }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.batcheditsession = action.payload;
      })
      .addCase(getBatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Something went wrong';
      })

      .addCase(getAllBatchThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBatchThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.size = action.payload.size;

        if (action.payload.page === 0) {
          state.batch = action.payload.batches;
        } else {
          state.batch = [...state.batch, ...action.payload.batches];
        }
      })
      .addCase(getAllBatchThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as any;
      })

      .addCase(getBatchByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBatchByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.batchedit = action.payload;
      })
      .addCase(getBatchByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAllModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload.data;
      })
      .addCase(fetchAllModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(sessionCourseMappingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sessionCourseMappingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success === 200;
        state.message = action.payload.message;
        state.data = action.payload.data;
      })
      .addCase(sessionCourseMappingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      })
      .addCase(deleteSessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteResult = action.payload;
      })
      .addCase(deleteSessionThunk.rejected, (state, action) => {
        state.loading = false;
      })
      .addCase(batchMapping.pending, (state) => {
        state.mappingLoading = true;
        state.error = null;
      })
      .addCase(batchMapping.fulfilled, (state) => {
        state.mappingLoading = false;
      })
      .addCase(batchMapping.rejected, (state, action) => {
        state.mappingLoading = false;
        state.error = action.payload as string;
      })
         .addCase(publishBatchThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(publishBatchThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedBatch = action.payload.data;
      })
      .addCase(publishBatchThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to publish batch";
      })
        .addCase(fetchSessionsByLearner.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessionsByLearner.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionsLearner = action.payload || [];
      })
      .addCase(fetchSessionsByLearner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBatch, clearBatchEdit,clearModules,clearsessionsLearner  } = batchSlice.actions;
export default batchSlice.reducer;
