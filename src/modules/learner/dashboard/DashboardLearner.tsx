import {
  Calendar,
  Video,
  TrendingUp,
  FileText,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { GET_LEARNER_DASHBOARD } from "../../../graphql/queries/learnerQueries";
import { batchClient } from "../../../graphql/client";
import { useSelector } from "react-redux";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import Dashboard from "./Dashboard";

const BAR_DATA = [3, 5, 4, 6, 7];

const MiniBarChart = ({ highlight }: { highlight: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: "3px",
      height: "40px",
    }}
  >
    {BAR_DATA.map((h, i) => (
      <div
        key={i}
        style={{
          width: "10px",
          height: `${(h / 7) * 100}%`,
          borderRadius: "2px",
          backgroundColor: i === BAR_DATA.length - 1 ? highlight : "#e5e7eb",
        }}
      />
    ))}
  </div>
);

const DashboardLearner = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showMainDashboard, setShowMainDashboard] = useState(false);
  const [showLearnerDashboard, setShowLearnerDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userDetails = useSelector((state: any) => state.ar.userDetails);
  const learnerId = userDetails?.id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data } = await batchClient.query({
          query: GET_LEARNER_DASHBOARD,
          variables: { learnerId },
          fetchPolicy: "network-only",
        });
        setDashboardData(data?.gettingLearnerDashBoard?.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (learnerId) {
      fetchDashboardData();
    }
  }, [learnerId]);

  // Format date and time
  const formatDateTime = (date: string, time: string) => {
    if (!date || !time) return "N/A";
    return `${date} • ${time}`;
  };

  const assessmentMark = dashboardData?.latestAssesementScore || 0;

  const getAssessmentButton = () => {
    if (assessmentMark < 50) {
      return { text: "Retake Assessment", color: "#dc2626" };
    } else if (assessmentMark <= 75) {
      return { text: "Try One More", color: "#f59e0b" };
    } else {
      return { text: "Try the Best Again", color: "#16a34a" };
    }
  };

  const assessmentButton = getAssessmentButton();

  const stats = [
    {
      icon: <Calendar size={20} color="#6b7280" />,
      title: "Upcoming Session",
      value: dashboardData?.nextSessionDate || "N/A",
      subtitle: dashboardData?.nextSessionName || "No upcoming session",
      datetime: formatDateTime(
        dashboardData?.nextSessionDate,
        dashboardData?.nextSessionTime,
      ),
      change: "+2 days",
      positive: true,
      highlight: "#00BF53",
    },
    {
      icon: <Video size={20} color="#6b7280" />,
      title: "Previous Session",
      value: dashboardData?.previousSessionName || "N/A",
      subtitle: "Recording Replay Available",
      datetime: formatDateTime(
        dashboardData?.previousSessionDate,
        dashboardData?.previousSessionTime,
      ),
      change: "Watch Now",
      positive: true,
      highlight: "#005AFF",
    },
    {
      icon: <TrendingUp size={20} color="#6b7280" />,
      title: "My Recent Track",
      value: "Full Stack",
      subtitle: "Based on Career Compass",
      datetime: "Primary: Frontend • Secondary: Backend",
      change: "+15%",
      positive: true,
      highlight: "#8b5cf6",
    },
    {
      icon: <FileText size={20} color="#6b7280" />,
      title: "Latest Assessment",
      value: `${assessmentMark}%`,
      subtitle: "Session Assessment Mark",
      datetime: formatDateTime(
        dashboardData?.latestAssesmentDate,
        dashboardData?.latestAssesmentTime,
      ),
      change: assessmentMark >= 50 ? "+10%" : "-5%",
      positive: assessmentMark >= 50,
      highlight:
        assessmentMark >= 75
          ? "#16a34a"
          : assessmentMark >= 50
            ? "#f59e0b"
            : "#dc2626",
    },
    {
      icon: <CheckCircle size={20} color="#6b7280" />,
      title: "Attendance (Last 7 Sessions)",
      value: `${dashboardData?.presentAttendance || 0}/${dashboardData?.totalAttendance || 0}`,
      subtitle: `${dashboardData?.totalAttendance ? ((dashboardData.presentAttendance / dashboardData.totalAttendance) * 100).toFixed(1) : 0}% Attendance Rate`,
      datetime: "Last 7 sessions",
      change: "+14%",
      positive: true,
      highlight: "#00BF53",
    },
  ];

  if (showMainDashboard) {
    return <Dashboard />;
  }

  return (
    <>
      {/* Header */}
      {/* <div className="border-b border-[#0d0d0d0d] bg-white px-4 py-[14px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-md text-gray-900 flex items-center">
              <TrendingUp size={16} className="me-2" />
              Learner Dashboard
            </h1>
          </div>
        </div>
      </div> */}

      <div className="bg-white w-full max-w-5xl mx-auto px-6 pt-4 pb-24 dashboard-container">
        {/* Toggle Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "4px",
              width: "220px",
            }}
          >
            <button
              onClick={() => setShowMainDashboard(true)}
              style={{
                flex: 1,
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                backgroundColor: showMainDashboard ? "#16a34a" : "transparent",
                color: showMainDashboard ? "#fff" : "#6b7280",
                transition: "all 0.2s",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setShowMainDashboard(false)}
              style={{
                flex: 1,
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                backgroundColor: !showMainDashboard ? "#16a34a" : "transparent",
                color: !showMainDashboard ? "#fff" : "#6b7280",
                transition: "all 0.2s",
              }}
            >
              My Space
            </button>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Grid view — cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
              }}
            >
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  onClick={() => setSelectedCard(stat.title)}
                  style={{
                    backgroundColor: "#FEFEFE",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow:
                      selectedCard === stat.title
                        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                        : "0 1px 3px rgba(0, 0, 0, 0.18)",
                    minHeight: "180px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    transform:
                      selectedCard === stat.title
                        ? "translateY(-2px)"
                        : "translateY(0)",
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                      }}
                    >
                      {stat.icon}
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#374151",
                          fontWeight: "500",
                        }}
                      >
                        {stat.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#9ca3af",
                        cursor: "pointer",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      ···
                    </span>
                  </div>

                  {/* Card Content */}
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#111827",
                        lineHeight: 1.4,
                        marginBottom: "6px",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        fontWeight: "500",
                        marginBottom: "4px",
                      }}
                    >
                      {stat.subtitle}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                      }}
                    >
                      {stat.datetime}
                    </div>
                  </div>

                  {/* Value + Chart or Button */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    {stat.title === "Latest Assessment" ? (
                      <button
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: assessmentButton.color,
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.9")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        {assessmentButton.text}
                      </button>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: stat.positive ? "#16a34a" : "#dc2626",
                            fontWeight: "500",
                          }}
                        >
                          {stat.change}{" "}
                          <span style={{ color: "#9ca3af", fontWeight: "400" }}>
                            vs last week
                          </span>
                        </div>
                      </div>
                    )}
                    <MiniBarChart highlight={stat.highlight} />
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info Section */}
            <div
              style={{
                marginTop: "24px",
                padding: "20px",
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111827",
                  marginBottom: "12px",
                }}
              >
                Quick Stats Overview
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Total Sessions
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {dashboardData?.totalAttendance || 0}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Avg. Assessment Score
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {dashboardData?.averageAssesementScore || 0}%
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Learning Streak
                  </p>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    12 days
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardLearner;
