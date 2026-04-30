import { useState, useEffect } from "react";
import { X, ChevronRight, RotateCw } from "lucide-react";
import { batchClient } from "../../../../graphql/client";
import {
  GET_QUESTION_BY_QUIZ_ID_QUERY,
  UPDATE_LEARNER_ASSESSMENT_MUTATION,
} from "../../../../graphql/queries/sessionQueries";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../../app/hook";

interface AssessmentQuizProps {
  assessment: any;
  onClose: () => void;
  attemptData?: any;
}

export function AssessmentQuiz({
  assessment,
  onClose,
  attemptData,
}: AssessmentQuizProps) {
  const { sessionId } = useParams();
  const { userDetails } = useAppSelector((state) => state.ar);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<string[][]>([]);
  const [textAnswers, setTextAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
console.log(attemptData,'attemptDataattemptDataattemptData');

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!assessment?.id) return;
      if (attemptData) {
        setQuestions(attemptData.answers);
        setAnswers(
          attemptData.answers.map((ans: any) =>
            Array.isArray(ans.selectedOption) ? ans.selectedOption : (ans.selectedOption ? [ans.selectedOption] : [])
          )
        );
        setShowResults(true);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await batchClient.query({
          query: GET_QUESTION_BY_QUIZ_ID_QUERY,
          variables: { quizId: assessment.id },
          fetchPolicy: "network-only",
        });
        if (res.data?.getQuestionByQuizId?.data) {
          setQuestions(res.data.getQuestionByQuizId.data);
          setAnswers(new Array(res.data.getQuestionByQuizId.data.length).fill([]));
          setTextAnswers(new Array(res.data.getQuestionByQuizId.data.length).fill(""));
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [assessment?.id, attemptData]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white shadow-xl border-l flex items-center justify-center">
        <div className="text-gray-600">Loading questions...</div>
      </div>
    );
  }

  if (!questions.length && !attemptData) {
    return (
      <div className="fixed inset-0 z-50 bg-white shadow-xl border-l flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-2 border-b">
          <h2 className="text-lg font-normal text-gray-900">Assessment</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 px-4">
          <p className="text-center text-sm sm:text-base">
            No questions available for this quiz.
          </p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  // Safe checks with optional chaining
  const isTextQuestion =
    question?.questionType === "TEXT" ||
    question?.answerType === "TEXT" ||
    !question?.options?.length;

  const isMultiSelect =
    (question?.correctOptions?.length ?? 0) > 1 ||
    question?.answerType === "MULTI";

  const toggleOption = (optionId: string) => {
    if (isMultiSelect) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((o) => o !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    const newTextAnswers = [...textAnswers];
    newAnswers[currentQuestion] = selectedOptions;
    newTextAnswers[currentQuestion] = textAnswer;
    setAnswers(newAnswers);
    setTextAnswers(newTextAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptions(answers[currentQuestion + 1] ?? []);
      setTextAnswer(textAnswers[currentQuestion + 1] ?? "");
    }
  };

  const handleFinish = async () => {
    const newAnswers = [...answers];
    const newTextAnswers = [...textAnswers];
    newAnswers[currentQuestion] = selectedOptions;
    newTextAnswers[currentQuestion] = textAnswer;
    setAnswers(newAnswers);
    setTextAnswers(newTextAnswers);

    const answerPayload = newAnswers.map((opts, index) => {
      const q = questions[index];
      const isText = q.questionType === "TEXT" || q.answerType === "TEXT" || !q.options?.length;
      return {
        questionId: q.id,
        selectedOption: isText ? [newTextAnswers[index]] : (opts ?? []),
      };
    });

    try {
      setSubmitting(true);
      await batchClient.mutate({
        mutation: UPDATE_LEARNER_ASSESSMENT_MUTATION,
        variables: {
          learnerId: userDetails?.id,
          batchId: assessment.batchId,
          sessionId: sessionId,
          quizId: assessment.id,
          answer: answerPayload,
        },
      });
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting assessment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const newAnswers = [...answers];
      const newTextAnswers = [...textAnswers];
      newAnswers[currentQuestion] = selectedOptions;
      newTextAnswers[currentQuestion] = textAnswer;
      setAnswers(newAnswers);
      setTextAnswers(newTextAnswers);
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOptions(answers[currentQuestion - 1] ?? []);
      setTextAnswer(textAnswers[currentQuestion - 1] ?? "");
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((opts, index) => {
      if (attemptData) {
        if (questions[index].isCorrect) correct++;
      } else {
        const correctOpts: string[] = questions[index].correctOptions ?? [];
        const selected = opts ?? [];
        if (
          correctOpts.length > 0 &&
          correctOpts.length === selected.length &&
          correctOpts.every((o) => selected.includes(o))
        )
          correct++;
      }
    });
    return correct;
  };

  // ─── Results Screen ───────────────────────────────────────────────────────
  if (showResults) {
    const score = calculateScore();
    return (
      <div className="fixed inset-0 z-50 bg-white shadow-xl border-l flex flex-col">
        <div className="w-full h-screen bg-white shadow-2xl rounded-lg transform transition-transform duration-300 ease-out">
          <div className="flex items-center justify-between p-3 sm:p-2 border-b">
            <h2 className="text-base sm:text-lg font-normal text-gray-900">
              Assessment Results
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-60px)] p-3 sm:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
                <h3 className="text-lg sm:text-2xl font-semibold mb-2">
                  Your Score
                </h3>
                <p className="text-2xl sm:text-4xl font-bold text-green-600">
                  {score} / {questions.length}
                </p>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  {Math.round((score / questions.length) * 100)}% Correct
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {questions.map((q, index) => {
                  const userAnswer = answers[index];
                  const isTextQ =
                    q.questionType === "TEXT" || q.answerType === "TEXT" || !q.options?.length;
                  const correctOpts: string[] = q.correctOptions ?? [];
                  const selectedOpts: string[] = attemptData
                    ? Array.isArray(userAnswer) ? userAnswer : (userAnswer ? [userAnswer] : [])
                    : (userAnswer ?? []);
                  const isCorrect = isTextQ
                    ? false
                    : attemptData
                    ? q.isCorrect
                    : correctOpts.length > 0 &&
                      correctOpts.length === selectedOpts.length &&
                      correctOpts.every((o) => selectedOpts.includes(o));

                  return (
                    <div key={q.id} className="bg-white rounded-xl border p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 flex-1">
                          Q{index + 1}. {q.question}
                        </h4>
                        {isTextQ ? (
                          <span className="text-gray-500 font-medium text-sm flex-shrink-0">
                            Text Answer
                          </span>
                        ) : isCorrect ? (
                          <span className="text-green-600 font-semibold text-sm sm:text-base flex-shrink-0">
                            ✓ Correct
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold text-sm sm:text-base flex-shrink-0">
                            ✗ Wrong
                          </span>
                        )}
                      </div>

                      {isTextQ ? (
                        <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
                          <p className="text-xs text-gray-500 mb-1">Your Answer</p>
                          <p className="text-sm sm:text-base text-gray-800">
                            {textAnswers[index] || (
                              <span className="italic text-gray-400">
                                No answer provided
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(q.options ?? []).map((option: any) => {
                            const isCorrectOpt = correctOpts.includes(option.optionId);
                            const isSelected = selectedOpts.includes(option.optionId);
                            return (
                              <div
                                key={option.optionId}
                                className={`p-3 rounded-lg border-2 ${
                                  isCorrectOpt
                                    ? "border-green-500 bg-green-50"
                                    : isSelected && !isCorrect
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-200"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <span className="text-sm sm:text-base">
                                    {option.optionText}
                                  </span>
                                  {isCorrectOpt && (
                                    <span className="text-green-600 text-xs sm:text-sm flex-shrink-0">
                                      Correct Answer
                                    </span>
                                  )}
                                  {isSelected && !isCorrectOpt && (
                                    <span className="text-red-600 text-xs sm:text-sm flex-shrink-0">
                                      Your Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setSelectedOptions([]);
                  setTextAnswer("");
                  setAnswers(new Array(questions.length).fill([]));
                  setTextAnswers(new Array(questions.length).fill(""));
                }}
                className="flex items-center justify-center mt-4 sm:mt-5 gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors mx-auto text-xs sm:text-sm w-full sm:w-auto"
              >
                <RotateCw className="w-4 h-4" />
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Quiz Screen ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-white shadow-xl border-l flex flex-col">
      <div className="w-full h-screen bg-white shadow-2xl rounded-lg transform transition-transform duration-300 ease-out">
        <div className="flex items-center justify-between p-3 sm:p-2 border-b">
          <h2 className="text-base sm:text-lg font-normal text-gray-900">
            Career Assessment
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-2xl font-medium text-gray-900 mb-2">
                {assessment.title} Course Assessment
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm">
                Test your knowledge on {assessment.topic}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-600">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className="text-xs sm:text-sm text-gray-600">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                {question?.question}
              </h3>

              {/* Multi-select hint */}
              {isMultiSelect && !isTextQuestion && (
                <p className="text-xs text-gray-500 mb-3">
                  Select all that apply
                </p>
              )}

              {/* TEXT answer field */}
              {isTextQuestion ? (
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={5}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm sm:text-base text-gray-800 focus:outline-none focus:border-black resize-none"
                />
                
              ) : (
                /* MCQ / Multi-select options */
                <div className="space-y-2 sm:space-y-3">
                  {(question?.options ?? []).map((option: any) => {
                    const isSelected = selectedOptions.includes(option.optionId);
                    return (
                      <button
                        key={option.optionId}
                        onClick={() => toggleOption(option.optionId)}
                        className={`w-full text-left px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isMultiSelect ? (
                            /* Checkbox */
                            <div
                              className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-black bg-black"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  fill="none"
                                  viewBox="0 0 10 10"
                                >
                                  <path
                                    d="M1.5 5L4 7.5L8.5 2.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          ) : (
                            /* Radio */
                            <div
                              className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "border-black bg-black"
                                  : "border-gray-400 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                          )}
                          <span className="text-sm sm:text-base text-gray-800">
                            {option.optionText}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 text-sm sm:text-base text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors order-2 sm:order-1"
              >
                Previous
              </button>
              <button
                onClick={isLastQuestion ? handleFinish : handleNext}
                disabled={
                  (isTextQuestion
                    ? textAnswer.trim() === ""
                    : selectedOptions.length === 0) || submitting
                }
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 sm:px-5 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 text-sm sm:text-base order-1 sm:order-2"
              >
                <span>
                  {submitting
                    ? "Submitting..."
                    : isLastQuestion
                    ? "Finish"
                    : "Next"}
                </span>
                {!isLastQuestion && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}