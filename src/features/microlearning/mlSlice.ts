import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { GET_ML_LIST, GET_ML_BY_ID, CREATE_ML, UPDATE_ML, DELETE_MICROLEARN as DELETE_ML, GET_ML_BY_SEARCH, REMOVE_DOCUMENT, GET_ALL_CATEGORIES, GET_ALL_SUBCATEGORIES, UPDATE_GUIDE_NOTES, GET_MICROLEARN_FILTER_DATA } from '../../graphql/queries/mlqueries'
import { mockMLData, mockCategories, mockDocumentTypes } from '../../mocks/mockData'
import type {
  MLData,
  Category,
  SubCategory,
  DocumentType,
  Filters,
  Pagination,
  MLState,
  FetchMLListParams,
  UpdateMLParams,
  AddDocumentParams,
  DeleteDocumentParams,
  TrainingDoc
} from '../../types/ml'
import { mlClient, userClient } from '../../graphql/client';


const API_URL = import.meta.env.VITE_REST_ENDPOINT || '';


// Async thunks
export const fetchSubCategories = createAsyncThunk('ml/fetchSubCategories', async (categoryId?: string) => {
  const { data } = await userClient.query({
    query: GET_ALL_SUBCATEGORIES,
    variables: { id: categoryId || null },
    fetchPolicy: 'network-only'
  })

  return (data as any).getAllSubCategories.data || []
})

export const fetchCategories = createAsyncThunk('ml/fetchCategories', async () => {
  const { data } = await mlClient.query({
    query: GET_ALL_CATEGORIES,
    fetchPolicy: 'network-only'
  })
    
  return (data as any).getAllCategories || []
})

export const fetchMLList = createAsyncThunk('ml/fetchList', async ({ page, limit, filters = {} }: FetchMLListParams = {}) => {
  const { data } = await mlClient.query({
    query: GET_ML_LIST,
    variables: { page, size: limit },
    fetchPolicy: 'network-only'
  })


    const list = (data as any).getAllMicroLearns || [];
    const total = list.length;
    const hasMore = ((page ?? 0) + 1) * (limit ?? 10) < total;

  return {
    
    data: (data as any).getAllMicroLearns,
    pagination: {
      page: page || 0,
      hasMore,
      total
    }
  }
})

export const fetchMLBySearch = createAsyncThunk('ml/fetchBySearch', async ({ page = 0, limit = 10, search = '', filters }: { page?: number, limit?: number, search?: string, filters?: any } = {}) => {
  const { data } = await mlClient.query({
    query: GET_ML_BY_SEARCH,
    variables: { 
      page, 
      size: limit, 
      searchtext: search || null,
      microlearnfilter: filters || null
    },
    fetchPolicy: 'network-only'
  })

  const total = (data as any).getAllMicroLearns.count || 0
  const hasMore = ((page || 0) + 1) * (limit || 10) < total
  
  return {
    data: (data as any).getAllMicroLearns.data,
    pagination: {
      page: page || 0,
      hasMore,
      total
    }
  }
})

export const fetchMLById = createAsyncThunk('ml/fetchById', async (microLearnId: string) => {

  const { data } = await mlClient.query({
    query: GET_ML_BY_ID,
    variables: { id: microLearnId },
    fetchPolicy: 'network-only'
  })
  return (data as any).getMicroLearnById.data
})

export const createML = createAsyncThunk('ml/create', async (mlData: Partial<MLData>) => {

  const { data } = await mlClient.mutate({
    mutation: CREATE_ML,
    variables: { input: mlData }
  })

  const possiblePayload = (data as any)?.createMicroLearn ?? null

  return possiblePayload as MLData
})


export const updateML = createAsyncThunk('ml/update', async ({ microLearnId, data }: { microLearnId: string, data: Partial<MLData> }) => {
  const { data: result } = await mlClient.mutate({
    mutation: UPDATE_ML,
    variables: { id: microLearnId, input: data }
  })
  return (result as any).updateMicroLearn
})

