import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MCQOption {
    id: string;
    text: string;
}

export interface MCQQuestion {
    id: string;
    question: string;
    category: string;
    options: MCQOption[];
}

interface CareerState {
    questions: MCQQuestion[];
    currentQuestionIndex: number;
    userAnswers: Record<string, string>;
    showAssessment: boolean;
    showResults: boolean;
    assessmentResult: any;
    isLoading: boolean;
    warningMessage: string | null;
    warningQuestionId: string | null;
    activeSet: number;
    assessmentTerminated: boolean;
}

const initialState: CareerState = {
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    showAssessment: false,
    showResults: false,
    assessmentResult: null,
    isLoading: false,
    warningMessage: null,
    warningQuestionId: null,
    activeSet: 1,
    assessmentTerminated: false,
};

const careerSlice = createSlice({
    name: 'career',
    initialState,
    reducers: {
        setQuestions: (state, action: PayloadAction<MCQQuestion[]>) => {
            state.questions = action.payload;
        },
        setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
            state.currentQuestionIndex = action.payload;
        },
        setUserAnswer: (state, action: PayloadAction<{ questionId: string; answer: string }>) => {
            state.userAnswers[action.payload.questionId] = action.payload.answer;
        },
        setShowAssessment: (state, action: PayloadAction<boolean>) => {
            state.showAssessment = action.payload;
        },
        setShowResults: (state, action: PayloadAction<boolean>) => {
            state.showResults = action.payload;
        },
        setAssessmentResult: (state, action: PayloadAction<any>) => {
            state.assessmentResult = action.payload;
        },
        setIsLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setWarning: (state, action: PayloadAction<{ message: string | null; questionId: string | null }>) => {
            state.warningMessage = action.payload.message;
            state.warningQuestionId = action.payload.questionId;
        },
        setActiveSet: (state, action: PayloadAction<number>) => {
            state.activeSet = action.payload;
        },
        setAssessmentTerminated: (state, action: PayloadAction<boolean>) => {
            state.assessmentTerminated = action.payload;
        },
        resetAssessment: (state) => {
            state.currentQuestionIndex = 0;
            state.userAnswers = {};
            state.showResults = false;
            state.assessmentResult = null;
            state.warningMessage = null;
            state.warningQuestionId = null;
            state.assessmentTerminated = false;
            // We might want to keep showAssessment false or true depending on UX, usually reset implies starting over or closing.
            // If we want to fully reset including closing the assessment:
            // state.showAssessment = false; 
            // But typically "Retake" just clears answers and results.
        },
        fullReset: (state) => {
            return initialState;
        }
    },
});

export const {
    setQuestions,
    setCurrentQuestionIndex,
    setUserAnswer,
    setShowAssessment,
    setShowResults,
    setAssessmentResult,
    setIsLoading,
    setWarning,
    setActiveSet,
    setAssessmentTerminated,
    resetAssessment,
    fullReset
} = careerSlice.actions;

export default careerSlice.reducer;
