import { Box, Typography } from "@mui/material";
import { CalendarCheck, Folder, TrendingUp, Users, Award, Clock, BookOpen, Clock2, Calendar, ChevronRight,Layers } from "lucide-react";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { getBatchByTrainerId } from "../../features/trainerSlice";
import React from "react";
import { SidebarContext } from "../learner/ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";

// Dummy data
const dummyBatches = [
  {
    id: 1,
    batchName: "Full Stack Development - Batch A",
    batchDescription: "Complete MERN stack development course with hands-on projects and industry best practices",
    isPublish: true,
    status: "ACTIVE",
    batchSize: 32,
    enrolledStudents: 28,
    sessionCount: 34,
    totalSessions: 50,
    overAllPercentage: 68,
    attendance: 87,
    upcomingSessions: 3,
    modules: ["React", "Node.js", "MongoDB", "Express"],
    startDate: "2024-01-15",
    endDate: "2024-06-15"
  },
  {
    id: 2,
    batchName: "Python & AI Development - Batch B",
    batchDescription: "Advanced Python programming with machine learning and AI fundamentals",
    isPublish: false,
    status: "UPCOMING",
    batchSize: 25,
    enrolledStudents: 23,
    sessionCount: 28,
    totalSessions: 45,
    overAllPercentage: 62,
    attendance: 92,
    upcomingSessions: 2,
    modules: ["Python", "TensorFlow", "Pandas", "Scikit-learn"],
    startDate: "2024-02-01",
    endDate: "2024-07-01"
  },
  {
    id: 3,
    batchName: "DevOps & Cloud Computing - Batch C",
    batchDescription: "Comprehensive DevOps practices with AWS, Docker, and Kubernetes",
    isPublish: false,
    status: "DRAFT",
    batchSize: 20,
    enrolledStudents: 18,
    sessionCount: 15,
    totalSessions: 40,
    overAllPercentage: 37,
    attendance: 89,
    upcomingSessions: 5,
    modules: ["AWS", "Docker", "Kubernetes", "Jenkins"],
    startDate: "2024-03-01",
    endDate: "2024-08-01"
  },
  {
    id: 4,
    batchName: "Mobile App Development - Batch D",
    batchDescription: "Cross-platform mobile development using React Native and Flutter",
    isPublish: true,
    status: "ACTIVE",
    batchSize: 30,
    enrolledStudents: 26,
    sessionCount: 22,
    totalSessions: 42,
    overAllPercentage: 52,
    attendance: 85,
    upcomingSessions: 4,
    modules: ["React Native", "Flutter", "Firebase", "Redux"],
    startDate: "2024-01-20",
    endDate: "2024-06-20"
  }
];

