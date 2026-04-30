import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { batchClient, communityClient } from "../../graphql/client";
import {
  FILTER_ASSESSMENT_RESULTS,
  GET_BATCH_REPORT,
  GET_BATCH_REPORT_WITH_FILTER,
  GET_AI_DAILY_USAGE,
  GET_BROCHURE_HISTORY,
  GET_CONTACT_INQUIRY,
  GET_COURSE_LEAD,
} from "../../graphql/queries/reportQueries";

/* =====================================================
   TYPES
===================================================== */

export interface BatchReportFilter {
  batchIds?: string[];
  paymentType?: string;
  updatedAt?: string;
  completedAt?: string;
}

/* =====================================================
   THUNK : BATCH REPORT
===================================================== */

export const getLearnersReportThunk = createAsyncThunk(
  "report/getBatchReport",
  async ({
    page,
    size,
    isMasterClass,
    Filter,
  }: {
    page: number;
    size: number;
    isMasterClass: boolean;
    Filter?: BatchReportFilter;
  }) => {
    const hasFilter = !!(
      Filter?.batchIds?.length ||
      Filter?.paymentType ||
      Filter?.updatedAt
    );

    const response = await batchClient.query({
      query: hasFilter ? GET_BATCH_REPORT_WITH_FILTER : GET_BATCH_REPORT,
      variables: {
        page,
        size,
        isMasterClass,
        // ✅ pass batchIds array directly
        ...(Filter?.batchIds?.length ? { batchId: Filter.batchIds } : {}),
        ...(Filter?.paymentType
          ? { paymentType: Filter.paymentType.toUpperCase() }
          : {}),
        ...(Filter?.updatedAt ? { updatedAt: Filter.updatedAt } : {}),
      },
      fetchPolicy: "network-only",
    });

    const allBatches = response.data.getBatchReport.data || [];

    const learners = allBatches.flatMap((batch: any) =>
      (batch.usereportresponse || []).map((user: any) => ({
        userId: user.userId,
        userName: user.userName,
        mobileNumber: user.mobileNumber,
        email: user.email,
        learnerId: user.learnerId,
        batch: [
          {
            id: batch.id,
            batchStartDate: batch.batchStartDate,
            batchEndDate: batch.batchEndDate,
            courseName: batch.batchName,
            paymentType: batch.paymentType,
            updatedAt: batch.updatedAt,
          },
        ],
      }))
    );

    return {
      success: 1,
      message: "",
      count: learners.length,
      data: learners,
    };
  }
);

export const getDashboardBatchReportThunk = createAsyncThunk(
  "report/getDashboardBatchReport",
  async ({
    page,
    size,
    isMasterClass,
  }: {
    page?: number | null;
    size?: number | null;
    isMasterClass: boolean;
  }) => {
    const actualPage = page ?? 0;
    const actualSize = size ?? 1000;
    
    const response = await batchClient.query({
      query: GET_BATCH_REPORT,
      variables: {
        page: actualPage,
        size: actualSize,
        isMasterClass,
      },
      fetchPolicy: "network-only",
    });

    return {
      isMasterClass,
      data: response.data.getBatchReport,
    };
  }
);

/* =====================================================
   THUNK : ASSESSMENT RESULTS
===================================================== */

export const getAssessmentResultsThunk = createAsyncThunk(
  "report/getAssessmentResults",
  async ({
    page,
    limit,
    tracks,
    completedAt, // ✅ renamed from updatedAt to match query variable
  }: {
    page: number;
    limit: number;
    tracks?: string[];  
    completedAt?: string; // ✅ optional
  }) => {
    const response = await communityClient.query({
      query: FILTER_ASSESSMENT_RESULTS,
      variables: {
        page,
        limit,
        ...(tracks?.length ? { tracks } : {}),
        ...(completedAt ? { completedAt } : {}), // ✅ matches $completedAt in query
      },
      fetchPolicy: "network-only",
    });

    const items = response.data.filterAssessmentResults.items;

    const results = items.map((item: any) => ({
      id: item.id,
      userId: item.userId,
      sessionId: item.sessionId,
      primaryTrack: item.primaryTrack,
      secondaryTrack: item.secondaryTrack,
      completedAt: item.completedAt,
      username: item.username,
      mobileNumber: item.mobileNumber,
      email: item.email,
      fullName: item.fullName,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
      trackResults: item.trackResults,
    }));

    return {
      data: results,
      count: results.length,
    };
  }
);

/* =====================================================
   THUNK : AI DAILY USAGE
===================================================== */

