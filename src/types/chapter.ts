export interface MicroLearnItem {
  microlearnId: string;
  mappedDate?: string;
  mappedBy?: string;
  trainerGuideNotes?: string;
  microLearnTitle?: string;
  isActive?: boolean;
}

export interface Chapter {
  id: string;
  chapterId: string;
  chapterTitle: string;
  chapterDescription: string;
  recomendedDuration?: number;
  microLearn?: MicroLearnItem[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  errormessage?: string;
}

export interface ChapterInput {
  chapterTitle: string;
  chapterDescription: string;
  microLearn?: string[];
}