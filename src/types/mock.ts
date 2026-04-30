export interface RecommendedCourse {
  course_id: string;
  comments: string;
  recommended_duration: string;
}

export interface TrainingDoc {
  doc_id: string;
  doc_type: string;
  doc_url: string;
}

export interface TrainerFeedback {
  trainer_id: string;
  feedback_datetime: string;
  feedback_comment: string;
}

export interface MLData {
  object_id: string;
  ml_id: string;
  ml_number: string;
  ml_title: string;
  category: string;
  skill_level: string;
  duration: string;
  price: number;
  status: string;
  recomended_courses: RecommendedCourse[];
  training_docs: TrainingDoc[];
  trainer_guide_notes: string;
  trainers_feedback: TrainerFeedback[];
}

export interface Category {
  course_id: string;
  name: string;
}

export interface DocumentType {
  doc_type: string;
  name: string;
}
