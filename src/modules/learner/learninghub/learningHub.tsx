import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { fetchLearnerBatches } from "../../../features/learnerBatchesSlice";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import courseBg from "../../../assets/image/Images/course-bg.webp";
import { batchClient } from "../../../graphql/client";
import { GET_SESSION_BY_BATCH_ID_QUERY } from "../../../graphql/queries/sessionQueries";

export function Learninghub() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showCards, setShowCards] = useState(false);
  const [courseFilter, setCourseFilter] = useState<
    "all" | "courses" | "masterclass"
  >("all");
  const [batchSessions, setBatchSessions] = useState<{ [key: string]: any[] }>(
    {},
  );
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const { batches, loading } = useAppSelector((state) => state.learnerBatches);
  const { userDetails } = useAppSelector((state) => state.ar);

  useEffect(() => {
    const learnerId = userDetails?.id;
    if (learnerId) {
      dispatch(fetchLearnerBatches({ learnerId, page: 0, size: 100 }));
    }
  }, [dispatch, userDetails?.id]);

  useEffect(() => {
    const fetchAllBatchSessions = async () => {
      if (batches.length > 0) {
        setSessionsLoading(true);
        const sessionsData: { [key: string]: any[] } = {};

        try {
          await Promise.all(
            batches.map(async (batch) => {
              try {
                const response = await batchClient.query({
                  query: GET_SESSION_BY_BATCH_ID_QUERY,
                  variables: { batchId: batch.id, page: 0, size: 100 },
                  fetchPolicy: "network-only",
                });
                sessionsData[batch.id] =
                  response.data?.getSessionByBatchId?.data || [];
              } catch (error) {
                console.error(
                  `Error fetching sessions for batch ${batch.id}:`,
                  error,
                );
                sessionsData[batch.id] = [];
              }
            }),
          );
          setBatchSessions(sessionsData);
        } catch (error) {
          console.error("Error fetching batch sessions:", error);
        } finally {
          setSessionsLoading(false);
        }
      }
    };

    if (!loading && batches.length > 0) {
      fetchAllBatchSessions();
    }
  }, [batches, loading]);

  useEffect(() => {
    if (!loading && batches.length > 0) {
      setShowCards(true);
    }
  }, [loading, batches.length]);

  const calculateSessionProgress = (batchId: string) => {
    const sessions = batchSessions[batchId] || [];
    if (!sessions.length) return 0;

    const now = new Date();
    const completedSessions = sessions.filter((session) => {
      const sessionDate = session.isRescheduled
        ? session.rescheduleDate
        : session.sessionDate;
      if (!sessionDate) return false;

      const sessionEndDateTime = new Date(sessionDate);
      if (session.sessionEndTime) {
        const [hours, minutes] = session.sessionEndTime.split(":");
        sessionEndDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      return sessionEndDateTime < now;
    }).length;

    return sessions.length > 0
      ? Math.round((completedSessions / sessions.length) * 100)
      : 0;
  };

  const transformedCourses = batches.map((batch, index) => {
    const sessionProgress = calculateSessionProgress(batch.id);
    const finalProgress = batch.testBatch ? 100 : sessionProgress;

    return {
      id: batch.id || batch.batchId || index + 1,
      short: batch.batchName?.substring(0, 2).toUpperCase() || "BC",
      title: batch.batchName || "Batch Course",
      subtitle: batch.batchDescription || "Course Description",
      basePrice: batch.basePrice,
      sellingPrice: batch.sellingPrice,
      sessionCount: batch.sessionCount || 0,
      overAllPercentage: finalProgress,
      batchStartDate: batch.batchStartDate,
      batchEndDate: batch.batchEndDate,
      bannerUrl: batch.bannerUrl,
      startDate: batch.batchStartDate
        ? new Date(batch.batchStartDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "TBD",
      endDate: batch.batchEndDate
        ? new Date(batch.batchEndDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "TBD",
      skillsYouGain: batch.skillsYouGain || [],
      trainerName: batch.trainerList?.[0]?.trainerName || "",
      isMasterClass: batch.isMasterClass || false,
    };
  });

  const courses = transformedCourses.filter((c) => !c.isMasterClass);
  const masterclasses = transformedCourses.filter((c) => c.isMasterClass);

  const displayCourses =
    courseFilter === "masterclass"
      ? masterclasses
      : courseFilter === "courses"
        ? courses
        : transformedCourses;

  const renderCourseCard = (course: (typeof transformedCourses)[0]) => {
    const now = new Date();
    const startDate = course.batchStartDate
      ? new Date(course.batchStartDate)
      : null;
    const endDate = course.batchEndDate ? new Date(course.batchEndDate) : null;
    const isStarted = startDate && now >= startDate;
    const isEnded = endDate && now > endDate;

    const handleCardClick = async () => {
      if (!isStarted || isEnded) {
        navigate(`/learninghub/details/${course.id}`);
      } else {
        const sessions = batchSessions[course.id] || [];
        if (sessions.length > 0) {
          const upcomingSessions = sessions
            .filter((session) => {
              const sessionDate = session.isRescheduled
                ? session.rescheduleDate
                : session.sessionDate;
              if (!sessionDate) return false;
              const sessionDateTime = new Date(sessionDate);
              if (session.sessionStartTime) {
                const [hours, minutes] = session.sessionStartTime.split(":");
                sessionDateTime.setHours(parseInt(hours), parseInt(minutes));
              }
              return sessionDateTime > now;
            })
            .sort((a, b) => {
              const dateA = new Date(
                a.isRescheduled ? a.rescheduleDate : a.sessionDate,
              );
              const dateB = new Date(
                b.isRescheduled ? b.rescheduleDate : b.sessionDate,
              );
              return dateA.getTime() - dateB.getTime();
            });

          if (upcomingSessions[0]) {
            navigate(
              `/learninghub/${course.id}/session/${upcomingSessions[0].id}`,
            );
          } else {
            navigate(`/learninghub/details/${course.id}`);
          }
        } else {
          navigate(`/learninghub/details/${course.id}`);
        }
      }
    };

    return (
      <div
        key={course.id}
        onClick={handleCardClick}
        className="bg-white rounded-[30px] overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div
          className={`p-3 bg-cover bg-top ${course.bannerUrl ? "h-[113px]" : ""}`}
          style={{ backgroundImage: `url(${course.bannerUrl || courseBg})` }}
        >
          {!course.bannerUrl && (
            <div className="flex items-center gap-3 h-20">
              <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                {course.short}
              </div>
              <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                {course.title}
              </h3>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
            <BookOpen className="w-4 h-4" />
            <span>{course.sessionCount} Sessions</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-medium text-gray-900">
                {course.overAllPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#00BF56] h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.overAllPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-2 flex items-center">
            <p className="text-xs text-gray-600">Trainer Name:</p>
            <p className="text-xs font-medium text-gray-900 ml-1">
              {course.trainerName || "TBD"}
            </p>
          </div>

          <div className="flex mb-2 items-center line-clamp-1">
            <div className="mb-2 flex items-center">
              <p className="text-xs text-gray-600">Start Date:</p>
              <p className="text-xs font-medium text-gray-900 ml-1">
                {course.startDate}
              </p>
            </div>
            <div className="mb-2 flex items-center ml-2">
              <p className="text-xs text-gray-600">End Date:</p>
              <p className="text-xs font-medium text-gray-900 ml-1">
                {course.endDate}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  const response = await batchClient.query({
                    query: GET_SESSION_BY_BATCH_ID_QUERY,
                    variables: { batchId: course.id, page: 0, size: 100 },
                    fetchPolicy: "network-only",
                  });
                  const sessions =
                    response.data?.getSessionByBatchId?.data || [];
                  const latestSession = sessions[sessions.length - 1];
                  if (latestSession) {
                    navigate(
                      `/learninghub/${course.id}/session/${latestSession.id}`,
                    );
                  }
                } catch (error) {
                  console.error("Error fetching session:", error);
                }
              }}
              className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-[#00BF56] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Recordings
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white w-full max-w-5xl mx-auto px-6 pb-24">
        <div className="py-4 mb-2">
          <h2 className="text-xl text-gray-900 font-semibold mb-3">
            Welcome to Your Learning Journey! 🎓
          </h2>
          <p className="text-sm text-gray-700 w-[80%]">
            Discover, learn, and master new skills with our comprehensive
            courses. Track your progress, join live sessions, and achieve your
            learning goals.
          </p>
        </div>

        <div className="flex gap-2 mb-4">
          {(["all", "courses", "masterclass"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setCourseFilter(tab)}
              className={`px-4 py-2 text-xs rounded-2xl border transition-colors capitalize ${
                courseFilter === tab
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab === "all"
                ? "All"
                : tab === "courses"
                  ? "Courses"
                  : "Masterclass"}
            </button>
          ))}
        </div>

        {loading || sessionsLoading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : courseFilter === "all" ? (
          <>
            {courses.length > 0 && (
              <>
                <h2 className="text-[20px] text-[#111827] font-semibold mb-3">
                  Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {showCards && courses.map(renderCourseCard)}
                </div>
              </>
            )}
            {masterclasses.length > 0 && (
              <>
                <h2 className="text-[20px] text-[#111827] font-semibold mb-3">
                  Master Class
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {showCards && masterclasses.map(renderCourseCard)}
                </div>
              </>
            )}
            {courses.length === 0 && masterclasses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No courses found</p>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {showCards && displayCourses.length > 0 ? (
              displayCourses.map(renderCourseCard)
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No courses found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
