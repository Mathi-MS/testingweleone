export interface Course {
  id?: number;
  courseTitle?: string;
  courseType?: string | null;
  promotionalContent?: string;
  skillLevel?: string | null;
  language?: string | null;
  skillsGain?: string[];
  whatYouLearn?: string;
  courseDescription?: string;
  books?: string[];
  courseDuration?: string;
  durationType?: string | null;
  startDate?: string;
  endDate?: string;
  title?: string;
  tag?: string;
  img?: string;
  progress?: number;
  sessionsRemaining?: number;
  trainer?: string;
  nextSession?: string;
  price?: string;
  duration?: string;
  btnText?: string;
  description?: string;
}
