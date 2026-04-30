import { useState } from "react";
import prefinalicon from "../../../assets/icon/prefinalicon.svg";
import finalyearicon from "../../../assets/icon/finalyearicon.svg";
import Professionalicon from "../../../assets/icon/Professionalicon.svg";
import employeeman from "../../../assets/image/employeeman.svg";
import { useNavigate } from "react-router-dom";

export default function Postverify() {
  const navigate = useNavigate();

  const studentOptions = [
    {
      value: "prefinal",
      label: "School Students",
      icon: prefinalicon,
      route: "/schoolstudents",
      points: [
        "Strengthen basics and explore career possibilities early.",
        "Learn smarter with guided lessons for school success.",
      ],
    },
    {
      value: "finalyear",
      label: "College Students",
      icon: finalyearicon,
      route: "/collegestudents",
      points: [
        "Become placement-ready with practical courses and real-world projects.",
        "Get skills employers look for and boost your career start.",
      ],
    },
    {
      value: "graduate",
      label: "Job Seekers",
      icon: employeeman,
      route: "/jobseekers",
      points: [
        "Build in-demand skills to secure your first job.",
        "Learn, practice, and launch your career.",
      ],
    },
    {
      value: "professional",
      label: "Working Professionals / Career Switchers",
      icon: Professionalicon,
      route: "/workingprofessionals",
      points: [
        "Upgrade skills or switch careers with structured, practical learning.",
        "Grow in your role or move to a new one confidently.",
      ],
    },
  ];

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4">
      {/* Heading */}
      <p className="text-lg md:text-xl font-[600] text-gray-800 text-center mb-10 md:mb-20">
        Tell us a bit about you so we can personalize your learning journey!
      </p>

      <div className="w-full flex justify-center px-4 sm:px-10 md:px-14">
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-screen-2xl mb-20">
          {studentOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleNavigation(option.route)}
              className="cursor-pointer border rounded-xl p-5 md:p-6 shadow-sm bg-white 
             transition-all hover:shadow-md hover:border-blue-500 hover:bg-card-hover"
            >
              {/* ICON */}
              <div className="flex justify-center mb-4">
                <img
                  src={option.icon}
                  alt={option.label}
                  className="w-10 h-10"
                />
              </div>

              {/* TITLE—Responsive fix */}
              <h3
                className={`text-center font-semibold text-gray-800 mb-3 
  text-sm md:text-base lg:text-sm lg:whitespace-nowrap`}
              >
                {option.label}
              </h3>

              {/* POINTS */}
              <ul className="text-xs md:text-sm text-gray-600 space-y-2">
                {option.points.map((item, idx) => (
                  <li key={idx} className="list-disc ml-4">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
