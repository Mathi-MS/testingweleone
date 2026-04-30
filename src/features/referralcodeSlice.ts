import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { batchClient } from "../graphql/client";
import {
  GET_ALL_REFERRALS_QUERY,
  CREATE_REFERRAL_MUTATION,
  GET_REFERRAL_BY_ID,
  DELETE_REFERRAL_MUTATION,
  UPDATE_REFERRAL_MUTATION,
  GET_DISCOUNT_PRICE,
  GET_REFERRALS_CATEGORY,
} from "../graphql/queries/referralcode";

/* ===================== TYPES ===================== */

interface Referral {
  id: string;
  mobileNumber: string;
  mailId: string;
  category: string;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
  expiryDate: string;
  expiryTime: string | null;
  batchName: string | null;
  discountAmount: number | null;
}

interface ReferralState {
  loading: boolean;
  list: Referral[];
  categories: [],
  data: Referral | null;
  selected: Referral | null;
  discountPrice: Referral | null;   // ✅ UPDATED
  error: string | null;
  success: boolean;
  message: string;
  page: number;
  hasMore: boolean;
  total: number;
}

/* ===================== INITIAL STATE ===================== */

const initialState: ReferralState = {
  loading: false,
  list: [],
  categories: [],
  selected: null,
  data: null,
  discountPrice: null,  // ✅ NEW
  error: null,
  success: false,
  message: "",
  page: 0,
  hasMore: true,
  total: 0,
};

/* ===================== THUNKS ===================== */

export const getAllReferralsThunk = createAsyncThunk(
  "referral/getAll",
  async (
    { page = 0, size = 20 }: { page?: number; size?: number },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_ALL_REFERRALS_QUERY,
        variables: { page, size },
        fetchPolicy: "network-only",
      });

      return data.getAllReferrals;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getReferralByIdThunk = createAsyncThunk(
  "referral/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_REFERRAL_BY_ID,
        variables: { id },
        fetchPolicy: "network-only",
      });

      return data.getReferralById.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createReferralThunk = createAsyncThunk(
  "referral/create",
  async (payload: any, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: CREATE_REFERRAL_MUTATION,
        variables: { input: payload },
      });

      const res = data.createReferral;

      if (res.success === 200) return res;
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReferralThunk = createAsyncThunk(
  "referral/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: DELETE_REFERRAL_MUTATION,
        variables: { id },
      });

      return data.deleteReferral;

      // if (res.status === 200) {
      //   return { id, message: res.message };
      // }

      // return rejectWithValue(res.message || "Delete failed");
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const updateReferralThunk = createAsyncThunk(
  "referral/update",
  async ({ id, payload }: any, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: UPDATE_REFERRAL_MUTATION,
        variables: { id, input: payload },
      });

      const res = data.updateReferral;

      if (res.success === 200) return res;
      return rejectWithValue(res.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/* ===== DISCOUNT PRICE ===== */

export const fetchDiscountPrice = createAsyncThunk(
  "referral/fetchDiscountPrice",
  async (
    { batchId, referralCode }: { batchId: string; referralCode: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await batchClient.query({
        query: GET_DISCOUNT_PRICE,
        variables: {
          input: { batchId, referralCode },
        },
        fetchPolicy: "no-cache",
      });

      return data.getDiscountPrice;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getReferralsCategoryThunk = createAsyncThunk(
  "referrals/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.query({
        query: GET_REFERRALS_CATEGORY,
        fetchPolicy: "no-cache",
      });

      return data.gettingrefferalsCategory;
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to fetch referral categories"
      );
    }
  }
);

/* ===================== SLICE ===================== */

const referralSlice = createSlice({
  name: "referral",
  initialState,
  reducers: {
    clearReferral: (state) => {
      state.data = null;
      state.error = null;
      state.success = false;
      state.message = "";
    },
    clearSelectedReferral: (state) => {
      state.selected = null;
    },
    clearDiscount: (state) => {
      state.discountPrice = null; // ✅ helpful
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== GET ALL ===== */
      .addCase(getAllReferralsThunk.pending, (state) => {
        state.loading = true;
      })
     .addCase(getAllReferralsThunk.fulfilled, (state, action) => {
  state.loading = false;

  const incoming = action.payload; // plain array

  if (!Array.isArray(incoming)) {
    state.hasMore = false;
    return;
  }

  // ✅ Replace on page 0, append on page N+1
  if (action.meta.arg.page === 0) {
    state.list = incoming;
  } else {
    state.list = [...state.list, ...incoming];
  }

  // ✅ hasMore = true only if we got a full page
  state.hasMore = incoming.length >= (action.meta.arg.size ?? 20);
  state.page = action.meta.arg.page ?? 0;
  state.total = state.list.length;
})
      .addCase(getAllReferralsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== CREATE ===== */
     .addCase(createReferralThunk.fulfilled, (state, action) => {
  state.success = true;
  state.data = action.payload.data;
  state.message = action.payload.message;

  // ✅ Safety check (VERY IMPORTANT)
  if (!Array.isArray(state.list)) {
    state.list = [];
  }

  state.list.unshift(action.payload.data);
})

      /* ===== GET BY ID ===== */
      .addCase(getReferralByIdThunk.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      /* ===== DELETE ===== */
      .addCase(deleteReferralThunk.fulfilled, (state, action) => {
        state.success = true;
        state.list = state.list.filter(
          (item) => item.id !== action.payload.id
        );
      })

      /* ===== UPDATE ===== */
      .addCase(updateReferralThunk.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.list.findIndex(
          (item) => item.id === updated.id
        );
        if (index !== -1) state.list[index] = updated;
      })

      /* ===== DISCOUNT ===== */
      .addCase(fetchDiscountPrice.pending, (state) => {
        state.loading = true;
        state.discountPrice = null;
      })
     .addCase(fetchDiscountPrice.fulfilled, (state, action) => {
  state.loading = false;
  // action.payload is the full getDiscountPrice response object
  state.discountPrice = action.payload.data; // this is now the Referral object
})
      .addCase(fetchDiscountPrice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getReferralsCategoryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReferralsCategoryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
      })
      .addCase(getReferralsCategoryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearReferral,
  clearSelectedReferral,
  clearDiscount,
} = referralSlice.actions;

export default referralSlice.reducer;