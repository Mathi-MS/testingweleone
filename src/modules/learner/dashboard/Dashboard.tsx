import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { images } from "../../../assets/image/Images";
import { batchClient } from "../../../graphql/client";
import { GET_ALL_BATCH } from "../../../graphql/queries/batchQueries";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import DashboardLearner from "./DashboardLearner";
import { LayoutDashboard } from "lucide-react";
import { LearnerDashboard } from "./LearnerDashboard";

// Mobile responsive styles
const mobileStyles = `
  @media (max-width: 768px) {
    .dashboard-container {
      padding: 16px !important;
      padding-bottom: 80px !important;
    }
    .category-tabs {
      flex-wrap: wrap !important;
      gap: 6px !important;
    }
    .category-tab {
      padding: 4px 10px !important;
      font-size: 12px !important;
    }
    .main-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .card-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
      .card-grid.new{
      display: flex !important;
      flex-direction: column !important;
      grid-template-columns: none !important;
      gap: 16px !important;
      grid-column: 1 !important;
    }
    .card-grid.new > div:first-child {
      order: 2 !important;
    }
    .card-grid.new > div:last-child {
      order: 1 !important;
    }
    .two-col-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .course-cards-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    .sidebar-card {
      margin-top: 0 !important;
    }
    .image-height {
      height: 180px !important;
    }
    .mobile-margin {
      margin-right: 0 !important;
      margin-bottom: 16px !important;
    }
  }
  @media (max-width: 480px) {
    .dashboard-container {
      padding: 12px !important;
    }
    .welcome-title {
      font-size: 18px !important;
    }
    .section-title {
      font-size: 16px !important;
    }
    .card-title {
      font-size: 16px !important;
    }
    .image-height {
      height: 160px !important;
    }
    .image-height.new{
      height:300px !important;
    }
  }
`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [categoryTab, setCategoryTab] = useState("For You");
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showLearnerDashboard, setShowLearnerDashboard] = useState(false);
  const categories = ["For You", "Career Hub", "Community", "Feedback", "Weekly Challenges", ];

  // Add mobile styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = mobileStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch courses and masterclasses
  useEffect(() => {
    const fetchCoursesAndMasterclasses = async () => {
      try {
        setLoadingCourses(true);
        const response = await batchClient.query({
          query: GET_ALL_BATCH,
          variables: { 
            page: 0, 
            size: 100,
            filter: {
              isPublish: true,
              isWebsiteEnable: true
            }
          },
          fetchPolicy: "network-only",
        });

        const allBatches = response.data?.getAllBatch?.data || [];

        // Sort by batchStartDate (most recent first) and take top 2
        const sortedBatches = [...allBatches]
          .filter((batch: any) => batch.batchStartDate)
          .sort((a: any, b: any) => new Date(b.batchStartDate).getTime() - new Date(a.batchStartDate).getTime())
          .slice(0, 2);

        setRecentCourses(sortedBatches);

      } catch (error) {
        console.error("Error fetching courses and masterclasses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCoursesAndMasterclasses();
  }, []);

  if (showLearnerDashboard) {
    return <LearnerDashboard />;
  }

  return (
    <>
    {/* Header */}
          {/* <div className="border-b border-[#0d0d0d0d] bg-white px-4 py-[14px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-md text-gray-900 flex items-center">
                  <LayoutDashboard size={16} className="me-2" />
                  Dashboard
                </h1>
              </div>
            </div>
          </div> */}
    <div className="bg-white w-full max-w-5xl mx-auto px-6 pt-4 pb-24 dashboard-container">
      <div>
        {/* Toggle Button */}
        {/* <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "4px", width: "220px" }}>
            <button
              onClick={() => setShowLearnerDashboard(false)}
              style={{
                flex: 1,
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                backgroundColor: !showLearnerDashboard ? "#16a34a" : "transparent",
                color: !showLearnerDashboard ? "#fff" : "#6b7280",
                transition: "all 0.2s",
              }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setShowLearnerDashboard(true)}
              style={{
                flex: 1,
                padding: "6px 16px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                border: "none",
                backgroundColor: showLearnerDashboard ? "#16a34a" : "transparent",
                color: showLearnerDashboard ? "#fff" : "#6b7280",
                transition: "all 0.2s",
              }}
            >
              My Space
            </button>
          </div>
        </div> */}

        {/* Welcome Header */}
        <div style={{ marginBottom: "20px" }}>
          <h1 className="welcome-title" style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
            Welcome to Your Learning Journey! 🎓
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.5" }}>
            Discover, learn, and master new skills with our comprehensive courses. Track your progress, join live sessions, and achieve your learning goals.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs" style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryTab(cat)}
              className="category-tab"
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                border: categoryTab === cat ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                backgroundColor: categoryTab === cat ? "#dcfce7" : "#ffffff",
                color: categoryTab === cat ? "#15803d" : "#374151",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* developement  */}
        {/* {categoryTab === "For You" && ( */}
        <>
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: "20px", alignItems: "start" }}>

          {/* CARD 1: Courses */}
          <div className="card-grid new" style={{ gridColumn: "1 / 3", borderRadius: "12px", overflow: "hidden", display: "grid", gridTemplateColumns: "65% 35%" }}>
            <div>
              <h2 className="card-title" style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 12px 0", lineHeight: "1.35" }}>
                Career Compass
              </h2>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 30px 20px 0", lineHeight: "1.65" }}>
                Explore different career paths and understand what industries are looking for today.
                Discover the skills required for each role and learn what you need to start building your career with confidence.
                See how professionals reached their positions and what steps helped them grow.
                Get clarity on which path matches your interests, strengths, and long-term goals.
              </p>
              <button onClick={() => navigate("/career")} style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                Start Exploring
              </button>
            </div>
            <div className="image-height" style={{ overflow: "hidden", height: "220px", borderRadius: "12px" }}>
              <img
                src={images.careerCompassDashboard}
                alt="Career Compass"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>

          {/* SIDEBAR CARD 1 */}
          <div className="sidebar-card" style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px", height: "100%" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 14px 0" }}>Personalized Learning Journey</h3>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px",boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}>
              <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                Your learning. Your pace. Your path.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.55" }}>
                Follow a personalized roadmap designed to help you build practical skills, track your progress, and move closer to your career goals.
              </p>
              <button  onClick={() => navigate('/ai-chat?new=true')} style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0, marginTop: "10px" }}>
                Continue Learning
              </button>
            </div>
          </div>

          {/* CARD 2: Interview */}
          {/* <div style={{ gridColumn: "1 / 3", borderRadius: "12px", overflow: "hidden", display: "grid", gridTemplateColumns: "35% 65%", gap: "20px" }}>
            <div style={{ overflow: "hidden", height: "220px", borderRadius: "12px" }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=85"
                alt="Interview"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0", lineHeight: "1.35" }}>
                Ace Your Interviews with Confidence
              </h2>
              <p style={{ fontSize: "13px", color: "#374151", fontWeight: "500", margin: "0 0 10px 0" }}>
                Practice smart. Improve fast. Perform better.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: "1.65" }}>
                Our Mock Interview feature simulates real interview scenarios to help you prepare with confidence. Get personalized feedback, identify your weak areas, and refine your communication, technical knowledge, and problem-solving skills. Walk into your next interview fully prepared — not nervous, but ready.
              </p>
              <button style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                Take Mock Interview
              </button>
            </div>
          </div> */}

          {/* SIDEBAR CARD 2 */}
          {/* <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", height: "100%" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#111827", margin: "0 0 14px 0" }}>Current Job Role demand with AI</h3>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px" }}>
              <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                You've walked the path — now light it for someone else.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.55" }}>
                Become a mentor and shape the next generation of learners. Become a mentor and shape the next generation of learners.
              </p>
            </div>
          </div> */}
        </div>

        <div className="two-col-grid" style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* LEFT: Two Live Course Cards */}
          <div className="course-cards-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", height: "100%" }}>
            {loadingCourses ? (
              <div style={{ gridColumn: "1 / 3", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
                {/* First Course Card */}
                {recentCourses.length > 0 ? (
                  <div
                    style={{
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Dark green card image area */}
                    <div
                      style={{
                        backgroundColor: "#0a2e1a",
                        padding: "0px",
                        position: "relative",
                        minHeight: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: "radial-gradient(ellipse at 60% 40%, #0f4a28 0%, #051a0e 100%)",
                        overflow: "hidden",
                      }}
                    >
                      {recentCourses[0].bannerUrl ? (
                        <img 
                          src={recentCourses[0].bannerUrl} 
                          alt="Course Banner" 
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <img src={images.coursebanner} alt="Course Banner" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      )}
                    </div>

                    {/* White card body */}
                    <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Badges */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a", display: "inline-block" }} />
                          Live Course
                        </span>
                      </div>

                      {/* Title */}
                      <p style={{ fontSize: "12px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {recentCourses[0].batchName || "Course Title"}
                      </p>

                      {/* Instructor */}
                      <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                        Trainer Name : {recentCourses[0].trainerList?.[0]?.trainerName || "Instructor"}
                      </p>

                      {/* Join button */}
                      <button
                        onClick={() => navigate(`/course/${recentCourses[0].id}`)}
                        style={{
                          marginTop: "4px",
                          width: "100%",
                          padding: "8px",
                          border: "1px solid var(--primary)",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          color: "var(--primary)",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "#f0fdf4"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#0a2e1a",
                        padding: "0px",
                        position: "relative",
                        minHeight: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: "radial-gradient(ellipse at 60% 40%, #0f4a28 0%, #051a0e 100%)",
                        overflow: "hidden",
                      }}
                    >
                      <img src={images.coursebanner} alt="Course Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a", display: "inline-block" }} />
                          Course
                        </span>
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>Coming Soon</span>
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.4" }}>
                        No Courses Available
                      </p>
                      <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                        Stay tuned for upcoming courses
                      </p>
                      <button
                        disabled
                        style={{
                          marginTop: "4px",
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                          color: "#9ca3af",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "not-allowed",
                        }}
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                )}

                {/* Second Course Card */}
                {recentCourses.length > 1 ? (
                  <div
                    style={{
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Dark green card image area */}
                    <div
                      style={{
                        backgroundColor: "#0a2e1a",
                        padding: "0px",
                        position: "relative",
                        minHeight: "100px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: "radial-gradient(ellipse at 60% 40%, #0f4a28 0%, #051a0e 100%)",
                        overflow: "hidden",
                      }}
                    >
                      {recentCourses[1].bannerUrl ? (
                        <img 
                          src={recentCourses[1].bannerUrl} 
                          alt="Course Banner" 
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <img src={images.coursebanner} alt="Course Banner" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      )}
                    </div>

                    {/* White card body */}
                    <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Badges */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a", display: "inline-block" }} />
                          Live Course
                        </span>
                      </div>

                      {/* Title */}
                      <p style={{ fontSize: "12px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {recentCourses[1].batchName || "Course Title"}
                      </p>

                      {/* Instructor */}
                      <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                        Trainer Name : {recentCourses[1].trainerList?.[0]?.trainerName || "Instructor"}
                      </p>

                      {/* Join button */}
                      <button
                        onClick={() => navigate(`/course/${recentCourses[1].id}`)}
                        style={{
                          marginTop: "4px",
                          width: "100%",
                          padding: "8px",
                          border: "1px solid var(--primary)",
                          borderRadius: "8px",
                          backgroundColor: "#fff",
                          color: "var(--primary)",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "#f0fdf4"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = "#fff"}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#0a2e1a",
                        padding: "0px",
                        position: "relative",
                        minHeight: "120px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: "radial-gradient(ellipse at 60% 40%, #0f4a28 0%, #051a0e 100%)",
                        overflow: "hidden",
                      }}
                    >
                      <img src={images.coursebanner} alt="Masterclass Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#16a34a", display: "inline-block" }} />
                          Course
                        </span>
                        <span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>Coming Soon</span>
                      </div>
                      <p style={{ fontSize: "12px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: "1.4" }}>
                        No Courses Available
                      </p>
                      <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                        Stay tuned for upcoming courses
                      </p>
                      <button
                        disabled
                        style={{
                          marginTop: "4px",
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "#f9fafb",
                          color: "#9ca3af",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "not-allowed",
                        }}
                      >
                        Coming Soon
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT: Live Learning text + dashboard screenshot */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <h2 className="section-title" style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0", lineHeight: "1.3" }}>
              Live Learning, Not Recorded Noise
            </h2>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0", lineHeight: "1.65" }}>
              Interactive learning. Real-time collaboration.
              Join live sessions, discussions, and workshops where mentors and learners connect to share knowledge and experiences.
            </p>
            {/* Dashboard screenshot image */}
            <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              flex: 1,
              maxHeight: "160px",
              height: "160px",
              backgroundColor: "#000",
              position: "relative", 
              cursor:"pointer"
            }}
             onClick={() => navigate("/learninghub/698c08c1a15033683e88035f/session/699ec6d5fe17126e16952587")}
          >
            <div
              style={{
                backgroundColor: "#0d1f12",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={images.learningHub}
                alt="Dashboard"
                style={{ height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Play Button */}
            <button
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "rgb(82, 82, 82)",
                // border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border:"solid 2px green",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)")}
            >
              ▶
            </button>
          </div>
          </div>
        </div>


        <div className="two-col-grid" style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "center" }}>

          <div className="image-height" style={{ position: "relative", borderRadius: "16px", overflow: "hidden", height: "250px" }}>
            <img
              src={images.aiMockInterview}
              alt="Candidate"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
            />
            {/* <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                width: "80px",
                height: "60px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={images.aiMockInterview}
                alt="Interviewer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div> */}
          </div>

          {/* RIGHT: Interview text */}
          <div>
            <h2 className="section-title" style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 10px 0", lineHeight: "1.3" }}>
              AI Mock Interview
            </h2>
            <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
              Practice interviews with AI and build real confidence.
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: "1.7" }}>
              Experience realistic interview scenarios designed to simulate real hiring conversations.
              Receive instant feedback on your answers and learn how to improve your communication and problem-solving skills.
              Discover what recruiters expect and how to present your answers effectively.
              Prepare yourself for real interviews by practicing again and again in a safe environment.
            </p>
          </div>
        </div>
        {/* <div style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "center" }}>

          

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 10px 0", lineHeight: "1.3" }}>
              Ace Your Interviews with Confidence
            </h2>
            <p style={{ fontSize: "13px", color: "#374151", fontWeight: "500", margin: "0 0 10px 0" }}>
              Practice smart. Improve fast. Perform better.
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: "1.7" }}>
              Our Mock Interview feature simulates real interview scenarios to help you prepare with confidence. Get personalized feedback, identify your weak areas, and refine your communication, technical knowledge, and problem-solving skills. Walk into your next interview fully prepared — not nervous, but ready.
            </p>
            <button
              style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0 }}
            >
              Take Mock Interview
            </button>
          </div>

          <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", height: "300px" }}>
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=85"
              alt="Candidate"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                width: "80px",
                height: "60px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt="Interviewer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </div> */}
        <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: "20px", alignItems: "start",marginTop:"40px", }}>

          {/* CARD 1: Courses */}
          <div className="card-grid new" style={{ gridColumn: "1 / 3", borderRadius: "12px", overflow: "hidden", display: "grid", gridTemplateColumns: "65% 35%",alignItems:"center", }}>
            <div>
              <h2 className="card-title" style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 12px 0", lineHeight: "1.35" }}>
                Build Your Future With Us
              </h2>
              <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}> Learn. Build. Grow. Together.</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 30px 20px 0", lineHeight: "1.65" }}>
                Become part of a growing ecosystem of learners who are focused on building real-world skills.
                Collaborate, learn from others, and take meaningful steps toward shaping your future career.
                Engage with people who share the same ambition to grow and succeed.
                Together, build knowledge, confidence, and opportunities for your future.
              </p>
              {/* <button onClick={() => navigate("/career")} style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                Start Exploring
              </button> */}
            </div>
            <div className="" style={{ overflow: "hidden", height: "220px", borderRadius: "12px" }}>
              <img
                src={images.build}
                alt="Career Compass"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>

          {/* SIDEBAR CARD 1 */}
          <div className="sidebar-card" style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px", height: "100%" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 14px 0" }}>Daily Skill Drop</h3>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px",boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}>
              <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                1 Skill. 10 Minutes. Every Day.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.55" }}>
                Upgrade your knowledge through short and focused daily learning sessions.
                Small learning steps every day can help you build strong skills over time.
              </p>
              {/* <button  onClick={() => navigate('/ai-chat?new=true')} style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0, marginTop: "10px" }}>
                Continue Learning
              </button> */}
            </div>
          </div>

          {/* CARD 2: Interview */}
          {/* <div style={{ gridColumn: "1 / 3", borderRadius: "12px", overflow: "hidden", display: "grid", gridTemplateColumns: "35% 65%", gap: "20px" }}>
            <div style={{ overflow: "hidden", height: "220px", borderRadius: "12px" }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=85"
                alt="Interview"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0", lineHeight: "1.35" }}>
                Ace Your Interviews with Confidence
              </h2>
              <p style={{ fontSize: "13px", color: "#374151", fontWeight: "500", margin: "0 0 10px 0" }}>
                Practice smart. Improve fast. Perform better.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: "1.65" }}>
                Our Mock Interview feature simulates real interview scenarios to help you prepare with confidence. Get personalized feedback, identify your weak areas, and refine your communication, technical knowledge, and problem-solving skills. Walk into your next interview fully prepared — not nervous, but ready.
              </p>
              <button style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                Take Mock Interview
              </button>
            </div>
          </div> */}

          {/* SIDEBAR CARD 2 */}
          {/* <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", height: "100%" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#111827", margin: "0 0 14px 0" }}>Current Job Role demand with AI</h3>
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px" }}>
              <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                You've walked the path — now light it for someone else.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.55" }}>
                Become a mentor and shape the next generation of learners. Become a mentor and shape the next generation of learners.
              </p>
            </div>
          </div> */}
        </div>
         <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: "20px",paddingTop:"30px", alignItems: "start" }}>

          {/* CARD 1: Courses */}

          {/* CARD 2: Interview */}
          <div className="card-grid" style={{ gridColumn: "1 / 3", borderRadius: "12px", overflow: "hidden", display: "grid", gridTemplateColumns: "35% 65%", gap: "20px",alignItems:"center" }}>
            <div className="image-height new" style={{ overflow: "hidden", height: "220px", borderRadius: "12px",}}>
              <img
                src={images.learningCommunity}
                alt="Interview"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div>
              <h2 className="card-title" style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0", lineHeight: "1.35", }}>
                Learning Community 
              </h2>
              <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                Grow together with learners like you.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: "1.65" }}>
                Ask questions, share ideas, and collaborate on learning challenges.
                Connect with other learners who are working toward similar career goals.
                Learn faster by exchanging knowledge and helping each other grow.
                Be part of a supportive environment where learning never stops.
              </p>
              <button  onClick={() => navigate("/community")} style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0,}}>
                Join the Community
              </button>
            </div>
          </div>

          {/* SIDEBAR CARD 2 */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px", height: "100%" }}>
            {/* <div style={{display:"flex",alignItems:"center",gap:"10px",margin: "0 0 14px 0"}}> */}
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 10px 0"  }}> Hackathon Arena</h3>
              {/* <img src={images.hackathon} alt="Hackathon" style={{width:"20px"}}/>
            </div> */}
            <div style={{ backgroundColor: "#f9fafb", borderRadius: "8px", padding: "14px",boxShadow:"rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}>
              <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                Build. Compete. Win.
              </p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: 0, lineHeight: "1.55" }}>
                Participate in hackathons and collaborate with other learners to create innovative solutions.
                Showcase your creativity, build projects, and gain recognition for your ideas.
              </p>
              {/* <button style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "600", fontSize: "13px", cursor: "pointer", padding: 0 }}>
                 Unlock Today’s Skill
              </button> */}
            </div>
          </div>
        </div> 

        
        <div className="two-col-grid" style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "center" }}>

          <div className="image-height" style={{ position: "relative", borderRadius: "16px", overflow: "hidden", height: "250px" }}>
            <img
              src={images.mentorDashboard}
              alt="Candidate"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
            />
            {/* <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                width: "80px",
                height: "60px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "2px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={images.aiMockInterview}
                alt="Interviewer"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div> */}
          </div>

          {/* RIGHT: Interview text */}
          <div className="mb-10">
            <h2 className="section-title" style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 10px 0", lineHeight: "1.3" }}>
              Mentors
            </h2>
            <p style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600", fontStyle: "italic", margin: "0 0 6px 0", lineHeight: "1.5" }}>
              Guidance from people who’ve been there.
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0", lineHeight: "1.7" }}>
              Connect with experienced mentors who understand the industry.
              Receive guidance, feedback, and advice that can help shape your learning and career journey.
              Learn from their experiences, mistakes, and success stories.
              Get clarity on decisions that can impact your professional growth.
              Discover insider tips that professionals use to grow faster in their careers.
              Ask your questions directly and gain insights that can change the way you approach your future.
            </p>
          </div>
        </div>
        </>
        {/* )} */}

        {/* {categoryTab === "Carrer Hub" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "20px 0" }}>Carrer Hub Content</h2>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>This is the Carrer Hub tab content.</p>
          </div>
        )}
        {categoryTab === "Community" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "20px 0" }}>Community Content</h2>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>This is the Community tab content.</p>
          </div>
        )}
        {categoryTab === "Feedback" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "20px 0" }}>Feedback Content</h2>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>This is the Feedback tab content.</p>
          </div>
        )}
        {categoryTab === "Weekly Challenges" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: "20px 0" }}>Weekly Challenges Content</h2>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>This is the Weekly Challenges tab content.</p>
          </div>
        )} */}
        
      </div>
    </div>
    </>
  );
};

export default Dashboard;