import { configureStore } from '@reduxjs/toolkit'
import mlReducer from '../../../../features/microlearning/mlSlice'

export const createTestStore = (initialState?: any) => {
  return configureStore({
    reducer: mlReducer,
    preloadedState: initialState,
  })
}

export type TestRootState = ReturnType<ReturnType<typeof createTestStore>['getState']>