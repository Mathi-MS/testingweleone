import type { RecommendedCourse, TrainingDoc, TrainerFeedback, MLData, Category, DocumentType } from '../types/mock';

export const mockMLData: MLData[] = [
  {
    object_id: 'obj_001',
    ml_id: 'ML001',
    ml_number: 'MLN001',
    ml_title: 'Introduction to Design Thinking',
    category: 'Design',
    skill_level: 'Beginner',
    duration: '2 hours',
    price: 49.99,
    status: 'Active',
    recomended_courses: [
      {
        course_id: 'course_001',
        comments: 'Excellent foundational course',
        recommended_duration: '12 Hours'
      }
    ],
    training_docs: [
      {
        doc_id: 'doc_001',
        doc_type: 'pdf',
        doc_url: '/documents/introduction.pdf'
      },
      {
        doc_id: 'doc_002',
        doc_type: 'pdf',
        doc_url: '/documents/chapter1.pdf'
      }
    ],
    trainer_guide_notes: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
    trainers_feedback: [
      {
        trainer_id: 'trainer_001',
        feedback_datetime: '2024-01-15T10:30:00Z',
        feedback_comment: 'I never thought online learning could feel this personal and motivating 🔥The career guidance session gave me real clarity on what to learn next🔥'
      },
      {
        trainer_id: 'trainer_002',
        feedback_datetime: '2024-01-14T15:45:00Z',
        feedback_comment: 'Excellent content structure and very engaging delivery. The practical examples really helped understand the concepts.'
      }
    ]
  },
  {
    object_id: 'obj_002',
    ml_id: 'ML002',
    ml_number: 'MLN002',
    ml_title: 'Advanced JavaScript Concepts',
    category: 'Development',
    skill_level: 'Advanced',
    duration: '3 hours',
    price: 79.99,
    status: 'Active',
    recomended_courses: [
      {
        course_id: 'course_002',
        comments: 'Advanced programming concepts',
        recommended_duration: '15 Hours'
      }
    ],
    training_docs: [
      {
        doc_id: 'doc_003',
        doc_type: 'pdf',
        doc_url: '/documents/js_fundamentals.pdf'
      }
    ],
    trainer_guide_notes: 'Advanced JavaScript concepts require solid understanding of fundamentals. Practice with real-world examples is essential for mastery.',
    trainers_feedback: [
      {
        trainer_id: 'trainer_003',
        feedback_datetime: '2024-01-13T09:20:00Z',
        feedback_comment: 'Great explanation of complex topics. The examples were very helpful!'
      }
    ]
  },
  {
    object_id: 'obj_003',
    ml_id: 'ML003',
    ml_number: 'MLN003',
    ml_title: 'Digital Marketing Fundamentals',
    category: 'Marketing',
    skill_level: 'Intermediate',
    duration: '1.5 hours',
    price: 39.99,
    status: 'Draft',
    recomended_courses: [
      {
        course_id: 'course_003',
        comments: 'Marketing basics and strategies',
        recommended_duration: '10 Hours'
      }
    ],
    training_docs: [
      {
        doc_id: 'doc_004',
        doc_type: 'pdf',
        doc_url: '/documents/marketing_basics.pdf'
      }
    ],
    trainer_guide_notes: 'Digital marketing landscape is constantly evolving. Focus on understanding customer behavior and data analytics.',
    trainers_feedback: []
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    object_id: `obj_${String(i + 4).padStart(3, '0')}`,
    ml_id: `ML${String(i + 4).padStart(3, '0')}`,
    ml_number: `MLN${String(i + 4).padStart(3, '0')}`,
    ml_title: `Sample Course ${i + 4}`,
    category: ['Design', 'Development', 'Marketing', 'Business', 'Data Science'][i % 5],
    skill_level: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
    duration: `${1 + (i % 4)}.${(i % 2) * 5} hours`,
    price: 29.99 + (i * 10),
    status: i % 2 === 0 ? 'Active' : 'Draft',
    recomended_courses: [
      {
        course_id: `course_${String(i + 4).padStart(3, '0')}`,
        comments: `Sample course ${i + 4} description`,
        recommended_duration: `${8 + (i % 5)} Hours`
      }
    ],
    training_docs: [],
    trainer_guide_notes: `Sample note for course ${i + 4}`,
    trainers_feedback: []
  }))
]

export const mockCategories: Category[] = [
  { course_id: 'course_design', name: 'Design' },
  { course_id: 'course_development', name: 'Development' },
  { course_id: 'course_marketing', name: 'Marketing' },
  { course_id: 'course_business', name: 'Business' },
  { course_id: 'course_data_science', name: 'Data Science' }
]

export const mockDocumentTypes: DocumentType[] = [
  { doc_type: 'pdf', name: 'PDF' },
  { doc_type: 'slides', name: 'Slides' },
  { doc_type: 'videos', name: 'Videos' },
  { doc_type: 'images', name: 'Images' },
  { doc_type: 'links', name: 'Links' }
]