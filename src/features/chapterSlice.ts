import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mlClient, userClient } from '../graphql/client';
import { DELETE_CHAPTER, GET_ALL_CHAPTERS, GET_ALL_MAPPED_MODULES, GET_CHAPTER_BY_ID, GET_MICROLEARN_FILTER_DATA, UPDATE_CHAPTER } from '../graphql/queries/chapterQueries';
import { CREATE_CHAPTER,} from '../graphql/mutations/chapterMutations';
// import { mlClient, userClient  } from '../graphql/client';
// import { GET_ALL_CHAPTERS, GET_CHAPTER_BY_ID } from '../graphql/queries/chapterQueries';
// import { CREATE_CHAPTER, UPDATE_CHAPTER } from '../graphql/mutations/chapterMutations';
import { Chapter, ChapterInput } from '../types/chapter';
import { FetchPolicy } from '@apollo/client';


export interface Pagination {
  page: number;
  hasMore: boolean;
  total?: number;
}

interface ChapterState {
  chapters: Chapter[];
  currentChapter: Chapter | null;
  list: any[];
  deleteLoading: boolean;
  deleteError: string | null;
  filteredData:any[] ;
  loading: boolean;
  pagination: Pagination;
  error: string | null;
   // ✅ ADD THIS
  mappedModules: {
    chapter: string[] | null;
    course: string[];
    book: string[];
  };
}
interface GetMappedModulesPayload {
    id: string |  null;
  type: "chapter" | "course" | "book" | "microLearn";
}
interface FetchFilterArgs {
  page?: number;
  size?: number;
  alphabet?: string;
  searchtext?: string;
  filters?: null;
}
interface FetchAllChaptersArgs {
  page?: number;
  size?: number;
  searchtext?: string;
  // filters?:null;
  filters?: Record<string, any[]>; // ✅ correct type

}
interface MappedModulesState {
  chapter: string[] | null;
  course: string[];
  book: string[];
  loading: boolean;
  error: string | null;
}
const initialState: ChapterState = {
  chapters: [],
  currentChapter: null,
  pagination: {
    page: 0,
    hasMore: true
  },
  
    list:[],
  deleteLoading: false,
  deleteError:null,
  filteredData:[],
  loading: false,
  error: null,
   mappedModules: {
    chapter: null,
    course: [],
    book: [],
  },
};





// Async thunks
export const fetchAllChapters = createAsyncThunk(
  'chapters/fetchAll',
  async (
    {
      page = 0,
      size = 20,
      searchtext = '',
      filters,
    }: FetchAllChaptersArgs,
    { rejectWithValue }
  ) => {
    try {
      const { data } = await mlClient.query({
        query: GET_ALL_CHAPTERS,
        variables: {
          page,
          size,
          searchtext,
          chapterfilter: filters ?? null,
        },
        fetchPolicy: 'network-only',
      });

      const response = (data as any).getAllChapter;

      return {
        chapters: response?.data ?? [],
        pagination: {
          page,
          size,
          totalCount: response?.count ?? 0,
          hasMore:
            (page + 1) * size < (response?.count ?? 0),
        },
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.message || 'Failed to fetch chapters'
      );
    }
  }
);



