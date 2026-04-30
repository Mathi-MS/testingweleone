import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GET_ALL_BATCH_MODULES, GET_BATCH_MODULE_BY_ID, UPDATE_BATCH_MODULE_MUTATION, DELETE_BATCH_MODULE_MUTATION } from "../../graphql/queries/batchQueries";
import { batchClient } from "../../graphql/client";

interface ModuleDetail {
  moduleName: string;
  moduleDescription: string;
}

interface BatchModule {
  id: string;
  batchId: string;
  weekName: string;
  moduleId?:string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  moduleDetails: ModuleDetail[];
}

interface BatchModuleState {
  modules: BatchModule[];
  selectedModule: BatchModule | null;
  loading: boolean;
  error: string | null;
}

const initialState: BatchModuleState = {
  modules: [],
  selectedModule: null,
  loading: false,
  error: null,
};

export const fetchBatchModules = createAsyncThunk(
  "batchModule/fetchAll",
  async (batchId: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_ALL_BATCH_MODULES,
        variables: { batchId },
        fetchPolicy: "network-only",
      });
      return data.getAllBatchModules.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBatchModuleById = createAsyncThunk(
  "batchModule/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_BATCH_MODULE_BY_ID,
        variables: { id },
        fetchPolicy: "network-only",
      });
      return data.getBatchModuleById.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBatchModule = createAsyncThunk(
  "batchModule/update",
  async ({ id, input }: { id: string; input: any }, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: UPDATE_BATCH_MODULE_MUTATION,
        variables: { id, input: input.batchModuleInput },
      });
      return data.updateBatchModule;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBatchModule = createAsyncThunk(
  "batchModule/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: DELETE_BATCH_MODULE_MUTATION,
        variables: { id },
      });
      return data.deleteBatchModule;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const batchModuleSlice = createSlice({
  name: "batchModule",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBatchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchBatchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBatchModuleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBatchModuleById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedModule = action.payload;
      })
      .addCase(fetchBatchModuleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBatchModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBatchModule.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateBatchModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBatchModule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBatchModule.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteBatchModule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default batchModuleSlice.reducer;
