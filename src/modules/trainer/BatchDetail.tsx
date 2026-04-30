import { Box, Typography, Button, Chip } from "@mui/material";
import { Calendar, Clock, Globe, CheckCircle, Lock, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

// Dummy batch detail data
const batchDetailData = {
  id: 1,
  title: "Meta Full Stack Developer: Front-End & Back-End from Scratch Specialization",
  description: "Start your journey as a full-stack developer. Develop job-ready AI-powered skills and earn a certificate from Microsoft. No experience required",
  startDate: "22nd July, 2025",
  endDate: "30th August, 2025",
  languages: ["English", "Hindi", "4 more languages"],
  totalSessions: 12,
  completedPercentage: 40,
  remainingSessions: 8,
  nextSession: {
    title: "Variables & Data Types",
    date: "Tuesday 22th July, 2025 & 6 PM - GST"
  },
  upcomingSession: {
    title: "Advanced React Hooks",
    date: "25th August, 2025 - 10:00 AM"
  },
  sessions: [
    {
      id: 1,
      title: "Introduction to React & Modern JavaScript",
      date: "July 22, 2025",
      duration: "1h 30m",
      completed: true
    },
    {
      id: 2,
      title: "State Management with Hooks",
      date: "July 24, 2025", 
      duration: "1h 45m",
      completed: true
    },
    {
      id: 3,
      title: "Advance React Hooks",
      date: "July 26, 2025",
      duration: "2h 00m",
      completed: false
    }
  ]
};

const BatchDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Course Sessions");
  const tabs = ["Course Sessions", "Documents", "Calendar", "Comments"];

  return (
    <Box sx={{ bgcolor: "white", minHeight: "100vh", p: 4 }}>
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        {/* Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
          <Box sx={{ flex: 1, pr: 4 }}>
            <Typography sx={{ fontSize: 32, fontWeight: 700, mb: 2, color: "#1a1a1a" }}>
              {batchDetailData.title}
            </Typography>
            <Typography sx={{ fontSize: 16, color: "#666", mb: 3, lineHeight: 1.5 }}>
              {batchDetailData.description}
            </Typography>

            {/* Course Info */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Calendar size={16} color="#666" />
                <Typography sx={{ fontSize: 14, color: "#666" }}>
                  Course start date & end date : {batchDetailData.startDate} - {batchDetailData.endDate}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Globe size={16} color="#666" />
                <Typography sx={{ fontSize: 14, color: "#666" }}>
                  {batchDetailData.languages.join(", ")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Clock size={16} color="#666" />
                <Typography sx={{ fontSize: 14, color: "#666" }}>
                  {batchDetailData.totalSessions} Sessions ~ Totally
                </Typography>
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                  {batchDetailData.completedPercentage}% Completed
                </Typography>
                <Typography sx={{ fontSize: 14, color: "#666" }}>
                  {batchDetailData.remainingSessions} Session remaining
                </Typography>
              </Box>
              <Box sx={{ height: 8, bgcolor: "#e5e5e5", borderRadius: 1, overflow: "hidden" }}>
                <Box sx={{ 
                  height: "100%", 
                  width: `${batchDetailData.completedPercentage}%`, 
                  bgcolor: "#22c55e", 
                  borderRadius: 1 
                }} />
              </Box>
            </Box>
          </Box>

          {/* Right Side Card */}
          <Box sx={{ width: "320px" }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
              <Chip label="Popular Choices" size="small" sx={{ bgcolor: "#f3f4f6", color: "#666" }} />
              <Chip label="● Industry Best" size="small" sx={{ bgcolor: "#f3f4f6", color: "#666" }} />
            </Box>
            
            <Box sx={{ bgcolor: "#f8f9fa", borderRadius: 2, p: 3, border: "1px solid #e5e7eb" }}>
              <Typography sx={{ fontSize: 14, color: "#666", mb: 2 }}>Main Course</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Box sx={{ 
                  width: 48, 
                  height: 48, 
                  bgcolor: "#1d4ed8", 
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Typography sx={{ color: "white", fontSize: 20, fontWeight: 700 }}>M</Typography>
                </Box>
                <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                  Meta Full Stack Development
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>
                Next Session : {batchDetailData.nextSession.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Calendar size={16} color="#22c55e" />
                <Typography sx={{ fontSize: 14, color: "#22c55e" }}>
                  {batchDetailData.nextSession.date}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Next Session Card */}
        <Box sx={{ 
          bgcolor: "#f0fdf4", 
          border: "2px solid #22c55e", 
          borderRadius: 2, 
          p: 3, 
          mb: 4
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: 14, color: "#666", mb: 1 }}>Next Session</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>
                {batchDetailData.upcomingSession.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Calendar size={16} color="#666" />
                <Typography sx={{ fontSize: 14, color: "#666" }}>
                  {batchDetailData.upcomingSession.date}
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: "#22c55e", 
                "&:hover": { bgcolor: "#16a34a" },
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Start Session
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: "1px solid #e5e7eb", mb: 3 }}>
          <Box sx={{ display: "flex", gap: 6 }}>
            {tabs.map((tab) => (
              <Typography
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  fontSize: 16,
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? "#1a1a1a" : "#666",
                  pb: 2,
                  borderBottom: activeTab === tab ? "2px solid #1a1a1a" : "none",
                  cursor: "pointer"
                }}
              >
                {tab}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Sessions List */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {batchDetailData.sessions.map((session) => (
            <Box
              key={session.id}
              sx={{
                bgcolor: session.completed ? "#f0fdf4" : "white",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                "&:hover": { bgcolor: session.completed ? "#ecfdf5" : "#f9fafb" }
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: session.completed ? "#22c55e" : "#e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {session.completed ? (
                    <CheckCircle size={20} color="white" />
                  ) : (
                    <Lock size={16} color="#666" />
                  )}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
                    {session.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Calendar size={14} color="#666" />
                      <Typography sx={{ fontSize: 14, color: "#666" }}>
                        {session.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Clock size={14} color="#666" />
                      <Typography sx={{ fontSize: 14, color: "#666" }}>
                        {session.duration}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <ChevronRight size={20} color="#666" />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default BatchDetail;