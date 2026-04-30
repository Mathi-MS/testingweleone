import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { batchClient } from "../graphql/client";
import { ADD_QUIZ, DELETE_QUIZ, GET_QUESTION_BY_BATCH_ID, GET_QUESTION_BY_SESSION_ID, UPDATE_QUIZ_QUESTION } from "../graphql/queries/AssessmentQueries";


/* =======================
   Thunk
======================= */
export const addQuizQuestionThunk = createAsyncThunk(
  "quiz/addQuizQuestion",
  async (
    {
      batchId,
      sessionId,
      title,
      duration,
      passMark,
      input,
    }: {
      batchId: string;
      sessionId: string;
      title: string;
      duration: number;
      passMark: number;
      input: any[];
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await batchClient.mutate({
        mutation: ADD_QUIZ,          // import this at the top of quizSlice
        variables: {
          batchId,
          sessionId,
          quizInput: { title, duration, passMark },
          input,
        },
      });
      return res.data.addQuizQuestion;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateQuizQuestionThunk = createAsyncThunk(
  "quiz/updateQuizQuestion",
  async (
    {
      sessionId,
      title,
      duration,
      passMark,
      input,
    }: {
      sessionId: string;
      title: string;
      duration: number;
      passMark: number;
      input: any[];
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await batchClient.mutate({
        mutation: UPDATE_QUIZ_QUESTION ,          // import this at the top of quizSlice
        variables: {
          sessionId,
          quizInput: { title, duration, passMark },
          input,
        },
      });
      return res.data.updateQuizQuestion;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getQuestionBySessionThunk = createAsyncThunk(
  "quiz/getQuestionBySession",
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const res = await batchClient.query({
        query: GET_QUESTION_BY_SESSION_ID,
        variables: { sessionId },
        fetchPolicy: "no-cache", // optional but recommended
      });

      return res.data.getQuestionBySessionId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteQuizThunk = createAsyncThunk(
  "quiz/deleteQuiz",
  async (sessionId: string | undefined, { rejectWithValue }) => {
    try {
      const response = await batchClient.mutate({
        mutation: DELETE_QUIZ,
        variables: { sessionId },
      });

      // ✅ return actual payload
      return response.data.deleteQuiz;
    } catch (error: any) {
      return rejectWithValue(error.message || "Delete failed");
    }
  }
);

export const getQuestionByBatchThunk = createAsyncThunk(
  "quiz/getQuestionByBatch",
  async (
    { batchId, page = 0, size = 10 }: { batchId: any; page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await batchClient.query({
        query: GET_QUESTION_BY_BATCH_ID,
        variables: { batchId, page, size },
        fetchPolicy: "no-cache",
      });
      return res.data.getQuestionByBatchId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

/* =======================
   Slice
======================= */
interface QuizState {
  loading: boolean;
  success: boolean;
  error: string | null;
  data: any[];
  quiz: any | null;
  questions: any[];
  count: number;
  message: string;
  batchQuestions: any[];
  batchPagination: { page: number; hasMore: boolean; total: number };
}

const initialState: QuizState = {
  loading: false,
  success: false,
  error: null,
  data: [],
  quiz: null,
  questions: [],
  batchQuestions: [],
  batchPagination: { page: 0, hasMore: true, total: 0 },
  count: 0,
   message: "",
  
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    resetQuizState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.quiz = null;
      state.questions = [];
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addQuizQuestionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuizQuestionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.data = action.payload.data;
      })
      .addCase(addQuizQuestionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
        .addCase(updateQuizQuestionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuizQuestionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success;
        state.data = action.payload.data;
        state.message = action.payload.message;
      })
      .addCase(updateQuizQuestionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
       .addCase(getQuestionBySessionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getQuestionBySessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success === 200;
        const data = action.payload.data;
        state.quiz = { id: data.id, batchId: data.batchId, sessionId: data.sessionId, title: data.title, duration: data.duration, passMark: data.passMark };
        state.questions = data.questions ?? [];
        state.count = action.payload.count;
      })

      .addCase(getQuestionBySessionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteQuizThunk.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.message = "";
      })
      .addCase(deleteQuizThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload.success === 200;
        state.message = action.payload.message;
      })
      .addCase(deleteQuizThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.message = action.payload as string;
      })
      .addCase(getQuestionByBatchThunk.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getQuestionByBatchThunk.fulfilled, (state, action) => {
  state.loading = false;
  state.success = action.payload.success === 200;
  const newData = action.payload.data ?? [];
  const currentPage = action.meta.arg.page ?? 0;
  const pageSize = action.meta.arg.size ?? 10;
  state.batchQuestions = currentPage === 0 ? newData : [...state.batchQuestions, ...newData];
  state.batchPagination = {
    page: currentPage,
    hasMore: newData.length === pageSize,
    total: currentPage === 0 ? newData.length : state.batchQuestions.length,
  };
  state.count = action.payload.count;
  state.message = action.payload.message;
})
.addCase(getQuestionByBatchThunk.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
})
  },
});

export const { resetQuizState } = quizSlice.actions;
export default quizSlice.reducer;