import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../services/api";

interface ProfileState {
  loading: boolean;
  error: string | null;
  profileImgUrl: string | null;
}

const initialState: ProfileState = {
  loading: false,
  error: null,
  profileImgUrl: null,
};

export const updateProfileImg = createAsyncThunk(
  "profile/updateProfileImg",
  async (formData: FormData, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const token = state.ar.accessToken;
      const response = await apiClient.post("/login/updateProfileImg", formData, {
        'Authorization': `Bearer ${token}`
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateProfileImg.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileImg.fulfilled, (state, action) => {
        state.loading = false;
        state.profileImgUrl = action.payload.profileImgUrl || action.payload.data?.profileImgUrl;
      })
      .addCase(updateProfileImg.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default profileSlice.reducer;
