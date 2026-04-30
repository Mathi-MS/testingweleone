export interface TrainerFilter {
  trainerIds?: string[];
}

export interface Trainer {
  id: string;
  trainerId: string;
  trainerName: string;
  primaryEmail: string;
  primaryMobile: string;
  profilePhotoUrl: string;
  expertiseTags: string[];
  language: string;
}

export interface TrainerState {
  trainers: Trainer[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  modalTrainers: Trainer[];
  modalLoading: boolean;
  modalHasMore: boolean;
  modalCurrentPage: number;
  batchList: any[];
  batchSummary: any;
  batchLoading: boolean;
  assessmentList: any[];
  assessmentLoading: boolean;
  assessmentError: string | null;
  assessmentPagination: {
    page: number;
    size: number;
    hasMore: boolean;
  };
  assessmentById: any;
  assessmentByIdLoading: boolean;
  assessmentByIdError: string | null;
}