export const fetchChapterById = createAsyncThunk(
  'chapters/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.query({
        query: GET_CHAPTER_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only' as FetchPolicy,
      });
      return (data as any).getChapterById?.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createChapter = createAsyncThunk(
  'chapters/create',
  async (input: ChapterInput, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.mutate({
        mutation: CREATE_CHAPTER,
        variables: { input },
      });
      return (data as any).createChapter;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateChapter = createAsyncThunk(
  'chapters/update',
  async ({ id, input }: { id: string; input: ChapterInput }, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.mutate({
        mutation: UPDATE_CHAPTER,
        variables: { id, input },
      });
      return (data as any).updateChapter;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteChapterThunk = createAsyncThunk<
  string,              // return type (chapterId on success)
  string,              // argument type (chapterId)
  { rejectValue: string }
>(
  "chapters/deleteChapter",
  async (chapterId, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.mutate({
        mutation: DELETE_CHAPTER,
        variables: { id: chapterId.trim() },
      });

      // if (!data?.deleteChapter) {
      //   return rejectWithValue("Failed to delete chapter");
      // }

      return chapterId;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Something went wrong while deleting"
      );
    }
  }
);


export const fetchMicroLearnFilterData = createAsyncThunk(
  "filter/fetchMicroLearnFilterData",
  async (
    { page = 0, size = 20, alphabet, searchtext, filters }: FetchFilterArgs,
    { rejectWithValue }
  ) => {
    try {
      const { data } = await mlClient.query({
        query: GET_MICROLEARN_FILTER_DATA,
        variables: {
          page,
          size,
          alphabet: alphabet ?? null,
          searchtext: searchtext ?? null,
          chapterfilter: filters ?? null,
        },
        fetchPolicy: "no-cache", // IMPORTANT
      });

      return (data as any).getMicroLearnFilterData;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMappedModules = createAsyncThunk(
  "mappedModules/fetchMappedModules",
  async ({ id, type }: GetMappedModulesPayload, { rejectWithValue }) => {
    try {
      const { data } = await mlClient.query({
        query: GET_ALL_MAPPED_MODULES,
        variables: { id, type },
        fetchPolicy: "no-cache",
      });

      return (data as any).getAllMappedModules?.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chapterSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentChapter: (state) => {
      state.currentChapter = null;
    },
    resetList: (state) => {
      state.chapters = [];
      state.pagination = { page: 0, hasMore: true };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all chapters
     .addCase(fetchAllChapters.pending, (state) => {
  state.loading = true;
})

.addCase(fetchAllChapters.fulfilled, (state, action) => {
  state.loading = false;

  const page = action.payload.pagination.page;

  if (page === 0) {
    state.chapters = action.payload.chapters;
  } else {
    state.chapters.push(...action.payload.chapters);
  }

  state.pagination = action.payload.pagination;
})

.addCase(fetchAllChapters.rejected, (state) => {
  state.loading = false;
})

      // Fetch chapter by ID
      .addCase(fetchChapterById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapterById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChapter = action.payload;
      })
      .addCase(fetchChapterById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create chapter
      .addCase(createChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters.push(action.payload);
      })
      .addCase(createChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update chapter
      .addCase(updateChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChapter.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.chapters.findIndex(ch => ch.id === action.payload.id);
        if (index !== -1) {
          state.chapters[index] = action.payload;
        }
        state.currentChapter = action.payload;
      })
      .addCase(updateChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
        .addCase(deleteChapterThunk.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })

      // ✅ Success
      .addCase(deleteChapterThunk.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.list = state.list.filter(
          (item) => item.id !== action.payload
        );
      })

      // ❌ Failed
      .addCase(deleteChapterThunk.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || "Delete failed";
      })
     
      .addCase(fetchMicroLearnFilterData.pending, (state) => {
        state.loading = true
      })
    .addCase(fetchMicroLearnFilterData.fulfilled, (state, action) => {
  state.loading = false;

  const currentPage = action.meta.arg.page || 0;
  const data = action.payload || [];

  if (currentPage === 0) {
    state.filteredData = data;
  } else {
    state.filteredData = [...state.filteredData, ...data];
  }
})

      .addCase(fetchMicroLearnFilterData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch search results'
      })
       .addCase(fetchMappedModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMappedModules.fulfilled, (state, action) => {
        state.loading = false;
       state.mappedModules.chapter = action.payload.chapter;
        state.mappedModules.course = action.payload.course;
        state.mappedModules.book = action.payload.book;
      })
      .addCase(fetchMappedModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
})

export const { clearError, clearCurrentChapter, resetList } = chapterSlice.actions;
export default chapterSlice.reducer;
