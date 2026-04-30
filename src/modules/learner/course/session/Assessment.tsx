import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { AssessmentQuiz } from "./AssessmentQuiz";
import { batchClient } from "../../../../graphql/client";
import {
  GET_QUIZ_BY_SESSION_ID_QUERY,
  GET_ASSESSMENT_BY_SESSION_AND_LEARNER_QUERY,
} from "../../../../graphql/queries/sessionQueries";
import { useParams } from "react-router-dom";
import { useAppSelector } from "../../../../app/hook";
import { TrainerAssessment } from "./common/TrainerAssessment";

interface AssessmentProps {
  testStats: { completed: number; averageScore: number };
  assessments: any[];
}

export function Assessment({ testStats, assessments }: AssessmentProps) {
  const { sessionId } = useParams();
  const { userDetails } = useAppSelector((state) => state.ar);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const assessment = assessments[0];
    const ROLE_TRAINER = userDetails?.roles?.some(
    (role: string) => role.toUpperCase() === "ROLE_TRAINER",
  );
  const fetchAttempts = async () => {
    if (!sessionId || !userDetails?.id || !quizData?.id) return;
    try {
      const attemptsRes = await batchClient.query({
        query: GET_ASSESSMENT_BY_SESSION_AND_LEARNER_QUERY,
        variables: {
          sessionId,
          learnerId: userDetails.id,
          quizId: quizData.id,
        },
        fetchPolicy: "network-only",
      });
      if (
        attemptsRes.data?.getAssessmentBySessionIdAndLearnerId?.data?.[0]
          ?.assessmentAttempts
      ) {
        setAttempts(
          attemptsRes.data.getAssessmentBySessionIdAndLearnerId.data[0]
            .assessmentAttempts,
        );
      }
    } catch (error) {
      console.error("Error fetching attempts:", error);
    }
  };
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        // Clear previous data when session changes
        setQuizData(null);
        setAttempts([]);
        setSelectedAssessment(null);
        setSelectedAttempt(null);
        
        const res = await batchClient.query({
          query: GET_QUIZ_BY_SESSION_ID_QUERY,
          variables: { sessionId },
          fetchPolicy: "network-only",
        });
        if (res.data?.getQuizBySessionId?.data?.[0]) {
          const quiz = res.data.getQuizBySessionId.data[0];
          setQuizData(quiz);

          if (userDetails?.id) {
            const attemptsRes = await batchClient.query({
              query: GET_ASSESSMENT_BY_SESSION_AND_LEARNER_QUERY,
              variables: {
                sessionId,
                learnerId: userDetails.id,
                quizId: quiz.id,
              },
              fetchPolicy: "network-only",
            });
            if (
              attemptsRes.data?.getAssessmentBySessionIdAndLearnerId?.data?.[0]
                ?.assessmentAttempts
            ) {
              setAttempts(
                attemptsRes.data.getAssessmentBySessionIdAndLearnerId.data[0]
                  .assessmentAttempts,
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [sessionId, userDetails?.id]);

  return (
    ROLE_TRAINER ?  (<TrainerAssessment />
) :  (
    <div className="pb-8">
      <div className="mb-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          See how you are doing in this session.
        </h2>
        <p className="text-gray-600 mb-2">
          Each test you take shows how much you've learned so far.
        </p>
        <p className="text-gray-600 text-sm leading-relaxed">
          Use your results to understand your strengths and improve step by
          step.
        </p>
      </div>
      {attempts.length > 0 && (
        <>
          <div className="flex gap-4 mb-2">
            <div className="space-x-2">
              <span className="text-xl font-bold text-gray-900">
                {attempts.length}
              </span>
              <span className="text-sm text-gray-600">Tests Completed</span>
            </div>
            <div className="space-x-2">
              <span className="text-xl font-bold text-green-600">
                {Math.round(
                  attempts.reduce((sum, a) => {
                    const correctAnswers = a.answers?.filter((ans: any) => ans.isCorrect).length || a.scoredMarks;
                    const totalQuestions = a.answers?.length || a.totalMarks;
                    const percentage = (correctAnswers / totalQuestions) * 100;
                    return sum + percentage;
                  }, 0) / attempts.length,
                )}
                %
              </span>
              <span className="text-sm text-gray-600">Average Score</span>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-gray-600 text-sm">
              Keep going — you're learning well and moving in the right
              direction.
            </p>
          </div>
        </>
      )}
      {quizData ? (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm sm:text-md font-medium text-gray-900 truncate">
                      {quizData?.title ||
                        assessment?.title ||
                        "Session Assessment"}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {assessment?.topic || "Test your knowledge"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto sm:ml-6">
                <button
                  onClick={() => setSelectedAssessment(quizData || assessment)}
                  disabled={loading || !quizData}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 text-green-600 rounded-full border border-[#00BF53] transition-colors text-xs font-medium disabled:opacity-50"
                >
                  {loading
                    ? "Loading..."
                    : quizData
                      ? "Start Test"
                      : "No Assessment"}
                </button>
              </div>
            </div>
          </div>
          {attempts && attempts.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">
                Previous Attempts
              </h3>
              <div className="space-y-2">
                {attempts.map((attempt: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAttempt(attempt)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          Attempt {attempts.length - index}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-xs sm:text-sm font-semibold ${attempt.percentage <= 75 ? "text-red-600" : "text-green-900"}`}
                        >
                          {attempt.answers?.length ? Math.round(((attempt.answers.filter((ans: any) => ans.isCorrect).length) / attempt.answers.length) * 100) : attempt.percentage}%
                        </p>
                        <p className="text-xs text-gray-600">
                          {attempt.answers ? attempt.answers.filter((ans: any) => ans.isCorrect).length : attempt.scoredMarks}/{attempt.answers?.length || attempt.totalMarks} correct
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <ClipboardList className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-xs sm:text-sm px-4">
            No assessments available for this session yet.
          </p>
        </div>
      )}

      {selectedAssessment && (
        <AssessmentQuiz
          assessment={selectedAssessment}
          onClose={() => {
            setSelectedAssessment(null);
            fetchAttempts();
          }}
        />
      )}

      {selectedAttempt && (
        <AssessmentQuiz
          assessment={quizData}
          attemptData={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </div>)
  )
}