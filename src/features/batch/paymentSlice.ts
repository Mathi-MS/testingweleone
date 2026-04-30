import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authClient, batchClient } from '../../graphql/client';
import { gql } from '@apollo/client';

const UPDATE_PAYMENT_MUTATION = gql`
  mutation UpdatePayment($batchId: String!, $input: paymentInput) {
    updatePayment(batchId: $batchId, input: $input) {
      success
      message
      count
    }
  }
`;

const GET_SUCCESSFUL_PAYMENTS_BY_USER = gql`
  query GetSuccessfulPaymentsByUser($userId: String!, $page: Int!, $size: Int!) {
    getSuccessfulPaymentsByUser(userId: $userId, page: $page, size: $size) {
      statusCode
      statusMessage
      page
      size
      hasPrevious
      hasNext
      dataList {
        id
        paymentId
        status
        discountType
        discountValue
        price
        batchId
        batchName
        method
        updatedAt
        createdAt
      }
    }
  }
`;

export interface PaymentInput {
  basePrice: number;
  sellingPrice: number;
  discountType: string;
  discountValue: number;
  discountStartDateTime: string;
  discountEndDateTime: string;
  enableUpi: boolean;
  enableCardPayment: boolean;
  enableNetBanking: boolean;
  enableWallet: boolean;
  paymentType:string;
  // enableEmi: boolean;
}

interface PaymentResponse {
  success: number;
  message: string;
  count: number;
}

interface PaymentData {
  id: string;
  paymentId: string;
  status: string;
  discountType: string;
  discountValue: number;
  price: number;
  batchId: string;
  batchName: string;
  method: string;
  createdAt: string;
  updatedAt: string;
}

interface SuccessfulPaymentsResponse {
  statusCode: number;
  statusMessage: string;
  page: number;
  size: number;
  hasPrevious: boolean;
  hasNext: boolean;
  dataList: PaymentData[];
}

interface PaymentState {
  loading: boolean;
  error: string | null;
  response: PaymentResponse | null;
  successfulPayments: PaymentData[];
  successfulPaymentsLoading: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  currentPage: number;
  allPayments: PaymentData[];
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  response: null,
  successfulPayments: [],
  successfulPaymentsLoading: false,
  hasNext: false,
  hasPrevious: false,
  currentPage: 0,
  allPayments: [],
};

export const updatePayment = createAsyncThunk<
  PaymentResponse,
  { batchId: string; input: PaymentInput },
  { rejectValue: string }
>(
  'payment/updatePayment',
  async ({ batchId, input }, { rejectWithValue }) => {
    try {
      const { data } = await batchClient.mutate({
        mutation: UPDATE_PAYMENT_MUTATION,
        variables: { batchId, input },
      });
      return (data as any).updatePayment;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getSuccessfulPaymentsByUser = createAsyncThunk<
  SuccessfulPaymentsResponse,
  { userId: string; page?: number; size?: number },
  { rejectValue: string }
>(
  'payment/getSuccessfulPaymentsByUser',
  async ({ userId, page = 0, size = 6 }, { rejectWithValue }) => {
    try {
      const { data } = await authClient.query({
        query: GET_SUCCESSFUL_PAYMENTS_BY_USER,
        variables: { userId, page, size },
        fetchPolicy: 'network-only',
      });
      return (data as any).getSuccessfulPaymentsByUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResponse: (state) => {
      state.response = null;
    },
    resetPayments: (state) => {
      state.successfulPayments = [];
      state.allPayments = [];
      state.hasNext = false;
      state.hasPrevious = false;
      state.currentPage = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update payment';
      })
      .addCase(getSuccessfulPaymentsByUser.pending, (state) => {
        state.successfulPaymentsLoading = true;
        state.error = null;
      })
      .addCase(getSuccessfulPaymentsByUser.fulfilled, (state, action) => {
        state.successfulPaymentsLoading = false;
        const newData = action.payload.dataList || [];
        state.allPayments = action.meta.arg.page === 1 ? newData : [...state.allPayments, ...newData];
        state.successfulPayments = state.allPayments;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
        state.currentPage = action.payload.page;
      })
      .addCase(getSuccessfulPaymentsByUser.rejected, (state, action) => {
        state.successfulPaymentsLoading = false;
        state.error = action.payload ?? 'Failed to fetch payments';
      });
  },
});

export const { clearError, clearResponse, resetPayments } = paymentSlice.actions;
export default paymentSlice.reducer;