export const getAIDailyUsageThunk = createAsyncThunk(
  "report/getAIDailyUsage",
  async ({
    date,
    dateFrom,
    dateTo,
  }: {
    date?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
  } = {}) => {
    const response = await communityClient.query({
      query: GET_AI_DAILY_USAGE,
      variables: {
        filter: { date, dateFrom, dateTo },
        page: null,
        size: null,
      },
      fetchPolicy: "network-only",
    });

    return response.data.getAIDailyUsage;
  }
);

/* =====================================================
   THUNK : BROCHURE HISTORY
===================================================== */

export const getBrochureHistoryThunk = createAsyncThunk(
  "report/getBrochureHistory",
  async ({
    page = 0,
    size = 1000,
  }: {
    page?: number;
    size?: number;
  } = {}) => {
    const response = await batchClient.query({
      query: GET_BROCHURE_HISTORY,
      variables: {
        page,
        size,
      },
      fetchPolicy: "network-only",
    });

    return response.data.getBrochureHistory;
  }
);

/* =====================================================
   THUNK : CONTACT INQUIRY
===================================================== */

export const getContactInquiryThunk = createAsyncThunk(
  "report/getContactInquiry",
  async ({
    page = 0,
    size = 1000,
  }: {
    page?: number;
    size?: number;
  } = {}) => {
    const response = await batchClient.query({
      query: GET_CONTACT_INQUIRY,
      variables: {
        page,
        size,
      },
      fetchPolicy: "network-only",
    });

    return response.data.getContactInquiry;
  }
);

/* =====================================================
   THUNK : COURSE LEAD
===================================================== */

export const getCourseLeadThunk = createAsyncThunk(
  "report/getCourseLead",
  async ({
    page = 0,
    size = 1000,
  }: {
    page?: number;
    size?: number;
  } = {}) => {
    const response = await batchClient.query({
      query: GET_COURSE_LEAD,
      variables: {
        page,
        size,
      },
      fetchPolicy: "network-only",
    });

    return response.data.getCourseLead;
  }
);

/* =====================================================
   INTERFACE TYPES
===================================================== */

interface Batch {
  id: string;
  batchStartDate: string;
  batchEndDate: string;
  courseName: string;
  paymentType: string;
  updatedAt: string;
}

interface Learner {
  userId: string;
  userName: string;
  mobileNumber: string | null;
  email: string;
  learnerId: string;
  batch: Batch[];
}

interface LearnersReport {
  success: number;
  message: string;
  count: number;
  data: Learner[];
}

interface TrackDetails {
  cogPercent: number;
  behPercent: number;
  trackStrengthPercent: number;
}

interface TrackResult {
  id: string;
  trackName: string;
  score: number;
  details: TrackDetails;
}

interface AssessmentResult {
  id: string;
  userId: string;
  sessionId: string;
  primaryTrack: string;
  secondaryTrack: string;
  completedAt: string;
  username: string | null;
  mobileNumber: string | null;
  email: string | null;
  fullName: string | null;
  updatedAt: string;
  createdAt: string;
  trackResults: TrackResult[];
}

