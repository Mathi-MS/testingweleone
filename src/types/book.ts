export interface bookInput {
  bookTitle: string;
  bookDescription: string;
  chapter?: string[];
}
export interface Chapter {
  chapterid: string | null;
  mappedDate: string;
  mappedBy: string | null;
  isActive: boolean;
}
export interface TrainerFeedback {
  trainerId: string;
  feedbackComment: string;
}
export interface Book {
  id: string;
  bookId: string;
  bookTitle: string;
  bookDescription: string;
  recomendedDuration: number;
  chapter: Chapter[];
  trainerFeedback: TrainerFeedback[] | null;
}
export interface GetAllBooksResponse {
  count: number;
  data: Book[];
}

/* ---------- UPDATE BOOK INPUT ---------- */

export interface UpdateBookInput {
  bookId?: string | null;
  bookTitle?: string | null;
  bookDescription?: string | null;
  recomendedDuration?: number;
  chapter?: string[]; // chapter IDs
}

/* ---------- UPDATE BOOK PARAMS ---------- */

export interface UpdateBookParams {
  id: string;
  input: UpdateBookInput;
}

/* ---------- UPDATE BOOK RESPONSE ---------- */

export interface UpdateBookResponse {
  id: string;
  bookId: string | null;
  bookTitle: string | null;
  bookDescription: string | null;
  recomendedDuration: number;
  errormessage: string | null;
  chapter: {
    chapterid: string;
    mappedDate: string;
    mappedBy: string | null;
    isActive: boolean;
  }[];
  trainerFeedback: {
    trainerId: string;
    feedbackComment: string;
  }[] | null;
}
/* ---------- CHAPTER ---------- */
export interface BookChapter {
  chapterid: string;
  mappedDate: string;
  mappedBy: string | null;
  isActive: boolean;
}
/* ---------- GET BOOK BY ID RESPONSE ---------- */
export interface GetBookByIdResponse {
  id: string;
  bookId: string;
  bookTitle: string;
  bookDescription: string;
  recomendedDuration: number;
  chapter: BookChapter[];
}
