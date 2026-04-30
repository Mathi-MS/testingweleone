import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { batchClient } from "../../graphql/client";
import { BATCH_MAPPING_MUTATION } from "../../graphql/queries/coursemappingQueries";


// ------------------------------
// Thunk
// ------------------------------
export const batchMappingThunk = createAsyncThunk(
  "batch/mapping",
  async ({ id, courseId }: { id: string; courseId: string[] }, { rejectWithValue }) => {
    try {
      const res = await batchClient.mutate({
        mutation: BATCH_MAPPING_MUTATION,
        variables: { id, courseId },
      });
      return (res.data as any).batchMapping;
    } catch (err: any) {
      return rejectWithValue(err.message || "Something went wrong");
    }
  }
);

// ------------------------------
// Slice
// ------------------------------
interface BatchState {
  loading: boolean;
  error: string | null;
  data: any;
}

const initialState: BatchState = {
  loading: false,
  error: null,
  data: null,
};

const batchMappingSlice = createSlice({
  name: "batchMapping",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(batchMappingThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchMappingThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        console.log( state.data,' state.data');
        
      })
      .addCase(batchMappingThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default batchMappingSlice.reducer;
