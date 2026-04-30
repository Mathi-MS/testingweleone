export interface RecommendedCourse {
  courseId: string | null;
  comments: string;
}

export interface TrainingDoc {
  docId: string | null;
  docType: string | null;
  docUrl: string | null;
  trainerGuideNotes: string | null;
  isActive?: boolean;
  trainerId?: string;
  feedbackComment?: string;
  filename: string;
}

export interface TrainerFeedback {
  trainerId: string | null;
  feedbackDatetime: string | null;
  feedbackComment: string | null;
}

export interface MLData {
  id?: string;
  microLearnId: string;
  microLearnTitle: string;
  Duration: number;
  category: string | { id: string; categoryName: string };
  subCategory?: (string | { id: string; subCategoryName: string })[];
  fullDescription: string | null;
  shortDescrpition: string;
  status?: string;
  recomendedCourses?: RecommendedCourse[];
  recomendedChapter?: any[];
  trainingDocs?: TrainingDoc[];
  training_docs?: TrainingDoc[];
  trainersFeedback?: TrainerFeedback[];
  skillevel?: string | null;
  pricingType?: string | null;
  fomoMessage?: string | null;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  errormessage?: string | null;
}

export interface Category {
  id: string;
  categoryName: string;
  isActive?: boolean;
  errormessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  id: string;
  subCategoryName: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentType {
  doc_type: string;
  name: string;
}

export interface Filters {
  search: string;
  selectedCategories: string[];
  selectedDocumentTypes: string[];
  durationRange: { from: string; to: string };
}

export interface Pagination {
  page: number;
  hasMore: boolean;
  total?: number;
}

export interface MLState {
  list: MLData[];
  currentML: MLData | null;
  categories: Category[];
  subCategories: SubCategory[];
  documentTypes: DocumentType[];
  filterData: any;
  filters: Filters;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

export interface FetchMLListParams {
  page?: number;
  limit?: number;
  filters?: Partial<Filters>;
}

export interface UpdateMLParams {
  microLearnId: string;
  data: Partial<MLData>;
}

export interface AddDocumentParams {
  ml_id: string;
  file: File;
  trainingnotes: string;
  doc_id?: string;
}

export interface DeleteDocumentParams {
  ml_id: string;
  doc_id: string;
}

export interface BasicDetails {
  title: string;
  description: string;
  duration: string;
  category: string;
  references: string;
}

export interface Document {
  name: string;
  type: string;
  pages?: number;
}

export interface Note {
  id: string;
  content: string;
}

export interface Feedback {
  id: string;
  name: string;
  message: string;
}

export interface FilterConfig {
  key: string;
  title: string;
  type: 'checkbox' | 'range' | 'search';
  dataSource?: string;
  stateKey: string;
  showSelectAll?: boolean;
  collapsible?: boolean;
  maxVisible?: number;
  renderItem?: (item: any) => string;
}

export interface FormData {
  title: string;
  category: { id: string; categoryName: string };
  subCategory: { id: string; subCategoryName: string };
  shortDescription: string;
  duration: number;
}

export type CreatedML = MLData & { id?: string };

export type FilePreviewType = 'image' | 'video' | 'pdf' | 'doc';

export interface PendingDocument {
  id: string;
  file: File;
  notes: string;
  type: FilePreviewType;
}

export type DocumentDeleteTarget = { type: 'pending'; doc: PendingDocument } | { type: 'uploaded'; doc: TrainingDoc };

export interface ValidationErrors {
  [key: string]: string;
}