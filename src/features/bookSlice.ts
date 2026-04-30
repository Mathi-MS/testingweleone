import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET_ALL_BOOKS, CREATE_BOOK, UPDATE_BOOK, GET_BOOK_BY_ID, DELETE_BOOK } from "../graphql/queries/bookQueries";
import { mlClient } from "../graphql/client";
import { GetBookByIdResponse, UpdateBookParams, UpdateBookResponse } from "../types/book";

/* =======================
   Types
======================= */

export interface Chapter {
  chapterid: string;
  mappedDate: string;
  mappedBy: string | null;
  isActive: boolean;
}

export interface TrainerFeedback {
  trainerId: string;
  feedbackComment: string;
}

export interface Book {
  id: string;
  bookId: string;
  bookTitle: string;
  bookDescription: string;
  recomendedDuration: number;
  chapter: Chapter[];
  trainerFeedback: TrainerFeedback[] | null;
}
//  export interface Book {
//   id: string;
//   bookId: string;
//   bookTitle: string;
//   bookDescription: string;
//   recomendedDuration: number;
//   // trainerFeedback: any[];
//   chapter: any[];
//     trainerFeedback: TrainerFeedback[] | null;
// }


/* ---------- API PARAMS ---------- */

interface FetchBooksParams {
  page: number;
  size: number;
  searchText: string;
  filters?: Record<string, any[]>;
}

/* ---------- CREATE BOOK INPUT ---------- */

interface CreateBookInput {
  bookTitle: string;
  bookDescription: string;
  recomendedDuration?: number;
  chapter: string[];
}

/* ---------- CREATE BOOK RESPONSE ---------- */

interface CreateBookResponse {
  id: string;
  bookId: string;
  bookTitle: string;
  bookDescription: string;
  recomendedDuration?: number;
  chapter: Chapter[];
  trainerFeedback: TrainerFeedback[] | null;
}

/* ---------- STATE ---------- */

// interface BookState {
//   // get all books
//   booklist: Book[];
//   count: number;
//   loading: boolean;
//   error: string | null;
//  // update book
// updateLoading: boolean;
// updateError: string | null;
// updatedBook: UpdateBookResponse | null;
//   singleBookLoading: boolean;
//   singleBookError: string | null;
//   selectedBook: GetBookByIdResponse | null;
//   deleteLoading: boolean;
//   deleteError: string | null;
//   // create book
//   createLoading: boolean;
//   createError: string | null;
//   createdBook: CreateBookResponse | null;
// }

interface BookState {
  booklist: Book[];
  count: number;
  loading: boolean;
  error: string | null;

  bookpagination: {
    page: number;
    size: number;
    hasMore: boolean;
  };

  updateLoading: boolean;
  updateError: string | null;
  updatedBook: UpdateBookResponse | null;

  singleBookLoading: boolean;
  singleBookError: string | null;
  selectedBook: GetBookByIdResponse | null;

  deleteLoading: boolean;
  deleteError: string | null;

  createLoading: boolean;
  createError: string | null;
  createdBook: CreateBookResponse | null;
}

/* =======================
   Async Thunks
======================= */

export const fetchAllBooks = createAsyncThunk(
  "books/fetchAllBooks",
  async (
    { page = 0, size = 20, searchText = "", filters, }: FetchBooksParams,
    { rejectWithValue }
  ) => {
    try {
      // build variables dynamically
      const variables: any = {
        page,
        size,
        // searchText:null,
        bookfilter: filters ?? null,
      };

      if (searchText && searchText.trim() !== "") {
        variables.searchText = searchText;
        console.log("Search text sent to API 👉", searchText);
      }

      const { data } = await mlClient.query({
        query: GET_ALL_BOOKS,
        variables,
        fetchPolicy: "network-only",
      });

      return (data as any).getAllBooks;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch books"
      );
    }
  }
);


export const createBook = createAsyncThunk<
  CreateBookResponse,
  CreateBookInput,
  { rejectValue: string }
>("books/createBook", async (input, { rejectWithValue }) => {
  try {
    const { data } = await mlClient.mutate({
      mutation: CREATE_BOOK,
      variables: { input },
    });

    return (data as any).createBook;
  } catch (error: any) {
    return rejectWithValue(
      error?.message || "Failed to create book"
    );
  }
});

 export const updateBook = createAsyncThunk<
  UpdateBookResponse,
  UpdateBookParams,
  { rejectValue: string }