export const addDocument = createAsyncThunk('ml/addDocument', async ({ ml_id, file, trainingnotes, doc_id }: AddDocumentParams) => {
  const payload = new FormData()
  payload.append('id', ml_id)
  payload.append('file', file)
  payload.append('traininguidenotes', trainingnotes || '')
  if (doc_id) {
    payload.append('documentid', doc_id)
  }

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/course/files/upload`, {
    method: 'POST',
    body: payload
  })

  if (!response.ok) {
    throw new Error('Failed to upload document')
  }

  return response.json()
})

export const updateDocumentNotes = createAsyncThunk('ml/updateDocumentNotes', async ({ ml_id, doc_id, trainingnotes }: { ml_id: string, doc_id: string, trainingnotes: string }) => {
  const { data } = await mlClient.mutate({
    mutation: UPDATE_GUIDE_NOTES,
    variables: { microlearnid: ml_id, documentid: doc_id, guidenotes: trainingnotes }
  })

  return (data as any).updateGuideNotes
})

export const deleteDocument = createAsyncThunk('ml/deleteDocument', async ({ ml_id, doc_id }: DeleteDocumentParams) => {
  const { data: response } = await mlClient.mutate({
    mutation: REMOVE_DOCUMENT,
    variables: { microlearnid: ml_id, documentid: doc_id }
  })

  if (!(response as any)?.deleteTrainingDocs) {
    throw new Error('Failed to delete document')
  }

  return { ...(response as any).deleteTrainingDocs, ml_id, doc_id }
})

export const fetchMLFilterData = createAsyncThunk('ml/fetchFilterData', async ({ page, size,filters }: { page?: number, size?: number,   filters?: {
      categoryIds?: string[]
     
    } } = {}) => {
  console.log('fetchMLFilterData called with:', { page, size });
  
  try {
    const { data } = await mlClient.query({
      query: GET_MICROLEARN_FILTER_DATA,
      variables: { page, size,microlearnfilter: filters || null },
      fetchPolicy: 'network-only'
    });
    
    console.log('GraphQL response:', data);
    return (data as any).getMicroLearnFilterData;
  } catch (error) {
    console.error('fetchMLFilterData error:', error);
    throw error;
  }
})

export const deleteML = createAsyncThunk('ml/delete', async (ids: string[]) => {

  await Promise.all(
    ids.map(id => mlClient.mutate({
      mutation: DELETE_ML,
      variables: { id }
    }))
  )
  return ids
})

const initialState: MLState = {
  list: [],
  currentML: null,
  categories: [],
  subCategories: [],
  documentTypes: [],
  filterData: null,
  filters: {
    search: '',
    selectedCategories: [],
    selectedDocumentTypes: [],
    durationRange: { from: '', to: '' }
  },
  pagination: {
    page: 1,
    hasMore: true
  },
  loading: false,
  error: null
}

const mlSlice = createSlice({
  name: 'ml',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setCurrentML: (state, action: PayloadAction<MLData | null>) => {
      state.currentML = action.payload
    },
    clearCurrentML: (state) => {
      state.currentML = null
    },
    updateCurrentML: (state, action: PayloadAction<Partial<MLData>>) => {
      if (state.currentML) {
        state.currentML = { ...state.currentML, ...action.payload }
      }
    },
    resetList: (state) => {
      state.list = []
      state.pagination = { page: 0, hasMore: true }
    },
    removeItems: (state, action: PayloadAction<string[]>) => {
      state.list = state.list.filter(item => !action.payload.includes(item.id!))
    },
    addMLToList: (state, action: PayloadAction<MLData>) => {
      state.list.unshift(action.payload)
      if (state.pagination.total !== undefined) {
        state.pagination.total += 1
      }
    },
    updateMLInList: (state, action: PayloadAction<{ id: string, data: Partial<MLData> }>) => {
      const index = state.list.findIndex(ml => ml.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload.data }
      }
      if (state.currentML?.id === action.payload.id) {
        state.currentML = { ...state.currentML, ...action.payload.data }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMLList.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMLList.fulfilled, (state, action) => {
        state.loading = false  // CRITICAL: Reset loading to false
        const filteredData = action.payload.data.filter((item: any) => item && item.id)
        // Replace data for first page (page 0), append for subsequent pages
        
        if ((action.meta.arg.page || 0) === 0) {
          state.list = filteredData          
        } else {
          state.list = [...state.list, ...filteredData]
        }
        state.pagination = action.payload.pagination
      })
      .addCase(fetchMLList.rejected, (state, action) => {
        state.loading = false  // CRITICAL: Reset loading to false even on error
        state.error = action.error.message || 'Failed to fetch ML list'
      })
      .addCase(fetchMLBySearch.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMLBySearch.fulfilled, (state, action) => {
        state.loading = false
        const filteredData = action.payload.data?.filter((item: any) => item && item.id) || []
        const currentPage = action.meta.arg.page || 0
        
        if (currentPage === 0) {
          state.list = filteredData
        } else {
          state.list = [...state.list, ...filteredData]
        }
        state.pagination = {
          ...action.payload.pagination,
          page: currentPage
        }
      })
      .addCase(fetchMLBySearch.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch search results'
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subCategories = action.payload
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchMLFilterData.pending, (state) => {
        console.log('fetchMLFilterData pending');
      })
      .addCase(fetchMLFilterData.fulfilled, (state, action) => {
        console.log('fetchMLFilterData fulfilled with:', action.payload);
        state.filterData = action.payload
      })
      .addCase(fetchMLFilterData.rejected, (state, action) => {
        console.log('fetchMLFilterData rejected:', action.error);
        state.error = action.error.message || 'Failed to fetch filter data'
      })
      .addCase(fetchMLById.fulfilled, (state, action) => {
        state.currentML = action.payload
      })
      .addCase(createML.fulfilled, (state, action) => {
        // Add new item to the beginning of the list for better UX
        // state.list.unshift(action.payload)
        // Update pagination
        if (state.pagination.total !== undefined) {
          state.pagination.total += 1
        }
      })
      .addCase(updateML.fulfilled, (state, action) => {
        if (action.payload && action.payload.id) {
          // Update in list using id instead of microLearnId
          const index = state.list.findIndex(ml => ml.id === action.payload.id)
          if (index !== -1) {
            state.list[index] = { ...state.list[index], ...action.payload }
          }
          // Update currentML if it matches
          if (state.currentML?.id === action.payload.id) {
            state.currentML = { ...state.currentML, ...action.payload }
          }
        }
      })
      .addCase(addDocument.fulfilled, (state, action) => {
        if (!state.currentML) {
          return
        }
        const matchesMl = state.currentML.microLearnId === action.payload.ml_id || state.currentML.id === action.payload.ml_id
        if (!matchesMl) {
          return
        }
        const camelDocs = state.currentML.trainingDocs
        if (Array.isArray(camelDocs)) {
          state.currentML.trainingDocs = [action.payload.document, ...camelDocs]
        } else {
          state.currentML.trainingDocs = [action.payload.document]
        }
        const snakeDocs = (state.currentML as any).training_docs
        if (Array.isArray(snakeDocs)) {
          (state.currentML as any).training_docs = [action.payload.document, ...snakeDocs]
        } else {
          (state.currentML as any).training_docs = [action.payload.document]
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        if (!state.currentML) {
          return
        }
        const matchesMl = state.currentML.microLearnId === action.payload.ml_id || state.currentML.id === action.payload.ml_id
        if (!matchesMl) {
          return
        }
        const camelDocs = state.currentML.trainingDocs
        if (Array.isArray(camelDocs)) {
          state.currentML.trainingDocs = camelDocs.filter(doc => {
            const docId = doc.docId || (doc as any)?.doc_id || (doc as any)?.trainingDocsdocId
            return docId !== action.payload.doc_id
          })
        }
        const snakeDocs = (state.currentML as any).training_docs
        if (Array.isArray(snakeDocs)) {
          (state.currentML as any).training_docs = snakeDocs.filter((doc: TrainingDoc | any) => {
            const docId = doc.docId || doc.doc_id || doc.trainingDocsdocId
            return docId !== action.payload.doc_id
          })
        }
      })
      .addCase(deleteML.fulfilled, (state, action) => {
        state.list = state.list.filter(item => !action.payload.includes(item.id!))
      })
  }
})

export const { setFilters, setCurrentML, clearCurrentML, updateCurrentML, resetList, removeItems, addMLToList, updateMLInList } = mlSlice.actions
export default mlSlice.reducer