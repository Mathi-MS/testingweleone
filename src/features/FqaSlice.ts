import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { batchClient } from "../graphql/client";

import {
  CREATE_FAQ_MUTATION,
  UPDATE_FAQ_MUTATION,
  DELETE_FAQ_MUTATION,
  GET_FAQS_BY_BATCH_ID,
  GET_FAQ_BY_ID, // 👈 added
} from "../graphql/queries/Fqa";

/* ================== TYPES ================== */

interface CreateFaqInput {
  question: string;
  answer: string;
}

interface Faq {
  id: string;
  batchId: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FaqState {
  loading: boolean;
  error: string | null;
  data: Faq[];
  selectedFaq: Faq | null; // 👈 added
  pagination: {
    page: number;
    hasMore: boolean;
  };
}

/* ================== INITIAL STATE ================== */

const initialState: FaqState = {
  loading: false,
  error: null,
  data: [],
  selectedFaq: null, // 👈 added
  pagination: { page: 0, hasMore: true },
};

/* ================== THUNKS ================== */

// CREATE
export const createFaqThunk = createAsyncThunk<
  { success: number; message: string; data: Faq },
  { batchId: string; input: CreateFaqInput | CreateFaqInput[] },
  { rejectValue: string }
>("faq/createFaq", async ({ batchId, input }, { rejectWithValue }) => {
  try {
    const response = await batchClient.mutate({
      mutation: CREATE_FAQ_MUTATION,
      variables: { batchId, input: Array.isArray(input) ? input : [input] },
    });

    return response.data.createFaq;
  } catch (error: any) {
    return rejectWithValue(error.message || "Something went wrong");
  }
});

// UPDATE
export const updateFaqThunk = createAsyncThunk<
  { success: number; message: string; data: Faq },
  { id: string; input: { question: string; answer: string } },
  { rejectValue: string }
>("faq/updateFaq", async ({ id, input }, { rejectWithValue }) => {
  try {
    const response = await batchClient.mutate({
      mutation: UPDATE_FAQ_MUTATION,
      variables: { id, input },
    });
    return response.data.updateFaq;
  } catch (error: any) {
    return rejectWithValue(error.message || "Something went wrong");
  }
});

// DELETE
export const deleteFaqThunk = createAsyncThunk<
  { success: number; message: string; data: Faq },
  { id: any },
  { rejectValue: string }
>("faq/deleteFaq", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await batchClient.mutate({
      mutation: DELETE_FAQ_MUTATION,
      variables: { id },
    });

    return response.data.deleteFaq;
  } catch (error: any) {
    return rejectWithValue(error.message || "Something went wrong");
  }
});

// GET ALL (Pagination)
export const getFaqsByBatchIdThunk = createAsyncThunk<
  { success: number; message: string; count: number; data: Faq[] },
  { batchId: string; page?: number; size?: number },
  { rejectValue: string }
>(
  "faq/getFaqsByBatchId",
  async ({ batchId, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await batchClient.query({
        query: GET_FAQS_BY_BATCH_ID,
        variables: { batchId, page, size },
        fetchPolicy: "no-cache",
      });

      return response.data.getFaqsByBatchId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch FAQs");
    }
  }
);

// GET BY ID 👇 (NEW)
export const getFaqByIdThunk = createAsyncThunk<
  { success: number; message: string; data: Faq },
  { id: string },
  { rejectValue: string }
>("faq/getFaqById", async ({ id }, { rejectWithValue }) => {
  try {
    const response = await batchClient.query({
      query: GET_FAQ_BY_ID,
      variables: { id },
      fetchPolicy: "no-cache",
    });

    return response.data.getFaqById;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch FAQ");
  }
});

/* ================== SLICE ================== */

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {
    clearSelectedFaq: (state) => {
      state.selectedFaq = null; // optional helper
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== CREATE ===== */
      .addCase(createFaqThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFaqThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload.data);
      })
      .addCase(createFaqThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create FAQ";
      })

      /* ===== UPDATE ===== */
      .addCase(updateFaqThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFaqThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateFaqThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update FAQ";
      })

      /* ===== DELETE ===== */
      .addCase(deleteFaqThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFaqThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter(
          (faq) => faq.id !== action.payload.data.id
        );
      })
      .addCase(deleteFaqThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete FAQ";
      })

      /* ===== GET ALL ===== */
      .addCase(getFaqsByBatchIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFaqsByBatchIdThunk.fulfilled, (state, action) => {
        state.loading = false;

        const { page = 0, size = 10 } = action.meta.arg;

        if (page === 0) {
          state.data = action.payload.data;
        } else {
          state.data = [...state.data, ...action.payload.data];
        }

        state.pagination = {
          page,
          hasMore: action.payload.data.length === size,
        };
      })
      .addCase(getFaqsByBatchIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch FAQs";
      })

      /* ===== GET BY ID ===== */
      .addCase(getFaqByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFaqByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFaq = action.payload.data;
      })
      .addCase(getFaqByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch FAQ";
      });
  },
});

/* ================== EXPORTS ================== */

export const { clearSelectedFaq } = faqSlice.actions;

export default faqSlice.reducer;