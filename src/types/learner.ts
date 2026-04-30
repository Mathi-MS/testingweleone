export interface Learner {
  id: string
  learnerId: string
  learnerName: string
  primaryEmail: string
  primaryMobile: string
}

export interface GetAllLearnerResponse {
  success: boolean
  message: string
  count: number
  data: Learner[]
}

export interface ImportLearnerResponse {
  success: number
  message: string
  count: number
  data: {
    totalCount: number
    mappedCount: number
    failedCount: number
    mappedLearners: any[]
    inactiveLearners: any[]
    notFoundLearners: any[]
    alreadyMappedLearners: any[]
  }
}

export interface LearnerState {
  learners: Learner[]
  loading: boolean
  error: string | null
  count: number
  hasMore: boolean
  currentPage: number
  modalLearners: Learner[]
  modalLoading: boolean
  modalHasMore: boolean
  modalCurrentPage: number
  importLoading: boolean
  importResult: ImportLearnerResponse | null
}