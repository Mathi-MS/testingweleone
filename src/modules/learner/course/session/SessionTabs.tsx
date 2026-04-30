import React, { useEffect } from "react";
import {
  ClipboardList,
  FileText,
  MessageSquare,
  Bot,
  Users,
  Sparkles,
  Star,
  GraduationCap
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Comments } from "./Comments";
import { TrainerChat } from "./TrainerChat";
import { Assessment } from "./Assessment";
import Feedback from "./common/Feedback";

import { useAppSelector } from "../../../../app/hook";
import { SessionDocument } from "./SessionDocument";

interface SessionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSticky?: boolean;
  testStats: { completed: number; averageScore: number };
  assessments: any[];
  userId?: string;
  username?: string;
  courseId?: string;
}

export function SessionTabs({
  activeTab,
  onTabChange,
  isSticky = false,
  testStats,
  assessments,
  userId,
  username,
  courseId,
}: SessionTabsProps) {
  const { sessionId } = useParams();
  const { userDetails } = useAppSelector((state) => state.ar);
  // const [refreshKey, setRefreshKey] = React.useState(0);

  // useEffect(() => {
  //   if (activeTab === "comments") {
  //     const interval = setInterval(() => {
  //       setRefreshKey((prev) => prev + 1);
  //     }, 5000);
  //     return () => clearInterval(interval);
  //   }
  // }, [activeTab]);
const ROLE_TRAINER = userDetails?.roles?.some(
  (role: string) => role.toUpperCase() === "ROLE_TRAINER"
);
  const tabs = [
    { id: "assessment", label: "Assessment", icon: ClipboardList },
    { id: "comments", label: "Comments", icon: MessageSquare },
    // { id: "colearners", label: "Co-learners", icon: Users },
    { id: "feedback", label: "Feedback", icon: Star },
  //    {
  //   id: "Project",
  //   label: ROLE_TRAINER ? "Student Project" : "My Project",
  //   icon: GraduationCap,
  // },
     {
    id: "Document",
    label: "Document",
    icon: GraduationCap,
  },
    // { id: "trainerChat", label: "Trainer Chat", icon: Star },
  ];

  return (
    <>
      <div
        className={`flex border-b transition-shadow overflow-x-auto red-scrollbar`}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id
                ? "border-gray-500 text-dark-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              {label}
            </div>
          </button>
        ))}
      </div>

      <div className="pb-8 mt-4 sm:mt-8">
        {activeTab === "assessment" && (
          <Assessment testStats={testStats} assessments={assessments} />
        )}
        {activeTab === "notes" && (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
            <p className="text-xs sm:text-sm">
              No notes available for this session yet.
            </p>
          </div>
        )}
        {activeTab === "comments" && <Comments sessionId={sessionId || ""} />}
        {activeTab === "feedback" && (
          <Feedback
            onClose={() => {}}
            sessionId={sessionId || ""}
            courseId={courseId}
            userId={userId || ""}
            username={username}
            userType="student"
          />
        )}
        {/* {activeTab === "Project" && (
          <LearnerProject
            // onClose={() => {}}
            // sessionId={sessionId || ""}
            // courseId={courseId}
            // userId={userId || ""}
            // username={username}
            // userType="student"
          />
        )} */}
        {activeTab === "Document" && (
          <SessionDocument
            // onClose={() => {}}
            // sessionId={sessionId || ""}
            // courseId={courseId}
            // userId={userId || ""}
            // username={username}
            // userType="student"
          />
        )}
        {activeTab === "trainerChat" && <TrainerChat />}
        {/* {activeTab === "colearners" && (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
            <p className="text-xs sm:text-sm">
              No co-learners found for this session.
            </p>
          </div>
        )} */}
        {activeTab === "history" && (
          <div className="text-center py-8 sm:py-12 text-gray-500">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
            <p className="text-xs sm:text-sm">
              No session history available yet.
            </p>
          </div>
        )}
        
      </div>
    </>
  );
}
