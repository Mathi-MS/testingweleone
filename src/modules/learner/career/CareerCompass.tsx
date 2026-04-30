import {
  ArrowUp,
  CheckCircle,
  Compass,
  Mic,
  MoreHorizontal,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReportURL from "../../../assets/document/cc.pdf";
import { AuthModal } from "../../auth/auth-modal";
import { OnboardingModal } from "../postverify/OnboardingModal";
import {
  setUserAnswer,
  setShowAssessment,
  setCurrentQuestionIndex,
  setAssessmentTerminated,
  resetAssessment,
  setWarning,
  MCQQuestion,
  fullReset,
  setActiveSet
} from "../../../features/careerSlice";
import { toast } from "react-toastify";
import { socketService } from "../../../services/socketService";
import { AuthHeaderControls } from "../../../components/auth/AuthHeaderControls";
import { AIMessage } from "../../../services/aiApi";

const questionSets = [
  {
    id: 1,
    title: "Level 1: Cognitive",
    shortTitle: "L1: Cognitive",
    category: "cognitive",
    description: "We are starting by mapping your mental wiring.\nYou will face a mix of everyday moments and abstract scenarios—from cooking dinner to wild hypotheticals. Don't hunt for a hidden pattern or logic. Just read the prompt and capture your raw, immediate reaction to the world around you."
  },
  {
    id: 2,
    title: "Level 2: Behavioural",
    shortTitle: "L2: Behavioural2",
    category: "behavioral",
    description: "Now, let's define your operating style.\nThis level explores your habits, your social battery, and your work vibe. Whether you love rules or break them, prefer the spotlight or the background—there is no wrong answer here. Just tell us where you feel most in your element."
  },
  {
    id: 3,
    title: "Level 3: Strength",
    shortTitle: "L3: Strength",
    category: "track",
    description: "The final stretch measures your natural skills.\nWe are dropping you into real-world dilemmas—bottlenecks, trade-offs, and chaos. Forget the \"textbook\" solution. Step into the scene, assess the problem, and pick the move that feels like the smartest way to get the job done."
  },
];

const COMPLETION_MESSAGES = [
  {
    level1_2: {
      appreciation: "Nice work! 👏 Your thinking patterns and decision approach are captured.",
      positiveStart: "Let's explore how you respond, interact, and handle situations."
    },
    level2_3: {
      appreciation: "Great going! 👏 Your behavioural traits are clearly identified.",
      positiveStart: "Next section highlights the abilities that make you stand out."
    },
    level3_final: {
      appreciation: "Well done! 👏 Your core strengths have been successfully recorded.",
      beforeResult: "🎉 Awesome! Your Career Compass results are displayed below."
    }
  },
  {
    level1_2: {
      appreciation: "Strong start! 👏 You've revealed how your mind works.",
      positiveStart: "Next let's see how you show up in real-life situations."
    },
    level2_3: {
      appreciation: "Great job! 👏 Your work style and responses are well understood.",
      positiveStart: "Next Get ready to uncover what you naturally excel at."
    },
    level3_final: {
      appreciation: "Fantastic! 👏 Your strengths are locked in.",
      beforeResult: "🚀 You're all set! Your personalized Career Compass insights are ready below."
    }
  },
  {
    level1_2: {
      appreciation: "Thank you. 👏 Your cognitive approach has been carefully assessed.",
      positiveStart: "Next section focuses on your behavioural tendencies and work style."
    },
    level2_3: {
      appreciation: "Assessment complete. 👏 Your behavioural patterns are well noted.",
      positiveStart: "Next Let's identify the strengths that define your potential."
    },
    level3_final: {
      appreciation: "Assessment complete. 👏 Your strengths have been successfully captured.",
      beforeResult: "✨ Your Career Compass assessment is complete. Results are shown below."
    }
  }
];

export function CareerCompass() {
  const dispatch = useDispatch();
  const {
    questions,
    currentQuestionIndex,
    userAnswers,
    showAssessment,
    showResults,
    assessmentResult,
    warningMessage,
    warningQuestionId,
    activeSet,
    assessmentTerminated
  } = useSelector((state: any) => state.career);

  const { userDetails, onBoard, accessToken } = useSelector((state: any) => state.ar);
  // Use userDetails.id from Redux, fallback to a default if not fully initialized yet
  const userId = userDetails?.id;

  // Verify socket connection
  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);
    }
  }, [accessToken]);

  // Reset state on mount and unmount
  useEffect(() => {
    dispatch(fullReset());
    return () => {
      dispatch(fullReset());
    };
  }, [dispatch]);

  // Local state for Chat
  const [chatInput, setChatInput] = useState("");
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "ai"; content: string }>
  >([]);
  const [isChatLoading, setIsChatLoading] = useState(false); // Renamed to distinctive

  // Refs
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentQuestionRef = useRef<HTMLDivElement | null>(null);

  // UI State
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [wordingSetIndex, setWordingSetIndex] = useState(0);

  // Constants
  const fullContent = `Welcome to the Career Compass

🎯 Stop Guessing Your Future. The IT world is vast—from Coding to Design, Data to Management. Where do you actually fit?

💡 What comes easily to you often feels hard for others. That's usually where your real strength lies.

The Career Compass is a 3-level assessment analyzing How You Think 🧠, How You Act ⚡, and Your Natural Strengths 💪 to reveal the IT Career Tracks where you'll naturally thrive.

✨ No random suggestions. No bias. Just a clear, personalized map pointing you to your ideal path.

HOW TO PLAY
✅ DO:

**Be Real:** Choose your truth, not the "correct" truth.
**Trust Your Gut:** Your first instinct is usually right. Click it.

❌ DON'T:

**Don't Filter:** Share your true style, not the 'perfect' style.
**Don't Overthink:** Staring too long means you're analyzing, not answering.`;

  const handleStartAssessment = () => {
    if (!userId) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!onBoard) {
      setIsOnboardingModalOpen(true);
      return;
    }
    socketService.startAssessment(userId);
  };

  // Close onboarding modal when onBoard status changes to true
  useEffect(() => {
    if (onBoard && isOnboardingModalOpen) {
      setIsOnboardingModalOpen(false);
    }
  }, [onBoard, isOnboardingModalOpen]);

  // Randomize wording set on mount
  useEffect(() => {
    setWordingSetIndex(Math.floor(Math.random() * COMPLETION_MESSAGES.length));
  }, []);

  // Typewriter effect
  useEffect(() => {
    setDisplayedContent(fullContent);
    setIsTyping(false);
  }, []);

  // Update active set based on scroll
  useEffect(() => {
    if (!showAssessment) return;

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollPosition = container.scrollTop + 200;

      for (let i = questionSets.length - 1; i >= 0; i--) {
        const set = questionSets[i];
        const firstIndex = questions.findIndex((q: MCQQuestion) => q.category === set.category);
        if (firstIndex === -1) continue;

        const firstQuestionRef = questionRefs.current[firstIndex];
        if (firstQuestionRef && firstQuestionRef.offsetTop <= scrollPosition) {
          dispatch(setActiveSet(set.id));
          break;
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [showAssessment, questions, dispatch]);

  const handleAnswerSelect = (questionId: string, optionText: string) => {
    const alreadyAnswered = userAnswers[questionId];
    dispatch(setUserAnswer({ questionId, answer: optionText }));

    if (warningQuestionId === questionId) {
      dispatch(setWarning({ message: null, questionId: null }));
    }

    if (alreadyAnswered) return;

    const question = questions.find((q: MCQQuestion) => q.id === questionId);
    if (!question) return;

    const option = question.options.find((o: any) => o.text === optionText);
    if (option) {
      // Store the questionId being submitted in sessionStorage for tracking
      sessionStorage.setItem('lastSubmittedQuestionId', questionId);
      socketService.submitAnswer(userId, questionId, option.id);
      
      // Immediately advance to next question (optimistic update)
      const currentIndex = questions.findIndex((q: MCQQuestion) => q.id === questionId);
      if (currentIndex !== -1 && currentIndex < questions.length - 1) {
        setTimeout(() => {
          dispatch(setCurrentQuestionIndex(currentIndex + 1));
          
          // Update active set based on next question's category
          const nextQuestion = questions[currentIndex + 1];
          if (nextQuestion) {
            const categoryToSetId: Record<string, number> = {
              cognitive: 1,
              behavioral: 2,
              track: 3,
            };
            if (categoryToSetId[nextQuestion.category]) {
              dispatch(setActiveSet(categoryToSetId[nextQuestion.category]));
            }
          }
        }, 300);
      }
    }
  };

  // Scroll current question into view
  useEffect(() => {
    if (currentQuestionRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        currentQuestionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [currentQuestionIndex]);

  // Auto-scroll to results
  useEffect(() => {
    if (showResults) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [showResults]);

  // Auto-scroll to warning
  useEffect(() => {
    if (warningMessage && warningQuestionId) {
      setTimeout(() => {
        const warningQuestionIndex = questions.findIndex((q: MCQQuestion) => q.id === warningQuestionId);
        
        if (warningQuestionIndex !== -1 && warningQuestionIndex <= currentQuestionIndex) {
          const questionGap = currentQuestionIndex - warningQuestionIndex;
          
          if (questionGap <= 2) {
            const warningQuestionElement = questionRefs.current[warningQuestionIndex];
            if (warningQuestionElement) {
              warningQuestionElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }
        }
      }, 100);
    }
  }, [warningMessage, warningQuestionId, questions, currentQuestionIndex]);


  const getCategoryStats = (category: string) => {
    const categoryQuestions = questions.filter((q: MCQQuestion) => q.category === category);
    const total = categoryQuestions.length;
    let completed = 0;
    categoryQuestions.forEach((q: MCQQuestion) => {
      if (userAnswers[q.id]) completed++;
    });
    return { completed, total };
  };

  const submitAssessment = () => {
    if (Object.keys(userAnswers).length === questions.length) {
      socketService.endAssessment(userId);
    } else {
      toast.error("Please answer all questions before submitting.");
    }
  };

  const handleWarningConfirm = async () => {
    dispatch(setAssessmentTerminated(true));
    setShowWarningPopup(false);

    // Continue with chat
    const userMessage = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setChatInput("");
    setIsChatLoading(true);

    setChatMessages((prev) => [...prev, { role: "ai", content: "" }]);
    setIsChatLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 mb-14">
      <div className="flex-1 flex overflow-hidden">
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto bg-white transition-all duration-300 px-4 py-3`}
        >
          <div
            className={`${showAssessment ? "max-w-4xl" : "max-w-3xl"
              } mx-auto flex md:flex-row flex-col relative`}
          >
            <div className="overflow-y-auto md:max-h-[calc(100vh-140px)] scrollbar-hide">
              {isChatLoading && (
                <div className="flex items-start space-x-3 mb-6">
                  <div className="flex-1">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div className="">
                <div className="flex flex-col items-center space-x-3">
                  {/* WELCOME MESSAGE */}
                  <div
                    className="flex flex-col items-start space-y-3 md:pt-3 pl-3 pr-[30px]"
                    id="welcome-text"
                  >
                    <p className="text-gray-800 flex flex-col mb-3 ">
                      <span className="text-center flex items-center font-semibold text-md px-0">
                        {displayedContent.split("\n")[0]}
                        {displayedContent.length < fullContent.length &&
                          displayedContent.split("\n").length === 1 && (
                            <span className="inline-block w-4 h-4 bg-gray-400 rounded-full ml-1 animate-pulse self-center"></span>
                          )}
                      </span>
                    </p>
                    {displayedContent
                      .split("\n")
                      .slice(1)
                      .map(
                        (line, index) =>
                          line && (
                            <p
                              key={index + 1}
                              className={`text-gray-800 ${
                                // Section headers
                                line.startsWith("✅") ||
                                  line.startsWith("❌") ||
                                  line.startsWith("**HOW TO PLAY**")
                                  ? "font-bold text-md mt-6"
                                  :
                                  line.startsWith("🚫") ||
                                    line.startsWith("🧭") ||
                                    line.startsWith("✨")
                                    ? "text-base mt-2"
                                    : "mt-2"
                                }`}
                            >
                              <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>') }} />
                              {index ===
                                displayedContent.split("\n").slice(1).length -
                                1 &&
                                displayedContent.length <
                                fullContent.length && (
                                  <span className="inline-block w-4 h-4 bg-gray-400 rounded-full ml-1 animate-pulse"></span>
                                )}
                            </p>
                          )
                      )}
                  </div>
                  {!showAssessment &&
                    !isTyping && (
                      <button
                        onClick={handleStartAssessment}
                        className="px-4 py-2 mt-12 mb-4 rounded-lg border border-[#00BF53] text-[#00BF53] mx-auto flex hover:bg-[#00BF53]/[0.1] transition-colors"
                      >
                        Start Career Assessment
                      </button>
                    )}
                </div>
              </div>

              {isAuthModalOpen && (
                <AuthModal
                  onClose={() => setIsAuthModalOpen(false)}
                  onSuccess={(result: any) => {
                    setIsAuthModalOpen(false);
                    if (!result?.onBoard) {
                      setIsOnboardingModalOpen(true);
                    } else {
                      handleStartAssessment();
                    }
                  }}
                />
              )}

              <OnboardingModal
                isOpen={isOnboardingModalOpen}
                onClose={() => setIsOnboardingModalOpen(false)}
                onComplete={() => {
                  setIsOnboardingModalOpen(false);
                  handleStartAssessment();
                }}
              />
              {showAssessment && (
                <div className="space-y-6 px-3">
                  <div className="bg-white rounded-lg py-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <p className="text-gray-800 mb-4">
                          Please answer all questions to get your personalized
                          career recommendation:
                        </p>

                        <div className="space-y-8">
                          {questions
                            .slice(0, currentQuestionIndex + 1)
                            .map((question: MCQQuestion, globalIndex: number) => {
                              const set = questionSets.find(
                                (s) => s.category === question.category
                              );
                              const firstIndexOfCategory = questions.findIndex((q: MCQQuestion) => q.category === question.category);
                              const showSetTitle = set && (globalIndex === firstIndexOfCategory);

                              return (
                                <div key={question.id}>
                                  {/* Level 1 Completion Message */}
                                  {question.category === 'behavioral' && globalIndex === firstIndexOfCategory && (
                                    <div className="mb-8 mx-4 animate-slideIn">
                                      <div className="bg-gradient-to-r from-emerald-50/40 to-teal-50/40 border border-emerald-100/30 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-100/20 rounded-full blur-xl"></div>
                                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-teal-100/20 rounded-full blur-xl"></div>

                                        <div className="relative z-10 flex flex-col items-center">
                                          <div className="w-12 h-12 bg-white/70 rounded-full shadow-md flex items-center justify-center mb-3">
                                            <CheckCircle className="text-emerald-500/80 w-6 h-6" />
                                          </div>

                                          <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center">
                                            {COMPLETION_MESSAGES[wordingSetIndex].level1_2.appreciation} <Sparkles className="w-4 h-4 text-emerald-500/80 ml-2" />
                                          </h3>

                                          <p className="text-gray-600 max-w-lg mx-auto text-md">
                                            {COMPLETION_MESSAGES[wordingSetIndex].level1_2.positiveStart}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Level 2 Completion Message */}
                                  {question.category === 'track' && globalIndex === firstIndexOfCategory && (
                                    <div className="mb-8 mx-4 animate-slideIn">
                                      <div className="bg-gradient-to-r from-emerald-50/40 to-teal-50/40 border border-emerald-100/30 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-100/20 rounded-full blur-xl"></div>
                                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-teal-100/20 rounded-full blur-xl"></div>

                                        <div className="relative z-10 flex flex-col items-center">
                                          <div className="w-12 h-12 bg-white/70 rounded-full shadow-md flex items-center justify-center mb-3">
                                            <CheckCircle className="text-emerald-500/80 w-6 h-6" />
                                          </div>

                                          <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center">
                                            {COMPLETION_MESSAGES[wordingSetIndex].level2_3.appreciation} <Sparkles className="w-4 h-4 text-emerald-500/80 ml-2" />
                                          </h3>

                                          <p className="text-gray-600 max-w-lg mx-auto text-md">
                                            {COMPLETION_MESSAGES[wordingSetIndex].level2_3.positiveStart}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {showSetTitle && (
                                    <div className="mb-8">
                                      <h2 className="text-xl font-semibold text-gray-900 bg-white py-2 z-10">
                                        {set.title}
                                      </h2>
                                      {set.description && (
                                        <div className="mt-2 mb-4 animate-slideIn space-y-2 p-4 bg-gray-50 rounded-r-lg border-l-4 border-gray-300">
                                          {set.description.split('\n').map((line, i) => (
                                            <p key={i} className={`${i === 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                              {line}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div
                                    ref={(el) => {
                                      questionRefs.current[globalIndex] = el;
                                      if (globalIndex === currentQuestionIndex) {
                                        currentQuestionRef.current = el;
                                      }
                                    }}
                                    className={`px-5 border-l-4 border-[#00BF53]/[0.1] pl-4 transition-all duration-500 ${globalIndex === currentQuestionIndex
                                      ? "animate-slideIn opacity-100"
                                      : "opacity-80"
                                      }`}
                                    style={{
                                      animation:
                                        globalIndex === currentQuestionIndex
                                          ? "slideIn 0.5s ease-out"
                                          : "none",
                                    }}
                                  >
                                    <h3 className="font-medium text-gray-800 mb-3">
                                      {globalIndex + 1}. {question.question}
                                    </h3>
                                    <div className="space-y-2">
                                      {question.options.map((option) => (
                                        <label
                                          key={option.id}
                                          className="flex items-center space-x-3 cursor-pointer"
                                        >
                                          <span className="w-[5%]">
                                            <input
                                              type="radio"
                                              name={question.id}
                                              value={option.text}
                                              checked={
                                                userAnswers[question.id] ===
                                                option.text
                                              }
                                              onChange={() =>
                                                handleAnswerSelect(
                                                  question.id,
                                                  option.text
                                                )
                                              }
                                              className="text-blue-500 w-[40px !important] h-[40px !important] accent-[#00BF53]"
                                              disabled={showResults}
                                            />
                                          </span>
                                          <span className="text-gray-700 w-[95%]">
                                            {option.text}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                    {/* Inline Speed Warning with OK Button */}
                                    {warningMessage && warningQuestionId === question.id && (
                                      <div className="warning-box mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg flex items-center justify-between">
                                        <p className="text-yellow-800 text-sm font-medium flex items-center">
                                          ⚠️ {warningMessage}
                                        </p>
                                        <button
                                          onClick={() => {
                                            dispatch(setWarning({ message: null, questionId: null }));
                                            
                                          }}
                                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium ml-4 flex-shrink-0"
                                        >
                                          OK
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        {currentQuestionIndex === questions.length - 1 &&
                          userAnswers[questions[currentQuestionIndex].id] &&
                          !showResults && (
                            <div className="flex flex-col items-center w-full animate-slideIn mt-8">
                              <div className="bg-gradient-to-r from-emerald-50/40 to-teal-50/40 border border-emerald-100/30 rounded-2xl p-6 text-center shadow-sm relative overflow-hidden mb-6 w-full max-w-2xl mx-auto">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-100/20 rounded-full blur-xl"></div>
                                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-emerald-100/20 rounded-full blur-xl"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-12 h-12 bg-white/70 rounded-full shadow-md flex items-center justify-center mb-3">
                                    <CheckCircle className="text-emerald-500/80 w-6 h-6" />
                                  </div>

                                  <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center">
                                    {COMPLETION_MESSAGES[wordingSetIndex].level3_final.appreciation} <Sparkles className="w-4 h-4 text-emerald-500/80 ml-2" />
                                  </h3>

                                  <p className="text-gray-600 max-w-lg mx-auto text-md">
                                    {COMPLETION_MESSAGES[wordingSetIndex].level3_final.beforeResult}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={submitAssessment}
                                className="bg-[#00BF53] text-white hover:bg-[#00a649] px-8 py-2 rounded-xl transition-all shadow-lg hover:shadow-xl text-md flex items-center"
                              >
                                Submit Assessment
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {assessmentTerminated && (
                    <div className="rounded-lg my-4">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ Assessment terminated. You can now chat normally.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* RESULTS SECTION */}
              {showAssessment && showResults && assessmentResult && (
                <div className="space-y-6 mt-12 pt-8 border-t-4 border-[#00BF53]" id="results-section">
                  <div className="bg-white rounded-lg py-6 space-y-8 animate-slideIn">
                    {/* Success Header */}
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Assessment Complete!</h2>
                      <p className="text-gray-600">Here are your personalized career recommendations</p>
                    </div>

                    <div className="">
                      {/* <div className="text-center flex justify-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#00BF53] text-white rounded-full">
                          <Compass size={32} />
                        </div>
                      </div> */}

                      {/* Primary Recommendation */}
                      <div className="px-8">
                        <div className="flex items-center gap-8">
                          <div className="flex flex-col items-center w-[40%]">
                            <div className="text-[80px] font-[900] text-[#BBF7D0] font-geist">
                              {Math.round(assessmentResult.trackResults[0]?.score || 0)}%
                            </div>
                          </div>
                          <div className="flex-1 w-[60%]">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                              #{1} {assessmentResult.primaryTrack}
                            </h2>
                            <p className="text-[14px] text-gray-600">
                              Based on your cognitive style, behavioral traits, and technical aptitude, this is your strongest career path match.
                            </p>
                          </div>
                        </div>
                      </div>

                      <hr className="border-t-2 border-[#0000001A] my-4" />

                      {/* Secondary Recommendation */}
                      {assessmentResult.secondaryTrack && (
                        <div className="px-8">
                          <div className="flex items-center gap-8">
                            <div className="flex-1 w-[60%]">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                #{2} {assessmentResult.secondaryTrack}
                              </h3>
                              <p className="text-[14px] text-gray-600">
                                A strong second option that also aligns well with your profile.
                              </p>
                            </div>
                            <div className="flex flex-col items-center w-[40%]">
                              <div className="text-[80px] font-[900] text-[#FFF2BD] font-geist">
                                {Math.round(assessmentResult.trackResults[1]?.score || 0)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Track Breakdown */}
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 text-center">Track Match Breakdown</h3>
                      <div className="space-y-4">
                        {assessmentResult.trackResults.map((track: any) => (
                          <div key={track.trackName} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-700">{track.trackName}</span>
                              <span className="font-bold text-[#00BF53]">{Math.round(track.score)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#00BF53] h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, Math.max(0, track.score))}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                              <span>Cognitive: {Math.round(track.details.cogPercent)}%</span>
                              <span>Behavioral: {Math.round(track.details.behPercent)}%</span>
                              <span>Technical: {Math.round(track.details.trackStrengthPercent)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3 pt-4">
                      {/* <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = ReportURL;
                          link.download = "wele-report.pdf";
                          link.click();
                        }}
                        className="border border-[#00BF53] text-[#00BF53] hover:bg-[#00BF53]/[0.1] px-6 py-2 rounded-lg transition-colors font-medium"
                      >
                        Download Full Report
                      </button> */}
                      <button
                        onClick={() => {
                          // Retake Assessment
                          dispatch(fullReset());
                          setChatMessages([]);
                        }}
                        className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      >
                        Retake Assessment
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {chatMessages.map((message, index) => (
                <div key={index} className="mb-6">
                  {message.role === "ai" ? (
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 space-y-2">
                        <div className="prose max-w-none">
                          {message.content ? (
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          ) : (
                            <div className="flex space-x-1">
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-right mb-4">
                      <div className="inline-block bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-tr-md max-w-[80%]">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* SIDE TITLE NAVIGATION - Mobile at top, Desktop on right */}
            {showAssessment && (
              <div className="absolute md:min-w-[180px] md:bg-white md:self-start top-[-12px] pt-3 pb-2 z-20 md:sticky md:top-[25px] w-[calc(100%+2rem)] -ml-4 px-4 md:w-auto md:ml-4 mb-6 md:mb-0 order-first md:order-last bg-white md:px-0 md:pb-0">
                <div className="md:space-y-3 flex md:flex-col flex-nowrap overflow-x-auto md:overflow-visible gap-4 md:gap-0 pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {questionSets.map((set) => {
                    const isActive = activeSet === set.id;

                    return (
                      <button
                        key={set.id}
                        onClick={() => {
                          const firstIndex = questions.findIndex((q: MCQQuestion) => q.category === set.category);
                          if (firstIndex !== -1 && questionRefs.current[firstIndex]) {
                            dispatch(setActiveSet(set.id));
                            questionRefs.current[firstIndex]?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className={`md:w-full md:border-l-2 border-b-2 md:border-b-0 whitespace-nowrap text-left px-2 py-1 transition-all flex-shrink-0 ${isActive ? "md:border-[#00BF53] border-[#00BF53]" : "md:border-transparent border-transparent"
                          }`}
                      >
                        <div className="flex">
                          <span
                            className={`text-sm ${isActive ? "text-[#00BF53]" : "text-gray-700"
                              }`}
                          >
                            <span className="md:hidden">{set.shortTitle}</span>
                            <span className="hidden md:inline">{set.title}</span>
                          </span>
                          <span
                            className={`text-xs ml-2 self-center ${isActive ? "text-[#00BF53]" : "text-gray-500"
                              }`}
                          >
                            {(() => {
                              const { completed, total } = getCategoryStats(set.category);
                              return `${completed}/${total}`;
                            })()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showWarningPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-yellow-500 font-bold">!</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Warning</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Current assessment data will be cleared if you continue. Do you
                want to proceed?
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowWarningPopup(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWarningConfirm}
                  className="px-4 py-2 bg-[#00BF53] text-white rounded-lg hover:bg-[#00a045] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