interface BrochureHistoryItem {
  id: string;
  name: string;
  mobileNumber: string | null;
  email: string;
  batchName: string;
  downloadedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface ContactInquiryItem {
  id: string;
  name: string;
  email: string;
  mobileNo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CourseLeadItem {
  id: string;
  name: string;
  email: string;
  mobileNo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  batchDetails: {
    batchId: string;
    createdAt: string;
    batchName: string;
  }[];
}

interface ReportState {
  learners: LearnersReport | null;
  masterclassLearners: LearnersReport | null;
  dashboardCourseData: any | null;
  dashboardMasterclassData: any | null;
  assessmentResults: AssessmentResult[];
  brochureHistory: BrochureHistoryItem[];
  contactInquiry: ContactInquiryItem[];
  courseLead: CourseLeadItem[];
  aiUsageData: {
    totalAiUsage: number;
    totalAppAiUsage: number;
  } | null;
  count: number;
  masterclassCount: number;
  assessmentCount: number;
  brochureHistoryCount: number;
  contactInquiryCount: number;
  courseLeadCount: number;
  reportPagination: { page: number; size: number; hasMore: boolean };
  masterclassPagination: { page: number; size: number; hasMore: boolean };
  assessmentPagination: { page: number; limit: number; hasMore: boolean };
  loading: boolean;
  error: string | null;
}

/* =====================================================
   INITIAL STATE
===================================================== */

const initialState: ReportState = {
  learners: null,
  masterclassLearners: null,
  dashboardCourseData: null,
  dashboardMasterclassData: null,
  assessmentResults: [],
  brochureHistory: [],
  contactInquiry: [],
  courseLead: [],
  aiUsageData: null,
  count: 0,
  masterclassCount: 0,
  assessmentCount: 0,
  brochureHistoryCount: 0,
  contactInquiryCount: 0,
  courseLeadCount: 0,
  reportPagination: { page: 0, size: 20, hasMore: true },
  masterclassPagination: { page: 0, size: 20, hasMore: true },
  assessmentPagination: { page: 1, limit: 20, hasMore: true },
  loading: false,
  error: null,
};

/* =====================================================
   SLICE
===================================================== */

const reportSlice = createSlice({
  name: "report",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ---- BATCH REPORT ---- */

      .addCase(getLearnersReportThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLearnersReportThunk.fulfilled, (state, action) => {
        state.loading = false;
        const page = action.meta.arg.page;
        const size = action.meta.arg.size;
        const isMasterClass = action.meta.arg.isMasterClass;
        const returnedCount = action.payload.data.length;

        if (isMasterClass) {
          if (page === 0) {
            state.masterclassLearners = action.payload;
          } else if (state.masterclassLearners) {
            const existingIds = new Set(
              state.masterclassLearners.data.map((l) => l.learnerId)
            );
            const newData = action.payload.data.filter(
              (l: any) => !existingIds.has(l.learnerId)
            );
            state.masterclassLearners = {
              ...action.payload,
              data: [...state.masterclassLearners.data, ...newData],
            };
          }
          state.masterclassCount = action.payload.count;
          state.masterclassPagination.page = page;
          state.masterclassPagination.size = size;
          state.masterclassPagination.hasMore = returnedCount === size;
        } else {
          if (page === 0) {
            state.learners = action.payload;
          } else if (state.learners) {
            const existingIds = new Set(
              state.learners.data.map((l) => l.learnerId)
            );
            const newData = action.payload.data.filter(
              (l: any) => !existingIds.has(l.learnerId)
            );
            state.learners = {
              ...action.payload,
              data: [...state.learners.data, ...newData],
            };
          }
          state.count = action.payload.count;
          state.reportPagination.page = page;
          state.reportPagination.size = size;
          state.reportPagination.hasMore = returnedCount === size;
        }
      })
      .addCase(getLearnersReportThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch report";
      })

      /* ---- ASSESSMENT RESULTS ---- */

      .addCase(getAssessmentResultsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAssessmentResultsThunk.fulfilled, (state, action) => {
        state.loading = false;
        const page = action.meta.arg.page;
        const limit = action.meta.arg.limit;
        const returnedCount = action.payload.data.length;

        if (page === 1) {
          // ✅ page 1 always resets (covers filter change + initial load)
          state.assessmentResults = action.payload.data;
        } else {
          const existingIds = new Set(
            state.assessmentResults.map((r) => r.id)
          );
          const newData = action.payload.data.filter(
            (r: any) => !existingIds.has(r.id)
          );
          state.assessmentResults = [...state.assessmentResults, ...newData];
        }

        state.assessmentCount = action.payload.count;
        state.assessmentPagination.page = page;
        state.assessmentPagination.limit = limit;
        state.assessmentPagination.hasMore = returnedCount === limit;
      })
      .addCase(getAssessmentResultsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch assessment results";
      })

      .addCase(getDashboardBatchReportThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardBatchReportThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isMasterClass) {
          state.dashboardMasterclassData = action.payload.data;
        } else {
          state.dashboardCourseData = action.payload.data;
        }
      })
      .addCase(getDashboardBatchReportThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch dashboard report";
      })

      /* ---- AI DAILY USAGE ---- */

      .addCase(getAIDailyUsageThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAIDailyUsageThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.aiUsageData = {
          totalAiUsage: action.payload.totalAiUsage || 0,
          totalAppAiUsage: action.payload.totalAppAiUsage || 0,
        };
      })
      .addCase(getAIDailyUsageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch AI usage data";
      })

      /* ---- BROCHURE HISTORY ---- */

      .addCase(getBrochureHistoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBrochureHistoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.brochureHistory = action.payload.data || [];
        state.brochureHistoryCount = action.payload.count || 0;
      })
      .addCase(getBrochureHistoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch brochure history";
      })

      /* ---- CONTACT INQUIRY ---- */

      .addCase(getContactInquiryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContactInquiryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.contactInquiry = action.payload.data || [];
        state.contactInquiryCount = action.payload.count || 0;
      })
      .addCase(getContactInquiryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch contact inquiry";
      })

      /* ---- COURSE LEAD ---- */

      .addCase(getCourseLeadThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseLeadThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.courseLead = action.payload.data || [];
        state.courseLeadCount = action.payload.count || 0;
      })
      .addCase(getCourseLeadThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch course lead";
      });
  },
});

export default reportSlice.reducer;