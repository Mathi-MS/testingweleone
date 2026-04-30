import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Star,
  ChevronDown,
} from "lucide-react";
import { batchClient } from "../../../../graphql/client";
import {
  GET_SESSION_BY_ID_QUERY,
  GET_SESSION_BY_BATCH_ID_QUERY,
} from "../../../../graphql/queries/sessionQueries";
import { GET_BATCH_BY_ID } from "../../../../graphql/queries/batchQueries";
import { UPDATE_LEARNERS_SESSION } from "../../../../graphql/mutations/sessionMutations";
import { VideoPlayer } from "../../../../components/common/VideoPlayer";
import { SessionTabs } from "./SessionTabs";
import { LoadingSpinner } from "../../../../components/ui";
import { AuthHeaderControls } from "../../../../components/auth/AuthHeaderControls";
import { useAppSelector } from "../../../../app/hook";
import { images } from "../../../../assets/image/Images";
import { SidebarContext } from "../../ai/AIChatWrapper";
import Feedback from "./common/Feedback";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
type LocationState = {
  from?: string;
};
export function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const sidebarContext = React.useContext(SidebarContext);
  const [sessionData, setSessionData] = useState<any>(null);
  const [batchData, setBatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = React.useState("assessment");
  const [isSticky, setIsSticky] = React.useState(false);
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [testStats, setTestStats] = useState({ completed: 0, averageScore: 0 });
  const [assessments, setAssessments] = useState<any[]>([]);
  const [showSessionsPopup, setShowSessionsPopup] = useState(false);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const isLearningHub = window.location.hash.includes("/learninghub/");
  const { userDetails } = useAppSelector((state) => state.ar);
   const cameFromCalendar = location.state?.from === "calendar";
  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const sessionRes = await batchClient.query({
          query: GET_SESSION_BY_ID_QUERY,
          variables: { id: sessionId },
          fetchPolicy: "network-only",
        });
        const sessionResponse: any = sessionRes.data;
        if (sessionResponse?.getSessionById?.data) {
          setSessionData(sessionResponse.getSessionById.data);

          const batchId = sessionResponse.getSessionById.data.batchId;
          if (batchId) {
            const batchRes = await batchClient.query({
              query: GET_BATCH_BY_ID,
              variables: { id: batchId },
              fetchPolicy: "cache-first",
            });
            const batchResponse: any = batchRes.data;
            if (batchResponse?.getBatchById?.data) {
              setBatchData(batchResponse.getBatchById.data);
            }

            const sessionsRes = await batchClient.query({
              query: GET_SESSION_BY_BATCH_ID_QUERY,
              variables: { batchId, page: 0, size: 50 },
              fetchPolicy: "network-only",
            });
            if (sessionsRes.data?.getSessionByBatchId?.data) {
              setAllSessions(sessionsRes.data.getSessionByBatchId.data);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionDetails();
  }, [sessionId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 1, rootMargin: "-57px 0px 0px 0px" },
    );
    if (tabsRef.current) observer.observe(tabsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleVideoWatched = async () => {
    if (!sessionId || !userDetails?.id) return;

    try {
      await batchClient.mutate({
        mutation: UPDATE_LEARNERS_SESSION,
        variables: {
          learnerId: userDetails.id,
          sessionId: sessionId,
          learnerdetails: { seenRecordings: true },
        },
      });
    } catch (error) {
      console.error("Error updating video watched status:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-30 border-b bg-white p-2 sm:p-4 flex justify-between items-center">
        <div className="flex items-center text-xs sm:text-sm text-gray-600 min-w-0 flex-1">
          {!sidebarContext?.sidebarOpen && (
            <button 
              onClick={sidebarContext?.toggleSidebar}
              className={`${userDetails?.roles?.some((role: string) => role.toUpperCase() === 'ROLE_ADMIN') ? '' : 'md:hidden'} flex items-center justify-center p-1 mr-2`}
            >
              {/* <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" /> */}
              <HiMiniBars3BottomLeft style={{color:"#000",fontSize:"22px",}}/>
            </button>
          )}
          {cameFromCalendar ? (
    <Link
      to="/learnercalendar"
      className="truncate max-w-[100px] sm:max-w-none hover:text-green-600"
    >
      Calendar
    </Link>
  ) : (
    <Link
      to={
        isLearningHub
          ? `/learninghub/details/${batchData?.id}`
          : `/course/${batchData?.id}`
      }
      className="truncate max-w-[100px] sm:max-w-none hover:text-green-600"
    >
      {batchData?.batchName}
    </Link>
  )}
          <ChevronRight size={16} className="mx-1 sm:mx-2 flex-shrink-0" />
          <span className="text-gray-900 truncate max-w-[100px] sm:max-w-none">{sessionData?.sessionName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <AuthHeaderControls />
        </div>
      </div>

      <div className="mx-2 sm:mx-4 xl:mx-28 px-2 sm:px-4 lg:px-6 py-4 sm:pb-8 pb-[5rem]">
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : sessionData ? (
          <>
            <div className="mb-4">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 w-full sm:w-[80%]">
                {sessionData.sessionName || `Session ${sessionData.day}`}
              </h1>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    {(sessionData?.isRescheduled
                      ? sessionData?.rescheduleDate
                      : sessionData?.sessionDate)
                      ? new Date(
                          sessionData?.isRescheduled
                            ? sessionData?.rescheduleDate
                            : sessionData?.sessionDate
                        ).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "TBD"}{" "}
                    |{" "}
                    {sessionData?.isRescheduled
                      ? sessionData?.rescheduleStartTime || "TBD"
                      : sessionData?.sessionStartTime || "TBD"}{" "}
                    -{" "}
                    {sessionData?.isRescheduled
                      ? sessionData?.rescheduleEndTime || "TBD"
                      : sessionData?.sessionEndTime || "TBD"}
                  </p>
                </div>
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setShowSessionsPopup(!showSessionsPopup)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto justify-center"
                  >
                    {sessionData?.sessionName || `Session ${sessionData?.day}` || 'Session'} <ChevronDown size={16} />
                  </button>
                  {showSessionsPopup && (
                    <div className="absolute right-0 mt-2 w-full sm:w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {allSessions.map((session, index) => (
                        <div
                          key={session.id}
                          onClick={() => {
                            navigate(
                              isLearningHub
                                ? `/learninghub/${batchData?.id}/session/${session.id}`
                                : `/session/${session.id}`,
                            );
                            setShowSessionsPopup(false);
                          }}
                          className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                            session.id === sessionId ? "bg-green-50" : ""
                          }`}
                        >
                          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                            S{index + 1} - {session.sessionName}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          <VideoPlayer
            videoUrl={sessionData?.recordedUrl}
            onVideoWatched={handleVideoWatched}
            sessionStartDate={
              sessionData?.isRescheduled
                ? sessionData?.rescheduleDate
                : sessionData?.sessionDate
            }
            sessionStartTime={
              sessionData?.isRescheduled
                ? sessionData?.rescheduleStartTime
                : sessionData?.sessionStartTime
            }
            sessionEndTime={
              sessionData?.isRescheduled
                ? sessionData?.rescheduleEndTime
                : sessionData?.sessionEndTime
            }
            meetingUrl={sessionData?.meetingUrl}
          />

            <div className="bg-white py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <img
                    src={
                      sessionData?.trainerList?.[0]?.profilePhotoUrl ||
                      `https://api.dicebear.com/9.x/notionists/svg?seed=${sessionData?.trainerList?.[0]?.trainerName}`
                    }
                    alt="Trainer"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                  />
                  <div className="mt-2 min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">
                      {sessionData?.trainerList?.[0]?.trainerName ||
                        "Trainer Name"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {sessionData?.trainerList?.[0]?.domain || "Trainer"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* <div className="flex bg-gray-100 rounded-full p-2">
                    <button className="flex items-center gap-2 px-2 text-sm font-medium">
                      <ThumbsUp className="w-4 h-4 text-gray-600" /> 0
                    </button>
                    <button className="flex items-center gap-1 sm:gap-2 border-l border-gray-300 px-2">
                      <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    </button>
                  </div> */}
                  <div className="relative">
                    {/* <button
                      onClick={() => setShowFeedback(!showFeedback)}
                      className="flex items-center gap-2 px-6 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-[#00a847] hover:text-white transition-colors"
                    >
                      Feedback
                    </button> */}
                    {showFeedback && (
                      <Feedback
                        onClose={() => setShowFeedback(false)}
                        sessionId={sessionId!}
                        userId={userDetails?.id!}
                        courseId={batchData?.id}
                        username={userDetails?.name}
                        userType={userDetails?.userType}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Session not found
          </div>
        )}

        <div ref={tabsRef} className="bg-white">
          <SessionTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isSticky={isSticky}
            testStats={testStats}
            assessments={assessments}
            userId={userDetails?.id}
            username={userDetails?.name}
            courseId={batchData?.id}
          />
        </div>
      </div>
    </div>
  );
}
