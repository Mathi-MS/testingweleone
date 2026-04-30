import { Typography } from "@mui/material";
import { BookOpen, Coffee, LucideCalendar, Play } from "lucide-react";
import React, { useState } from "react";
import courseBg from "../../../assets/image/Images/course-bg.webp"
const Card = ({ children, className = "" }:any) => (
  <div className={`bg-white border rounded-xl p-4 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, primary }:any) => (
 <button
  className={`w-full mt-3 py-2 rounded-md text-sm font-semibold ${
    primary
      ? "bg-[#00BF53] text-white"
      : "border text-[#00BF53] hover:bg-[#00BF53]/10"
  }`}
>
  {children}
</button>
);

export const LearnerDashboard = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  if (showDashboard) {
    return <div className="p-6">Dashboard Component Here</div>;
  }

  return (
   <div
      style={{
        background: "#fff",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "16px",
      }}
    >
      {/* Toggle Buttons */}
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
            gap: "6px",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "4px",
            width: "100%",
            maxWidth: "260px",
          }}
        >
          <button
            onClick={() => setShowDashboard(true)}
            className={`px-4 py-2 text-sm rounded-md ${
              showDashboard
                ? "bg-green-600 text-white"
                : "text-gray-500"
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setShowDashboard(false)}
            className={`px-4 py-2 text-sm rounded-md ${
              !showDashboard
                ? "bg-green-600 text-white"
                : "text-gray-500"
            }`}
          >
            My Space
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#111827" }}>
          Welcome to Your Learning Journey! 🎓
        </Typography>
        <Typography sx={{ fontSize: "14px", color: "#374151", fontWeight:400}}>
          Discover, learn, and master new skills with our comTypographyrehensive courses.
          Track your progress, join live sessions, and achieve your learning goals.
        </Typography>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Card>     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <LucideCalendar size={16} />

      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Upcoming Session
      </Typography>
    </div>
         <p className="text-xs text-gray-500 mt-1">
            React Advanced Patterns
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Yesterday, 10:00 AM |  30-03-2026
          </p>
          <Button primary>Join Now</Button>
        </Card>

        <Card>
          
          
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <LucideCalendar size={16} />

      <Typography
        sx={{
          fontSize: "18px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Previous Session
      </Typography>
    </div>
          <p className="text-xs text-gray-500 mt-1">
            React Advanced Patterns
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Yesterday, 10:00 AM |  30-03-2026
          </p>
          <Button  >View Recording</Button>
        </Card>

        <Card>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <LucideCalendar size={16} />

      <Typography
        sx={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        My Recent Track
      </Typography>
    </div>
          {/* <p className="text-sm font-semibold">My Recent Track</p> */}
          <p className="text-xs text-gray-500 mt-1">
            Fullstack Development
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Primary: Frontend | Secondary: Backend
          </p>
          <Button primary>Join Now</Button>
        </Card>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-4">

          {/* Course Card */}
        <div className="w-[320px] rounded-2xl shadow-md overflow-hidden bg-white">
      
      {/* Header */}
      <div   className={`p-3 bg-cover bg-top ${ ""}`}
        style={{
          backgroundImage: `url(${ courseBg})`,
        }}>
        <p className="text-xs text-gray-500 mb-2">Main Course</p>

        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-base text-gray-800">
            Java Developer
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        
        {/* Sessions */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <BookOpen className="w-4 h-4" />
          <span>12 Sessions</span>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-medium text-gray-700">65%</span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-green-500 rounded-full w-[65%]" />
          </div>
        </div>

        {/* Current Session */}
        <p className="text-xs text-gray-500 mt-4">Current Session:</p>
        <p className="text-sm font-semibold text-gray-800">
          Session 8: Spring Boot Fundamentals
        </p>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm font-medium">
            View Course
          </button>

          <button className="flex-1 flex items-center justify-center gap-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Play className="w-4 h-4" />
            Join Session
          </button>
        </div>
      </div>
    </div>
          {/* Trainer Chat */}
          <Card>
            <h3 className="text-sm font-semibold mb-3">
              Trainer Chats
            </h3>

            <div className="text-xs text-gray-500 space-y-2">
              <p><b>Trainer:</b> Great explanation of variable hoisting!</p>
              <p><b>You:</b> Could you explain const vs let?</p>
            </div>

            <Button>View Trainer chat</Button>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">

          {/* Attendance */}
          <Card>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Attendance</h3>
              <span className="text-xs text-green-600 cursor-pointer">
                View more
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              <div className="bg-green-100 p-2 rounded">
                04 <br /> Present
              </div>
              <div className="bg-red-100 p-2 rounded">
                01 <br /> Absent
              </div>
              <div className="bg-yellow-100 p-2 rounded">
                01 <br /> Drop
              </div>
              <div className="bg-gray-100 p-2 rounded">
                01 <br /> Late
              </div>
            </div>
          </Card>

          {/* Assessments */}
          <Card>
            <h3 className="text-sm font-semibold mb-3">
              My Assessments
            </h3>

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="text-sm">JavaScript Logical</p>
                  <p className="text-xs text-gray-400">
                    03-04-2026 | 12:10
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">42/45</p>
                  <p className="text-xs text-green-600 cursor-pointer">
                    Take Re-test
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}