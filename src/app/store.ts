import { configureStore } from '@reduxjs/toolkit'
import mlReducer from '../features/microlearning/mlSlice'
import authReducer from '../features/authSlice'
import postverifyReducer from '../features/postverifySlice'
import chapterReducer from '../features/chapterSlice'
import categoryReducer from '../features/categoriesSlice'
import entityReducer from '../features/entity/entitySlice'
import communityReducer from '../features/communitySlice'
import aiChatReducer from '../features/aiChatSlice'
import courseReducer from '../features/course/courseSlice'
import bookReducer from '../features/microlearning/bookSlice'
import { tokenRefreshMiddleware } from '../utils/tokenRefreshMiddleware'
import careerReducer from '../features/careerSlice'
import generaldetailsReducer from '../features/batch/generaldetailsSlice'
import paymentReducer from '../features/batch/paymentSlice'
import batchModuleReducer from '../features/batch/batchModuleSlice'
import sessionReducer from '../features/sessionSlice'
import batchReducer from '../features/batchSlice'
import allBatchesReducer from '../features/allBatchesSlice'
import trainerReducer from '../features/trainerSlice'
import learnerReducer from '../features/learnerSlice'
import profileReducer from '../features/profileSlice'
import learnerBatchesReducer from '../features/learnerBatchesSlice'
import reportReducer from '../features/report/reportSlice'
import referralReducer from '../features/referralcodeSlice'
import quizReducer from "../features/quizSlice"
import fqaReducer from "../features/FqaSlice"

export const store = configureStore({
  reducer: {
    ml: mlReducer,
    ar: authReducer,
    postverify: postverifyReducer,
    chapters: chapterReducer,
    categories: categoryReducer,
    entity: entityReducer,
    community: communityReducer,
    aiChat: aiChatReducer,
    course: courseReducer,
    book: bookReducer,
    career: careerReducer,
    generaldetails: generaldetailsReducer,
    payment: paymentReducer,
    batchModule: batchModuleReducer,
    session: sessionReducer,
    batch: batchReducer,
    allBatches: allBatchesReducer,
    trainer: trainerReducer,
    learner: learnerReducer,
    profile: profileReducer,
    learnerBatches: learnerBatchesReducer,
    report:reportReducer,
    referral:referralReducer,
    quiz:quizReducer,
    fqa:fqaReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


