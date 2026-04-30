import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../services/api";

// ================== THUNKS ==================

// -------- UPLOAD DOCUMENT --------
export const sessiondocument = createAsyncThunk(
  "document/sessiondocument",
  async (
    {
      id,
      file,
      documentName,
      description,
      isStudentVisible,
    }: {
      id: string;
      file: File;
      documentName: string;
      description: string;
      isStudentVisible: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("documentName", documentName);
      formData.append("isStudentVisible", String(isStudentVisible));
      formData.append("documentDescription", description);
      formData.append("document", file);

      const response = await apiClient.post(
        `/batch/upload_session_document/${id}`,
        formData,
        { sessionId: id }
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// -------- DELETE DOCUMENT --------
export const deleteSessionDocument = createAsyncThunk(
  "document/deleteSessionDocument",
  async (
    {
      sessionId,
      documentId,
    }: { sessionId: string; documentId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.delete(
        `/batch/delete_session_document/${sessionId}?documentId=${documentId}`
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSessionDocument = createAsyncThunk(
  "document/updateSessionDocument",
  async (
    {
      id,
      documentId,
      documentName,
      description,
      isStudentVisible,
      file,
    }: {
      id: string;
      documentId: string;
      documentName: string;
      description: string;
      isStudentVisible: boolean;
      file?: File;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("documentId", documentId);
      formData.append("documentName", documentName);
      formData.append("isStudentVisible", String(isStudentVisible));
      formData.append("documentDescription", description);
      if (file) formData.append("document", file);
 
      const response = await apiClient.post(
        `/batch/upload_session_document/${id}`,
        formData,
        { sessionId: id }
      );
 
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// ================== SLICE ==================

interface SessionDocumentState {
  loading: boolean;
  uploadSuccess: boolean;
  deleteSuccess: boolean;
  error: string | null;
  updateLoading: boolean;
}

const initialState: SessionDocumentState = {
  loading: false,
  uploadSuccess: false,
  deleteSuccess: false,
  updateLoading: false,
  error: null,
};

const sessionDocumentSlice = createSlice({
  name: "sessionDocument",
  initialState,
  reducers: {
    resetSessionDocumentState: (state) => {
      state.loading = false;
      state.uploadSuccess = false;
      state.deleteSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // -------- UPLOAD --------
      .addCase(sessiondocument.pending, (state) => {
        state.loading = true;
        state.uploadSuccess = false;
        state.error = null;
      })
      .addCase(sessiondocument.fulfilled, (state) => {
        state.loading = false;
        state.uploadSuccess = true;
      })
      .addCase(sessiondocument.rejected, (state, action) => {
        state.loading = false;
        state.uploadSuccess = false;
        state.error = action.payload as string;
      })

      // -------- DELETE --------
      .addCase(deleteSessionDocument.pending, (state) => {
        state.loading = true;
        state.deleteSuccess = false;
        state.error = null;
      })
      .addCase(deleteSessionDocument.fulfilled, (state) => {
        state.loading = false;
        state.deleteSuccess = true;
      })
      .addCase(deleteSessionDocument.rejected, (state, action) => {
        state.loading = false;
        state.deleteSuccess = false;
        state.error = action.payload as string;
      })
           .addCase(updateSessionDocument.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateSessionDocument.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateSessionDocument.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSessionDocumentState } =
  sessionDocumentSlice.actions;

export default sessionDocumentSlice.reducer;