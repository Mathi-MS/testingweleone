import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Course } from "../../types/course";
import { DELETE_COURSE, GET_ALL_COURSE, GET_COURSE_BY_ID, GET_ALL_COURSE_CATEGORIES, GET_MICROLEARN_FILTER_DATA } from "../../graphql/queries/courseQueries";
import { mlClient } from "../../graphql/client";

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  courseCategories: { id: string; categoryName: string }[];
  microlearnFilterData: any;
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    page: number;
    hasMore: boolean;
    total?: number;
  };
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  courseCategories: [],
  microlearnFilterData: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 0,
    hasMore: true,
  },
};

// Async thunk for getting microlearn filter data
export const getMicrolearnFilterData = createAsyncThunk(
  "course/getMicrolearnFilterData",
  async ({ page = 0, size = 10 }: { page?: number; size?: number } = {}) => {
    const { data } = await mlClient.query({
      query: GET_MICROLEARN_FILTER_DATA,
      variables: { page, size },
      fetchPolicy: "network-only",
    });
    return (data as any).getMicroLearnFilterData;
  }
);

// Async thunk for getting all course categories
export const getAllCourseCategories = createAsyncThunk(
  "course/getAllCourseCategories",
  async () => {
    const { data } = await mlClient.query({
      query: GET_ALL_COURSE_CATEGORIES,
      fetchPolicy: "network-only",
    });
    return (data as any).getAllCourseCategories;
  }
);

// Async thunk for getting course by ID
export const getCourseById = createAsyncThunk(
  "course/getCourseById",
  async (courseId: string) => {
    const { data } = await mlClient.query({
      query: GET_COURSE_BY_ID,
      variables: { id: courseId },
      fetchPolicy: "network-only",
    });
    return (data as any).getCourseById?.data;
  }
);

// Async thunk for getting all courses
export const getAllCourses = createAsyncThunk(
  "course/getAllCourses",
  async ({ page = 0, size = 10, searchtext = null, coursefilter = null }: { page?: number; size?: number; searchtext?: string | null; coursefilter?: any } = {}) => {
    const { data } = await mlClient.query({
      query: GET_ALL_COURSE,
      variables: { page, size, searchtext, coursefilter },
      fetchPolicy: "network-only",
    });

    const result = (data as any).getAllCourse;
    const total = result.count || 0;
    const hasMore = (page + 1) * size < total;

    return {
      data: result.data || [],
      pagination: {
        page,
        hasMore,
        total,
      },
    };
  }
);

// ✅ Async thunk for creating a course (multipart/form-data)
export const createCourse = createAsyncThunk<
  Course,
  { course: Partial<Course> },
  { rejectValue: string }
>(
  "course/createCourse",
  async ({ course }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Convert JSON to binary Blob
      const courseBlob = new Blob(
        [JSON.stringify(course)],
        { type: "application/json" }
      );

      formData.append("course", courseBlob);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/course/create/course`,
        {
          method: "POST",
          body: formData, // ❌ DO NOT set Content-Type manually
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to create course"
        );
      }

      const data = await response.json();
      return data as Course;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "An error occurred while creating course"
      );
    }
  }
);

// ✅ Async thunk for updating a course (multipart/form-data)
export const updateCourse = createAsyncThunk<
  Course,
  { courseId: string; course: Partial<Course>;  },
  { rejectValue: string }
>(
  "course/updateCourse",
  async ({ courseId, course }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append(
        "course",
        new Blob([JSON.stringify(course)], {
          type: "application/json",
        })
      );

      // if (thumbnailImage) {
      //   formData.append("thumbnailImage", thumbnailImage);
      // }

      formData.append("id", courseId);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/course/update/course`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to update course");
      }

      const data = await response.json();
      return data as Course;
    } catch (error: any) {
      return rejectWithValue(error.message || "An error occurred");
    }
  }
);

// Async thunk for deleting a course
export const deleteCourse = createAsyncThunk(
  "course/deleteCourse",
  async (courseId: string) => {
    const { data } = await mlClient.mutate({
      mutation: DELETE_COURSE,
      variables: { id: courseId },
    });
    return { courseId, success: (data as any).deleteCourse };
  }
);

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    resetCourseStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setCurrentCourse: (state, action: PayloadAction<Course | null>) => {
      state.currentCourse = action.payload;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
   clearCourses: (state) => {
  state.courses = [];
  state.currentCourse = null;
  state.loading = false;
  state.error = null;
  state.pagination = {
    page: 0,
    hasMore: true,
  };
},
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCourses.fulfilled, (state, action) => {
        state.loading = false;
        const currentPage = action.meta.arg?.page || 0;
        
        if (currentPage === 0) {
          state.courses = action.payload.data;
        } else {
          state.courses = [...state.courses, ...action.payload.data];
        }
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch courses";
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.currentCourse = action.payload;
      })
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        createCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.loading = false;
          state.success = true;
          state.courses.push(action.payload);
        }
      )
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        updateCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.loading = false;
          state.success = true;
          state.currentCourse = action.payload;
          const index = state.courses.findIndex(c => c.id === action.payload.id);
          if (index !== -1) {
            state.courses[index] = action.payload;
          }
        }
      )
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.courses = state.courses.filter(c => c.id !== Number(action.payload.courseId));
        if (state.currentCourse?.id === Number(action.payload.courseId)) {
          state.currentCourse = null;
        }
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete course";
      })
      .addCase(getAllCourseCategories.fulfilled, (state, action) => {
        state.courseCategories = action.payload;
      })
      .addCase(getMicrolearnFilterData.fulfilled, (state, action) => {
        state.microlearnFilterData = action.payload;
      });
  },
});

export const { resetCourseStatus, setCurrentCourse, clearCurrentCourse,clearCourses } = courseSlice.actions;
export default courseSlice.reducer;
