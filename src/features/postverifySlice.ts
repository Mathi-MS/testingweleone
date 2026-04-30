import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// import { apolloClient } from "../graphql/client";
import {
  CREATE_CAREER_COMPASS,
  CREATE_ONBOARD_DETAILS,
  GET_ALL_COLLEGES,
  GET_ALL_DEGREES,
  GET_ALL_DISTRICTS,
  GET_ALL_SCHOOLS,
  GET_ALL_SPECIALIZATIONS,
  GET_ALL_UNIVERSITY,
} from "../graphql/queries/postverifyqueries";
import { AuthState } from "../types";
import { District, postverify } from "../types/postverify";
import { authClient } from "../graphql/client";

interface PaginatedList<T> {
  dataList: T[];
  page: number;
  totalPages: number;
}
export interface Degree {
  id: string;
  degreeName: string;
}


interface GetAllDistrictsResponse {
  getAllDistricts: PaginatedList<District>;
}

interface GetuniversityName {
  page: number;
  size: number;
  universityName?: string | null;
}


interface GetCollegesParams {
  universityName?: string;
  page?: number;
  size?: number;
  collegeName?: string;
}

const initialState: postverify = {
  postverify: null,
  // loading: false,
  schoolLoading: false,
  districtLoading: false,
  collegeLoading: false,
  collegeHasNext: true,
  universityHasNext: true,
  universityLoading: false,
  specializations: [],
  specializationHasNext: true,
  specializationLoading: false,
  districts: [],
  schools: [],
  colleges: [],
  universities: [],
  degrees: [],
  degreeLoading: false,
  degreeHasNext: true,
  schoolHasNext: true,
  districtHasNext: true,
  hasNext: true,
  error: null,
  roles: [],
  accessToken: null,
  refreshToken: null,
  hasPrevious: false,
  expiresIn: null,
  tokenType: null,
  scope: null,
  onBoard: false,
  signupMessage: null,
  otpcheck: null,
  createpassword: null,
  resendopt: null,
  forgotPassword: null,
  ResetUserPassword: null,
  data: null,
  districtPagination: {
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 1,
  },
  loginres: false,
  message: null,
  token: null,

};

// district THUNK

// postverifySlice.ts
export interface Specialization {
  id: string;
  specializationName: string;
  degreeName: string;
}

