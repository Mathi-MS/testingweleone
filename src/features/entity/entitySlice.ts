import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { entityApi, CreateEntityPayload } from '../../services/entityApi';
import { RootState } from '../../app/store';
import { authClient, masterClient } from '../../graphql/client';
import { GET_ALL_ENTITY, GET_ENTITY_BY_ID, GET_ALL_UNIVERSITY, GET_ALL_COLLEGE, DELETE_ENTITY, GET_ALL_STATE, GET_ALL_DISTRICT, GET_ALL_CITY } from '../../graphql/queries/entityQueries';
import { Login } from '@mui/icons-material';

export interface EntityItem {
  id: string;
  entityId: string;
  entityType: string;
  entityName: string;
  state: string;
  district: string;
  city: string;
  address: string;
  pincode: string;
  // Added fields from view query
  parentEntityId?: string;
  isUniversity?: boolean;
  collegeType?: string;
  universityType?: string;
  adminUser?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
  primaryMobile?: string;
  secondaryMobile?: string;
  logoUrl?: string;
  contactPersonName?: string;
  degrees?: { degreeType: string; departments: string[] }[];
}

export interface UniversityItem {
  universityCode: string;
  universityName: string;
  universityType: string;
  management: string;
  isActive: boolean;
}

export interface CollegeItem {
  collegeCode: string;
  collegeName: string;
  collegeType: string;
  universityCode: string;
  universityName: string;
  universityType: string;
  management: string;
  state: string;
  district: string;
  website: string;
  yearOfEstablishment: string;
  location: string;
  isActive: boolean;
}

export interface StateItem {
  id: string;
  stateName: string;
}

export interface DistrictItem {
  id: string;
  districtName: string;
}

export interface CityItem {
  id: string;
  cityName: string;
}

export interface EntityPagination {
  page: number;
  total: number;
  hasMore: boolean;
}

export interface EntityState {
  list: EntityItem[];
  universities: UniversityItem[];
  universitiesHasNext: boolean;
  colleges: CollegeItem[];
  states: StateItem[];
  districts: DistrictItem[];
  cities: CityItem[];
  selectedEntity: EntityItem | null;
  loading: boolean;
  error: string | null;
  pagination: EntityPagination;
}

const initialState: EntityState = {
  list: [],
  universities: [],
  universitiesHasNext: false,
  colleges: [],
  states: [],
  districts: [],
  cities: [],
  selectedEntity: null,
  loading: false,
  error: null,
  pagination: {
    page: 0,
    total: 0,
    hasMore: false,
  },
};

export const fetchStates = createAsyncThunk(
  'entity/fetchStates',
  async (search: string = '', { getState }) => {
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    const { data } = await masterClient.query({
      query: GET_ALL_STATE,
      variables: { page: 0, size: 100, search },
      context: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
      fetchPolicy: 'network-only',
    });
    return (data as any).getAllState || [];
  }
);

export const fetchDistricts = createAsyncThunk(
  'entity/fetchDistricts',
  async ({ stateName, search = '' }: { stateName: string; search?: string }, { getState }) => {
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    const { data } = await masterClient.query({
      query: GET_ALL_DISTRICT,
      variables: { stateName, page: 0, size: 100, search },
      context: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
      fetchPolicy: 'network-only',
    });
    return (data as any).getAllDistrictByStateName || [];
  }
);

export const fetchCities = createAsyncThunk(
  'entity/fetchCities',
  async ({ districtName, search = '' }: { districtName: string; search?: string }, { getState }) => {
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    const { data } = await masterClient.query({
      query: GET_ALL_CITY,
      variables: { districtName, page: 0, size: 100, search },
      context: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
      fetchPolicy: 'network-only',
    });
    return (data as any).getAllCityByDistrictName || [];
  }
);

export const fetchUniversities = createAsyncThunk(
  'entity/fetchUniversities',
  async ({ page = 0, size = 20, universityName = '' }: { page?: number; size?: number; universityName?: string } = {}, { getState }) => {
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    const { data } = await authClient.query({
      query: GET_ALL_UNIVERSITY,
      variables: { page, size, universityName: universityName || null },
      context: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
      fetchPolicy: 'network-only',
    });
    const result = (data as any).getAllUniversity;
    return { dataList: result?.dataList || [], hasNext: result?.hasNext ?? false, page };
  }
);

export const fetchColleges = createAsyncThunk(
  'entity/fetchColleges',
  async ({ search = '', universityName }: { search?: string; universityName?: string } = {}, { getState }) => {
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    const { data } = await authClient.query({
      query: GET_ALL_COLLEGE,
      variables: { page: 0, size: 20, universityName: universityName || null, collegeName: null },
      context: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
      fetchPolicy: 'network-only',
    });
    return (data as any).getAllColleges?.dataList || [];
  }
);