const MyBatch = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [batches] = useState(dummyBatches);
  const [loading] = useState(false);
   const {userDetails} = useSelector((state: RootState) => state.ar);
  const {  batchSummary ,batchList} = useSelector((state: any) => state.trainer);
    const sidebarContext = React.useContext(SidebarContext);
  
  // Calculate stats from dummy data
  const stats = {
    total: batches.length,
    active: batches.filter(b => b.isPublish).length,
    students: batches.reduce((sum, b) => sum + b.enrolledStudents, 0),
    attendance: Math.round(batches.reduce((sum, b) => sum + b.attendance, 0) / batches.length)
  };
 const formatDateRange = (start: string, end: string) => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  };

  const startDate = new Date(start).toLocaleDateString("en-GB", options);
  const endDate = new Date(end).toLocaleDateString("en-GB", options);

  return `${startDate} - ${endDate}`;
};
const formattedBatches = (batchList || []).map((b: any) => {
  let status = "ACTIVE";

  if (b.isUpcoming) {
    status = "UPCOMING";
  } else if (b.isCompleted) {
    status = "COMPLETED";
  }

  return {
    id: b.id,
    batchName: b.batchName,
    batchDescription: b.batchDescription,
    students: b.studentCount,
    sessions: b.sessionCount,
    attendance: b.attendancePercentage,
    progress: b.overallProgress,
    upcoming: b.upcomingSessionCount,
    status,
    modules: [],
    duration: formatDateRange(b.batchStartDate, b.batchEndDate),
  };
});
useEffect(() => {
  if (userDetails?.id) {
    dispatch(
      getBatchByTrainerId({
        page: 0,
        size: 100,
        trainerId: userDetails.id,
      })
    );
  }
}, [userDetails?.id, dispatch]);
  return (
    <Box sx={{ bgcolor: "#F9FAFB", }}>
      <Box sx={{ borderBottom: "solid 1px var(--greyborder)",
          padding: "14px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", }}>
           <Box sx={{display: "flex",
          alignItems: "center",gap:"10px"}}>

                     {!sidebarContext?.sidebarOpen && (
                   <button 
                     onClick={sidebarContext?.toggleSidebar}
                     className={`${userDetails?.roles?.some((role: string) => role.toUpperCase() === 'ROLE_ADMIN') ? '' : 'md:hidden'} flex items-center justify-center p-1 mr-2`}
                   >
                     {/* <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" /> */}
                     <HiMiniBars3BottomLeft style={{color:"#000",fontSize:"22px",}}/>
                   </button>
                 )}
            <Box sx={{
              background: "var(--textfour)", padding: "6px",
              borderRadius: "4px", svg: { fontSize: "16px !important" },
            }}>
              <Layers  size={16} />
            </Box>

            <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>My Batch</Typography>
           </Box>
          </Box>

      <Box className="flex-1 p-6 max-w-6xl mx-auto w-full">
         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 2, mb: 3 }}>
        <Box sx={{ 
          bgcolor: "white", 
          border: "1px solid #E5E7EB", 
          borderRadius: 2, 
          p: 2.5,
          borderWidth: "1.6px",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
            borderWidth: "1.6px",
            borderColor: "#00B048"
          }
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: "#475467", fontWeight: 600 }}>Total Batches</Typography>
            <Folder size={20} color="#00B048" />
          </Box>
          <Typography sx={{ fontSize:24, fontWeight: 700, color: "#00B048" }}>{batchSummary?.totalBatches || '-'}</Typography>
        </Box>

        <Box sx={{ 
          bgcolor: "white", 
          border: "1px solid #E5E7EB", 
          borderRadius: 2, 
          p: 2.5,
          borderWidth: "1.6px",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
            borderWidth: "1.6px",
            borderColor: "#00B048"
          }
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: "#475467", fontWeight: 600 }}>Active Batches</Typography>
            <TrendingUp size={20} color="#00B048" />
          </Box>
          <Typography sx={{ fontSize:24, fontWeight: 700 }}>{batchSummary?.activeBatches || '-'}</Typography>
        </Box>

        <Box sx={{ 
          bgcolor: "white", 
          border: "1px solid #E5E7EB", 
          borderRadius: 2, 
          p: 2.5,
          transition: "all 0.3s ease",
          borderWidth: "1.6px",
          "&:hover": {
            background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
            borderWidth: "1.6px",
            borderColor: "#00B048"
          }
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: "#475467", fontWeight: 600 }}>Total Students</Typography>
            <Users size={20} color="#3B82F6" />
          </Box>
          <Typography sx={{ fontSize:24, fontWeight: 700 }}>{batchSummary?.totalStudents || '-'}</Typography>
        </Box>

        <Box sx={{ 
          bgcolor: "white", 
          border: "1px solid #E5E7EB", 
          borderRadius: 2, 
          p: 2.5,
          transition: "all 0.3s ease",
          borderWidth: "1.6px",
          "&:hover": {
            background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
            borderWidth: "1.6px",
            borderColor: "#00B048"
          }
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: "#475467", fontWeight: 600 }}>Avg Attendance</Typography>
            <Award size={20} color="#F59E0B" />
          </Box>
          <Typography sx={{ fontSize:24, fontWeight: 700 }}>{batchSummary?.averagePercentage}%</Typography>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : formattedBatches.length === 0 ? (
  <Typography sx={{ textAlign: "center", color: "#6B7280", mt: 4 }}>
    No batches found
  </Typography>
) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {formattedBatches.map((item:any) => (
            <Box
              key={item.id}
              onClick={() => navigate(`/course/${item.id}`)}
              sx={{
                bgcolor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                p: 3,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                 <Box sx={{display:"flex",justifyContent:"space-between"}}>
                   <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{item.batchName}</Typography>
                    <Box
                      sx={{
                        px: 1.5,
                        py: .3,
                        borderRadius: 10,
                        bgcolor: item.status === "ACTIVE" ? "#00B048" : item.status === "UPCOMING" ? "#3B82F6" : "#D593471A",
                        color: item.status === "ACTIVE" ? "#fff" : item.status === "UPCOMING" ? "#fff" : "#D59347",
                        fontSize: 10,
                        fontWeight: 400,
                      }}
                    >
                      {item.status}
                    </Box>
                  </Box>
                  <ChevronRight color=""/>
                 </Box>
                  <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 2 }}>{item.batchDescription}</Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2,alignItems:"center" }}>
        <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
  {item.duration}
</Typography>
                       {/*  {item.modules.map((mod, i) => (
                      <Box key={i} sx={{ px: 1, py: 0.3,margin:"0px 5px", borderRadius: 1, fontSize: 11, fontWeight: 600,background: "linear-gradient(45deg, #F0FDF4 0%, #DCFCE7 100%)",
            borderWidth: "1px",
            borderColor: "#00B048",color:"#00B048"}}>
                        {mod}
                      </Box>
                    ))} */}
                  </Box>

                  <Box sx={{ borderRadius: 1, p: 1, mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Overall Progress</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{item.progress}%</Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: "#E5E7EB", borderRadius: 1, overflow: "hidden" }}>
                      <Box sx={{ height: "100%", width: `${item.progress}%`, bgcolor: item.overAllPercentage < 50 ? "#F59E0B" : "#00B048", borderRadius: 1 }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2 }}>
                    <Box sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Users size={14} color="#00BF53" />
                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Students</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 700,display:"flex",alignItems:"end", }}>{item.students}
                      {/* <Typography sx={{ fontSize: 12, color: "#6B7280",fontWeight: 700 }}>{item.studentCount}</Typography> */}
                      </Typography>
                    </Box>

                    <Box sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <BookOpen size={14} color="#3B82F6" />
                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Sessions</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 700,display:"flex",alignItems:"end", }}>{item.sessions}
                      {/* <Typography sx={{ fontSize: 12, color: "#6B7280",fontWeight: 700 }}>{item.totalSessions}</Typography> */}
                      </Typography>
                    </Box>

                    <Box sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Clock2 size={14} color="#F59E0B" />
                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Upcoming</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.upcoming}</Typography>
                    </Box>

                    <Box sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Award size={14} color="#8B5CF6" />
                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Attendance</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.attendance}%</Typography>
                    </Box>

                    {/* <Box sx={{ bgcolor: "#F9FAFB", p: 1.5, borderRadius: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Calendar size={14} color="#EC4899" />
                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Duration</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{item.duration}</Typography>
                    </Box> */}
                  </Box>
                </Box>

                
              </Box>
            </Box>
          ))}
        </Box>
      )}
      </Box>
    </Box>
  );
};

export default MyBatch;
