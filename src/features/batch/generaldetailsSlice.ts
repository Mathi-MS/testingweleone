import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { entityApi } from "../../services/entityApi";


// ---------------------------
// ✅ Types
// ---------------------------
export interface CreateBatchPayload {
  batchName: string;
  batchType: string;
  batchStartDate: string;
  batchEndDate: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  minimumMaximumEnrollment: number;
  duration: number;
  timeZone: string;
  sessionStartTime: string;
  sessionEndTime: string;
  batchDays: string[];
    language: string;
  skillsYouGain: string[];
  currentSkillInput: string;
  whatYouLearn:string;
  batchDescription:string;
  certificateFile?: File | null;
  bannerFile?: File | null;
}

export interface BatchResponse {
  success: number;
  message: string;
  data: any;
}

interface BatchState {
  loading: boolean;
  error: string | null;
  batch: BatchResponse | null;
  createbatch:[]
  
}

const initialState: BatchState = {
  loading: false,
  error: null,
  batch: null,
  createbatch:[]
};

// ---------------------------
// ✅ Thunk: createBatch (JSON ONLY)
// ---------------------------
// export const createBatch = createAsyncThunk(
//   "batch/createBatch",
//   async (batchData: any, { rejectWithValue }) => {
//     try {
//       const dayMap: any = {
//         Sun: "SUNDAY",
//         Mon: "MONDAY",
//         Tue: "TUESDAY",
//         Wed: "WEDNESDAY",
//         Thu: "THURSDAY",
//         Fri: "FRIDAY",
//         Sat: "SATURDAY",
//       };

//       const formattedDays = batchData.batchDays.map(
//         (d: string) => dayMap[d] || d
//       );

//       const batchJson = {
//         ...batchData,
//         batchDays: formattedDays,
//       };

//       // Build FormData correctly
//       const formData = new FormData();

//       // IMPORTANT: backend expects "batchJson", not "data"
//       formData.append("data", JSON.stringify(batchJson));

//       // Add files — names must match the backend
//       if (batchData.certificateFile) {
//         formData.append("certificateFile", batchData.certificateFile);
//       }

//       if (batchData.bannerFile) {
//         formData.append("bannerFile", batchData.bannerFile);
//       }
      
      
//         //   return apiClient.post("create_batch", formData);
//       // Send request
//       const response = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/batch/create_batch`,
//         {
//           method: "POST",
//           body: formData, // browser sets headers automatically
//         } 
//       );

//       const json = await response.json();

//       if (!response.ok) {
//         return rejectWithValue(json.message || "Failed to submit batch");
//       }

//       return json;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );

// export const createBatch = createAsyncThunk(
//   "batch/createBatch",
//   async (formData: FormData, { rejectWithValue }) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/batch/create_batch`,
//         { method: "POST", body: formData }
//       );
//       const json = await response.json();
//       if (!response.ok) {
//         return rejectWithValue(json.message || "Failed to submit batch");
//       }
//       return json;
//     } catch (err: any) {
//       return rejectWithValue(err.message || "Something went wrong");
//     }
//   }
// );
export const createBatch = createAsyncThunk(
  "batch/createBatch",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await entityApi.createBatch(formData);

      if (response?.success === false) {
        return rejectWithValue(response.message || "Failed to submit batch");
      }
      console.log(response.data,'response');
      
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// 🔥 UPDATE BATCH API (supports reschedule)
export const updateBatch = createAsyncThunk(
  "batch/updateBatch",
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await entityApi.updateBatch(id, formData);
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);



// ---------------------------
// ✅ Slice: generalDetailsSlice
// ---------------------------
const generalDetailsSlice = createSlice({
  name: "generalDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(createBatch.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(createBatch.fulfilled, (state, action) => {
  state.loading = false;
  state. createbatch= action.payload; // batch data from API

  
})
.addCase(createBatch.rejected, (state, action) => {
  state.loading = false;

  // Use payload if you returned rejectWithValue, else fallback to error.message
  state.error =  action.error.message || "Failed to create batch";
})
      .addCase(updateBatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateBatch.fulfilled, (state, action) => {
        state.loading = false;
        state.batch = action.payload;  // updated data
      })

      .addCase(updateBatch.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to update batch";
      });

  },
});

export default generalDetailsSlice.reducer;