export const getAllSpecializations = createAsyncThunk(
  "postverify/getAllSpecializations",
  async (
    {
      degreeName,
      specializationName,
      page,
      size,
    }: {
      degreeName?: string;
      specializationName?: string;
      page: number;
      size: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await authClient.query({
        query: GET_ALL_SPECIALIZATIONS,
        variables: { degreeName, specializationName, page, size },
      });

      return (data as any).getAllSpecializations;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);


export const getAllDistricts = createAsyncThunk(
  "postverify/getAllDistricts",
  async (
    {
      page,
      size,
      districtName,
    }: { page: number; size: number; districtName?: string },
    thunkAPI
  ) => {
    try {
      const { data } = await authClient.query({
        query: GET_ALL_DISTRICTS,
        variables: { page, size, districtName },
        fetchPolicy: "no-cache",
      });

      return (data as any).getAllDistricts;
    } catch (error: any) {
      console.error("API ERROR:", error); // ← add this to debug
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

//GET_ALL_SCHOOLS
export const getAllSchools = createAsyncThunk(
  "postverify/getAllSchools",
  async (
    {
      page,
      size,
      schoolName,
    }: { page: number; size: number; schoolName?: string },
    thunkAPI
  ) => {
    try {
      const { data } = await authClient.query({
        query: GET_ALL_SCHOOLS,
        variables: { page, size, schoolName },
        fetchPolicy: "no-cache",
      });

      return (data as any).getAllSchools;
    } catch (error: any) {
      console.error("SCHOOL API ERROR:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const createOnboardDetails = createAsyncThunk(
  "postverify/createOnboardDetails",
  async (input: any, thunkAPI) => {
    try {
      const { data } = await authClient.mutate({
        mutation: CREATE_ONBOARD_DETAILS,
        variables: input,
      });

      return (data as any).createOnboardDetails;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// =======================
//    SCHOOL THUNK
// =======================
export const createCareerCompass = createAsyncThunk(
  "postverify/createCareerCompass",
  async (input: any, thunkAPI) => {
    try {
      const { data } = await authClient.mutate({
        mutation: CREATE_CAREER_COMPASS,
        variables: { input },
      });

      return (data as any).createCareerCompass;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// =======================
//    GET ALL UNIVERSITIES
// =======================
export const getAllUniversity = createAsyncThunk(
  "postverify/getAllUniversity",
  async (
    { page, size, universityName }: GetuniversityName,
    { rejectWithValue }
  ) => {
    try {
      const { data } = await authClient.query({
        query: GET_ALL_UNIVERSITY,
        variables: { page, size, universityName },
        fetchPolicy: "no-cache",
      });

      // ✅ FIX HERE
      return (data as any).getAllUniversity;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllColleges = createAsyncThunk(
  "postverify/getAllColleges",
  async (
    { universityName, page = 1, size = 10, collegeName }: GetCollegesParams,
    { rejectWithValue }
  ) => {
    try {
      const { data } = await authClient.query({
        query: GET_ALL_COLLEGES,
        variables: { universityName, page, size, collegeName },
        fetchPolicy: "no-cache",
      });

      return (data as any).getAllColleges
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllDegrees = createAsyncThunk(
  "postverify/getAllDegrees",
  async (
    {
      page,
      size,
      degreeName,
    }: { page: number; size: number; degreeName?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await authClient.query({
        query: GET_ALL_DEGREES,
        variables: { page, size, degreeName },
      });

      return (data as any).getAllDegrees;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// =======================
//    SLICE
// =======================
const authSlice = createSlice({
  name: "postverify",
  initialState,
  reducers: {
    logout: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOnboardDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOnboardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.statusMessage;
      })
      .addCase(createOnboardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCareerCompass.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCareerCompass.fulfilled, (state, action) => {
        state.loading = false;
        state.postverify = action.payload.message;
      })
      .addCase(createCareerCompass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // =======================
      //   GET ALL DISTRICTS
      // =======================
      .addCase(getAllDistricts.pending, (state) => {
        state.districtLoading = true;
      })
      .addCase(getAllDistricts.fulfilled, (state, action) => {
        state.districtLoading = false;

        const { dataList, page, hasNext } = action.payload;

        if (page === 1) {
          state.districts = dataList;
        } else {
          state.districts = [...state.districts, ...dataList];
        }

        state.districtHasNext = hasNext;
      })


      // =======================
      //    GET ALL SCHOOLS
      // =======================

      .addCase(getAllSchools.pending, (state) => {
        state.schoolLoading = true;
      })
      .addCase(getAllSchools.fulfilled, (state, action: any) => {
        state.schoolLoading = false;
        state.schoolHasNext = action.payload.hasNext;
        const { dataList, page } = action.payload;

        if (page === 1) {
          // NEW search → reset list
          state.schools = dataList;
        } else {
          // NEXT PAGE → append
          state.schools = [...state.schools, ...dataList];
        }
      })
      .addCase(getAllSchools.rejected, (state, action) => {
        state.schoolLoading = false;
        state.error = action.payload as string;
      })


      //    GET ALL UNIVERSITIES
      // =======================
      .addCase(getAllUniversity.pending, (state) => {
        state.universityLoading = true;
      })
      .addCase(getAllUniversity.fulfilled, (state, action) => {
        state.universityLoading = false;
        const { dataList, page, hasNext } = action.payload;
        state.universities =
          page === 1 ? dataList : [...state.universities, ...dataList];

        state.universityHasNext = hasNext;
      })
      .addCase(getAllUniversity.rejected, (state, action) => {
        state.universityLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getAllColleges.pending, (state) => {
        state.collegeLoading = true;
        state.error = null;
      })
      .addCase(getAllColleges.fulfilled, (state, action: any) => {
        state.collegeLoading = false;
        const { dataList, page, size, hasNext } = action.payload;
        if (page === 1) {
          state.colleges = dataList;
        } else {
          state.colleges = [...state.colleges, ...dataList];
        }

        state.page = page;
        state.size = size;
        state.collegeHasNext = hasNext;
      })
      .addCase(getAllColleges.rejected, (state, action) => {
        state.collegeLoading = false;
        state.error = action.payload as string;
      })

      .addCase(getAllDegrees.pending, (state) => {
        state.degreeLoading = true;
      })
      .addCase(getAllDegrees.fulfilled, (state, action) => {
        state.degreeLoading = false;
        state.degreeHasNext = action.payload.hasNext;

        if (action.payload.page === 1) {
          state.degrees = action.payload.dataList;
        } else {
          state.degrees.push(...action.payload.dataList);
        }
      })
      .addCase(getAllDegrees.rejected, (state) => {
        state.degreeLoading = false;
      })
      .addCase(getAllSpecializations.pending, (state) => {
        state.specializationLoading = true;
      })
      .addCase(getAllSpecializations.fulfilled, (state, action) => {
        state.specializationLoading = false;
        state.specializationHasNext = action.payload.hasNext;

        if (action.payload.page === 1) {
          state.specializations = action.payload.dataList;
        } else {
          state.specializations.push(...action.payload.dataList);
        }
      })
      .addCase(getAllSpecializations.rejected, (state) => {
        state.specializationLoading = false;
      });


  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
