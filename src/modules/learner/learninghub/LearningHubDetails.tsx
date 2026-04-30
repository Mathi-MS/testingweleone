import {
  Calendar,
  Globe,
  Clock,
  Star,
  Play,
  Lock,
  ChevronRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBatchByIdThunk } from "../../../features/batchSlice";
import { AppDispatch, RootState } from "../../../app/store";
import { batchClient } from "../../../graphql/client";
import { GET_SESSION_BY_BATCH_ID_QUERY } from "../../../graphql/queries/sessionQueries";
import { LoadingSpinner } from "../../../components/ui";
import { AuthHeaderControls } from "../../../components/auth/AuthHeaderControls";
import { SidebarContext } from "../ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";

const stats = [
  { label: "Total members", value: "249" },
  { label: "Available Mentors", value: "23" },
  { label: "Enrolled Members", value: "3579" },
  { label: "Course Rating", value: 5, isRating: true },
  { label: "Course Value", value: "100%" },
];

export default function LearningHubDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { batchedit: batch, loading } = useSelector(
    (state: RootState) => state.batch,
  );
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("sessions");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const { userDetails, accessToken } = useSelector(
    (state: RootState) => state.ar,
  );
  const sidebarContext = React.useContext(SidebarContext);

  useEffect(() => {
    if (activeTab === "certificates" && id && userDetails?.id) {
      setCertLoading(true);
      setCertError(null);
      const token = sessionStorage.getItem("accessToken");
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      fetch(`${baseUrl}/batch/view/certificate/${id}/${userDetails?.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => {
          if (!res.ok) throw new Error("Certificate not available");
          return res.blob();
        })
        .then((blob) => setCertificateUrl(URL.createObjectURL(blob)))
        .catch((err) => setCertError(err.message))
        .finally(() => setCertLoading(false));
    }
  }, [activeTab, id, userDetails?.id]);

  useEffect(() => {
    if (id) {
      dispatch(getBatchByIdThunk({ batchId: id }));

      batchClient
        .query({
          query: GET_SESSION_BY_BATCH_ID_QUERY,
          variables: { batchId: id, page: 0, size: 50 },
          fetchPolicy: "network-only",
        })
        .then((response: any) => {
          if (response.data?.getSessionByBatchId?.data) {
            setSessions(response.data.getSessionByBatchId.data);
          }
        });
    }
  }, [id, dispatch]);

  const completedPercentage = batch?.testBatch ? 100 : batch?.overAllPercentage;
  const totalSessions = batch?.sessionCount;
  const completedSessions = Math.floor(
    (completedPercentage / 100) * totalSessions,
  );
  const remainingSessions = totalSessions - completedSessions;

  // Calculate progress based on session end dates
  const calculateProgressFromSessions = () => {
    if (!sessions.length)
      return {
        completedPercentage: 0,
        completedSessions: 0,
        remainingSessions: totalSessions || 0,
      };

    const now = new Date();
    const completedSessionsCount = sessions.filter((session) => {
      const sessionDate = session.isRescheduled
        ? session.rescheduleDate
        : session.sessionDate;
      if (!sessionDate) return false;

      // Create end date by combining session date with end time
      const sessionEndDateTime = new Date(sessionDate);
      if (session.sessionEndTime) {
        const [hours, minutes] = session.sessionEndTime.split(":");
        sessionEndDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      return sessionEndDateTime < now;
    }).length;

    const totalSessionsCount = sessions.length;
    const progressPercentage =
      totalSessionsCount > 0
        ? Math.round((completedSessionsCount / totalSessionsCount) * 100)
        : 0;
    const remainingSessionsCount = totalSessionsCount - completedSessionsCount;

    return {
      completedPercentage: progressPercentage,
      completedSessions: completedSessionsCount,
      remainingSessions: remainingSessionsCount,
    };
  };

  const sessionProgress = calculateProgressFromSessions();
  const displayCompletedPercentage = batch?.testBatch
    ? 100
    : sessionProgress.completedPercentage;
  const displayCompletedSessions = batch?.testBatch
    ? totalSessions
    : sessionProgress.completedSessions;
  const displayRemainingSessions = batch?.testBatch
    ? 0
    : sessionProgress.remainingSessions;

  return (
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-30 border-b bg-white px-3 py-2 flex flex-row justify-between gap-2">
        <div className="flex items-center text-xs sm:text-sm text-gray-600 overflow-hidden">
          {!sidebarContext?.sidebarOpen && (
            <button
              onClick={sidebarContext?.toggleSidebar}
              className={`${userDetails?.roles?.some((role) => role.toUpperCase() === "ROLE_ADMIN") ? "" : "md:hidden"} flex items-center justify-center p-1`}
            >
              {/* <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" /> */}
              <HiMiniBars3BottomLeft
                style={{ color: "#000", fontSize: "22px" }}
              />
            </button>
          )}
          <Link
            to="/learninghub"
            className="text-md font-medium hover:text-green-600 whitespace-nowrap"
          >
            Learning Hub
          </Link>
          <ChevronRight size={16} className="mx-1 sm:mx-2 flex-shrink-0" />
          <span className="text-gray-900 truncate max-w-[150px] sm:max-w-none">
            {batch?.batchName}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <AuthHeaderControls />
        </div>
      </div>

      <div className="mx-2 sm:mx-4 xl:mx-28 px-2 sm:px-4 lg:px-6 py-4 sm:py-8 pb-[5rem]">
        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : !batch ? (
          <div className="text-center py-20 text-gray-500">Batch not found</div>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row items-start justify-between mb-8 gap-6">
              <div className="flex-1 w-full">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {batch.batchName}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {batch.batchDescription}
                </p>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">
                      Course start date & end date :{" "}
                      {new Date(batch.batchStartDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}{" "}
                      -{" "}
                      {new Date(batch.batchEndDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <span>{batch.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{totalSessions} Sessions - Totally</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6">
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="font-medium">
                      {displayCompletedPercentage}% Completed
                    </span>
                    <span className="text-gray-600">
                      {displayRemainingSessions} Session remaining
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${displayCompletedPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="rounded-lg">
                  <div
                    className="bg-gray-100 p-3 rounded-xl mb-4"
                    style={
                      batch.bannerUrl
                        ? {
                            backgroundImage: `url(${batch.bannerUrl})`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            minHeight: "150px",
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-center gap-3 p-4">
                      {!batch.bannerUrl && (
                        <>
                          <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold">
                              {batch.courseName
                                ?.substring(0, 2)
                                .toUpperCase() || "BC"}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold">
                            {batch.courseName || "Course"}
                          </h3>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-gray-600">Trainer Name : </span>
                      <span className="font-semibold">
                        {batch.trainerList?.[0]?.trainerName || "TBA"}
                      </span>
                    </div>
                    {batch.nextSessionDate && (
                      <>
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <span className="text-gray-600">Next Session : </span>
                          <span className="font-semibold">
                            {batch.nextSessionDate}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-green-600">
                          <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="font-medium break-words">
                            {new Date(batch.nextSessionDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                            & {batch.sessionStartTime} -{" "}
                            {batch.timeZone || "GST"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="mb-8 border p-4 rounded-xl">
              <h2 className="text-md font-bold mb-6">On this Course:</h2>
              <div className="grid grid-cols-5 gap-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center border p-4 rounded-xl">
                    <div className="text-gray-600 text-sm mb-2">
                      {stat.label}
                    </div>
                    {stat.isRating ? (
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-green-500 text-green-500"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-lg font-bold">{stat.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            {batch.whatYouLearn && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-sm sm:text-md font-bold mb-3 sm:mb-4">
                  What you'll learn
                </h2>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  {batch.whatYouLearn
                    .split(/<\/li>|<\/p>/)
                    .map((item: string) =>
                      item.replace(/<\/?[^>]+(>|$)/g, "").trim(),
                    )
                    .filter((item: string) => item)
                    .map((item: string, index: number) => (
                      <li key={index} className="flex gap-2 sm:gap-3">
                        <span className="text-gray-900 flex-shrink-0">•</span>
                        <span className="flex-1">{item}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="mb-10">
              <div className="flex border-b overflow-x-auto">
                <button
                  onClick={() => setActiveTab("sessions")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "sessions"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Course Sessions
                </button>
                <button
                  onClick={() => setActiveTab("modules")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "modules"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Modules
                </button>
                <button
                  onClick={() => setActiveTab("certificates")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "certificates"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Certificate
                </button>
              </div>

              <div className="p-2 sm:p-4">
                {activeTab === "modules" && (
                  <div className="">
                    {batch?.batchModules && batch.batchModules.length > 0 ? (
                      batch.batchModules.flatMap(
                        (week: any) =>
                          week.moduleDetails?.map(
                            (module: any, moduleIndex: number) => {
                              const moduleKey = `${week.id}-${moduleIndex}`;
                              return (
                                <div key={moduleKey} className="border-b">
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(
                                        expandedModules,
                                      );
                                      if (newExpanded.has(moduleKey)) {
                                        newExpanded.delete(moduleKey);
                                      } else {
                                        newExpanded.add(moduleKey);
                                      }
                                      setExpandedModules(newExpanded);
                                    }}
                                    className="w-full flex items-center justify-between rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                      <BookOpen
                                        size={18}
                                        className="text-gray-600 flex-shrink-0"
                                      />
                                      <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                        {module.moduleName}
                                      </span>
                                    </div>
                                    {expandedModules.has(moduleKey) ? (
                                      <ChevronUp
                                        size={18}
                                        className="text-gray-400 flex-shrink-0"
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={18}
                                        className="text-gray-400 flex-shrink-0"
                                      />
                                    )}
                                  </button>
                                  {expandedModules.has(moduleKey) && (
                                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                                      <div
                                        className="text-xs sm:text-sm text-gray-600 pl-6 sm:pl-8 [&>*]:py-1 [&>li]:py-1 [&>p]:py-1"
                                        dangerouslySetInnerHTML={{
                                          __html: module.moduleDescription,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          ) || [],
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No modules available
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "certificates" && (
                  <div className="py-6">
                    {certLoading ? (
                      <LoadingSpinner size="lg" />
                    ) : certError ? (
                      <p className="text-gray-500 text-sm">{certError}</p>
                    ) : certificateUrl ? (
                      <div
                        className="relative inline-block group"
                        style={{ width: "430px", maxWidth: "100%" }}
                      >
                        <object
                          data={`${certificateUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          type="application/pdf"
                          style={{
                            width: "100%",
                            height: "300px",
                            border: "none",
                            display: "block",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <button
                            onClick={() => {
                              const token =
                                sessionStorage.getItem("accessToken");
                              const baseUrl = import.meta.env.VITE_API_BASE_URL;
                              fetch(
                                `${baseUrl}/batch/download/${id}/${userDetails?.id}`,
                                {
                                  headers: token
                                    ? { Authorization: `Bearer ${token}` }
                                    : {},
                                },
                              )
                                .then((res) => res.blob())
                                .then((blob) =>
                                  window.open(
                                    URL.createObjectURL(blob),
                                    "_blank",
                                  ),
                                );
                            }}
                            className="px-5 py-1 bg-white text-green-600 border border-green-600 font-semibold text-sm rounded-2xl shadow hover:bg-gray-100 transition-colors"
                          >
                            Preview
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
                {activeTab === "sessions" && (
                  <div className="divide-y">
                    {sessions.length > 0 ? (
                      sessions.map((session) => {
                        const sessionDate = session.isRescheduled
                          ? session.rescheduleDate
                          : session.sessionDate;
                        const isPast = sessionDate
                          ? new Date(sessionDate) < new Date()
                          : false;
                        const status = isPast ? "completed" : "active";

                        return (
                          <div
                            key={session.id}
                            onClick={() =>
                              navigate(
                                `/learninghub/${id}/session/${session.id}`,
                              )
                            }
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-2 hover:bg-gray-50 cursor-pointer gap-3"
                          >
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                                  status === "completed"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                {status === "completed" ? (
                                  <Play size={14} className="text-green-600" />
                                ) : (
                                  <Lock size={14} className="text-gray-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                                  {session.sessionName ||
                                    `Session ${session.day}`}
                                </h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Calendar
                                      size={12}
                                      className="text-gray-500 mr-1 flex-shrink-0"
                                    />
                                    <span className="truncate">
                                      {sessionDate
                                        ? new Date(
                                            sessionDate,
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                          })
                                        : "TBD"}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock
                                      size={12}
                                      className="text-gray-500 mr-1 flex-shrink-0"
                                    />
                                    {session.sessionStartTime || "TBD"} -{" "}
                                    {session.sessionEndTime || "TBD"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* <ChevronRight className="w-5 h-5 text-gray-400" /> */}
                            <button className="font-medium text-xs bg-green-100 text-green-600 px-3 py-2 sm:p-3 rounded-lg whitespace-nowrap w-full sm:w-auto">
                              View Recordings
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No sessions available
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