export const fetchEntityBySearch = createAsyncThunk(
  'entity/fetchBySearch',
  async (params: { page?: number; limit?: number; search?: string }, { getState }) => {
    const { page = 0, limit = 10 } = params;
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    const { data } = await masterClient.query({
      query: GET_ALL_ENTITY,
      variables: { page, size: limit },
      context: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
      fetchPolicy: 'network-only',
    });

    const rawEntities = (data as any).getAllEntity || [];

    const mappedData: EntityItem[] = rawEntities.map((item: any) => ({
      id: item.id,
      entityId: item.entityId,
      entityType: item.entityType,
      entityName: item.entityName,
      state: item.address?.state || '',
      district: '',
      city: item.address?.city || '',
      address: [
        item.address?.doorNo,
        item.address?.building,
        item.address?.street
      ].filter(Boolean).join(', ') || '',
      pincode: item.address?.pincode || '',
    }));

    return {
      data: mappedData,
      pagination: {
        page,
        total: mappedData.length,
        hasMore: mappedData.length === limit,
      },
    };
  }
);

export const createEntity = createAsyncThunk(
  'entity/create',
  async ({ data, logo }: { data: CreateEntityPayload; logo: File }) => {
    console.log('createEntity', logo);
    const response = await entityApi.createEntity(data, logo);
    return response;
  }
);

export const fetchEntityById = createAsyncThunk(
  'entity/fetchById',
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    const { data } = await masterClient.query({
      query: GET_ENTITY_BY_ID,
      variables: { id },
      context: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
      fetchPolicy: 'network-only',
    });

    const entity = (data as any).getEntityById;

    // Map response to EntityItem structure
    return {
      id: entity.id,
      entityId: entity.entityId,
      entityName: entity.entityName,
      entityType: entity.entityType,
      state: entity.state || '',
      district: entity.district || '',
      city: entity.city || '',
      address: entity.address || '',
      pincode: entity.pincode || '',
      parentEntityId: entity.parentEntityId,
      isUniversity: entity.isUniversity,
      collegeType: entity.collegeType,
      universityType: entity.universityType,
      contactPersonName: entity.ContactPersonName,
      adminUser: entity.primaryAdmin,
      primaryEmail: entity.contactEmail,
      secondaryEmail: entity.secondaryEmail,
      primaryMobile: entity.contactPhone,
      secondaryMobile: entity.secondaryMobile,
      logoUrl: entity.logoUrl,
      degrees: entity.degrees,
    } as EntityItem;
  }
);

export const updateEntity = createAsyncThunk(
  'entity/update',
  async ({ id, data, logo }: { id: string; data: CreateEntityPayload; logo?: File }) => {
    const response = await entityApi.updateEntity(id, data, logo);
    return response;
  }
);

export const deleteEntity = createAsyncThunk(
  'entity/delete',
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.ar.accessToken;

    await masterClient.mutate({
      mutation: DELETE_ENTITY,
      variables: { id },
      context: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    });
    return id;
  }
);

const entitySlice = createSlice({
  name: 'entity',
  initialState,
  reducers: {
    clearEntityList: (state) => {
      state.list = [];
      state.pagination = initialState.pagination;
    },
    setEntityError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearSelectedEntity: (state) => {
      state.selectedEntity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntityBySearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntityBySearch.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pagination } = action.payload;

        if (pagination.page === 0) {
          state.list = data;
        } else {
          state.list = [...state.list, ...data];
        }

        state.pagination = pagination;
      })
      .addCase(fetchEntityBySearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entities';
      })
      .addCase(createEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.list = [action.payload, ...state.list];
      })
      .addCase(createEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create entity';
      })
      .addCase(fetchEntityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntityById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEntity = action.payload;
      })
      .addCase(fetchEntityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entity';
      })
      .addCase(updateEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEntity = action.payload;
        const index = state.list.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update entity';
      })
      .addCase(deleteEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(item => item.id !== action.payload);
      })
      .addCase(deleteEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete entity';
      })
      .addCase(fetchUniversities.fulfilled, (state, action) => {
        const { dataList, hasNext, page } = action.payload;
        state.universities = page === 0 ? dataList : [...state.universities, ...dataList];
        state.universitiesHasNext = hasNext;
      })
      .addCase(fetchColleges.fulfilled, (state, action) => {
        state.colleges = action.payload;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
      })
      .addCase(fetchDistricts.fulfilled, (state, action) => {
        state.districts = action.payload;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
      });
  },
});

export const { clearEntityList, setEntityError, clearSelectedEntity } = entitySlice.actions;
export default entitySlice.reducer;