>(
  "books/updateBook",
  async ({ id, input }, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.mutate({
        mutation: UPDATE_BOOK,
        variables: { id, input },
      });

      return (data as any).updateBook;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to update book"
      );
    }
  }
);



export const fetchBookById = createAsyncThunk<
  GetBookByIdResponse,
  string,
  { rejectValue: string }
>("books/fetchBookById", async (id, { rejectWithValue }) => {
  try {
    const { data } = await mlClient.query({
      query: GET_BOOK_BY_ID,
      variables: { id },
      fetchPolicy: "network-only",
    });

    return (data as any).getBookById?.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.message || "Failed to fetch book details"
    );
  }
});

export const deleteBook = createAsyncThunk<
  string, // return deleted book id
  string, // input id
  { rejectValue: string }
>("books/deleteBook", async (id, { rejectWithValue }) => {
  try {
    const { data } = await mlClient.mutate({
      mutation: DELETE_BOOK,
      variables: { id },
    });

    if ((data as any).deleteBook === true) {
      return id;
    }

    return rejectWithValue("Failed to delete book");
  } catch (error: any) {
    return rejectWithValue(
      error?.message || "Failed to delete book"
    );
  }
});
/* =======================
   Slice
======================= */

// const initialState: BookState = {
//   booklist: [],
//   count: 0,
//   loading: false,
//   error: null,
//   updateLoading: false,
// updateError: null,
// updatedBook: null,
//   singleBookLoading: false,
//   singleBookError: null,
//   selectedBook: null,
//   deleteLoading: false,
//   deleteError: null,
//   createLoading: false,
//   createError: null,
//   createdBook: null,
// };

const initialState: BookState = {
  booklist: [],
  count: 0,
  loading: false,
  error: null,

  bookpagination: {
    page: 0,
    size: 20,
    hasMore: true,
  },

  updateLoading: false,
  updateError: null,
  updatedBook: null,

  singleBookLoading: false,
  singleBookError: null,
  selectedBook: null,

  deleteLoading: false,
  deleteError: null,

  createLoading: false,
  createError: null,
  createdBook: null,
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    resetCreateBookState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createdBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- GET ALL BOOKS ---------- */
      .addCase(fetchAllBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
//     .addCase(fetchAllBooks.fulfilled, (state, action) => {
//   state.loading = false;

//   const page = action.meta.arg.page; // ← GET PAGE NUMBER SENT TO THUNK

//   if (page === 0) {
//     state.booklist = action.payload.data;        // reset
//   } else {
//     state.booklist.push(...action.payload.data); // append
//   }

//   state.count = action.payload.count;
// })
.addCase(fetchAllBooks.fulfilled, (state, action) => {
  state.loading = false;

  const page = action.meta.arg.page;
  const size = action.meta.arg.size;
  const returnedCount = action.payload.data.length;

  if (page === 0) {
    state.booklist = action.payload.data;      // reset list
  } else {
    state.booklist.push(...action.payload.data); // append
  }

  state.count = action.payload.count;

  // update pagination
  state.bookpagination.page = page;
  state.bookpagination.size = size;
  state.bookpagination.hasMore = returnedCount === size; // if less than size → no more data
})


      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ---------- CREATE BOOK ---------- */
      .addCase(createBook.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createdBook = action.payload;

      })
      .addCase(createBook.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload as string;
      })
       .addCase(updateBook.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateBook.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      .addCase(fetchBookById.pending, (state) => {
  state.singleBookLoading = true;
  state.singleBookError = null;
})
.addCase(fetchBookById.fulfilled, (state, action) => {
  state.singleBookLoading = false;
  state.selectedBook = action.payload;
})
.addCase(fetchBookById.rejected, (state, action) => {
  state.singleBookLoading = false;
  state.singleBookError = action.payload as string;
})
.addCase(deleteBook.pending, (state) => {
  state.deleteLoading = true;
  state.deleteError = null;
})
.addCase(deleteBook.fulfilled, (state, action) => {
  state.deleteLoading = false;

  // 🔥 REMOVE BOOK WITHOUT REFRESH
  state.booklist = state.booklist.filter(
    (book) => book.id !== action.payload
  );

  state.count = state.count - 1;
})
.addCase(deleteBook.rejected, (state, action) => {
  state.deleteLoading = false;
  state.deleteError = action.payload as string;
});


      
  },
});

export const { resetCreateBookState } = bookSlice.actions;
export default bookSlice.reducer;
