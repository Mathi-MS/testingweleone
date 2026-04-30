import { Compass, MessageCircle, BookOpen, Users, GraduationCap, PlayCircle, LayoutDashboard, Building2, Calendar, ChartBar } from "lucide-react"
import { AuthHeaderControls } from "../auth/AuthHeaderControls"
import { useLocation } from "react-router-dom"
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { ReactNode } from "react";

interface UniversalHeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen: boolean;
  rightActions?: ReactNode; // ✅ slot for page-specific actions (search, filter, add)
}

const UniversalHeader = ({ onToggleSidebar, sidebarOpen, rightActions }: UniversalHeaderProps) => {
  const location = useLocation();
  const { userDetails } = useSelector((state: RootState) => state.ar);

  if (
    location.pathname.startsWith('/community/chat/') ||
    location.pathname.startsWith('/learninghub/details/') ||
    location.pathname.startsWith('/course/') ||
    location.pathname === '/trainer/mybatch' ||
    location.pathname.includes('/session/') ||
    location.pathname.includes('/learner-dashboar')||
    location.pathname.includes('/admin')||
    location.pathname.includes('/mychats')
  ) {
    return null;
  }

  const getHeaderContent = () => {
    const path = location.pathname;

    if (path === '/ai-chat' && new URLSearchParams(location.search).get('new') === 'true') {
      return { icon: MessageCircle, title: 'New Chat' };
    } else if (path === '/ai-chat') {
      return { icon: MessageCircle, title: 'AI Chat' };
    } else if (path === '/ai-chat/history') {
      return { icon: MessageCircle, title: 'Chat History' };
    } else if (path === '/learninghub') {
      return { icon: BookOpen, title: 'Learning Hub' };
    } else if (path.startsWith('/learninghub/details/')) {
      return { icon: BookOpen, title: 'Learning Hub Details' };
    } else if (path === '/community') {
      return { icon: Users, title: 'Learning Community' };
    } else if (path.startsWith('/community/chat/')) {
      return { icon: Users, title: 'Community Chat' };
    } else if (path === '/career') {
      return { icon: Compass, title: 'Career Compass' };
    } else if (path === '/CourseLearner') {
      return { icon: GraduationCap, title: 'Courses' };
    } else if (path.startsWith('/course/')) {
      return { icon: GraduationCap, title: 'Course Details' };
    } else if (path === '/masterclass') {
      return { icon: PlayCircle, title: 'Masterclass' };
    } else if (path === '/trainer/trainercalendar') {
      return { icon: Calendar, title: 'Trainer Calender' };
    } else if (path === '/learnercalendar') {
      return { icon: Calendar, title: 'Learner Calendar' };
    } else if (path === '/') {
      return { icon: LayoutDashboard, title: 'Dashboard' };
    } else if (path === '/admin/dashboard'){
      return { icon: ChartBar, title: 'Admin Dashboard' };
    } else if (path.startsWith('/admin')) {
      const adminPath = path.split('/')[2];
      if (adminPath === 'microlearning') return { icon: BookOpen, title: 'Admin panel' };
      if (adminPath === 'courses') return { icon: GraduationCap, title: 'Admin panel' };
      if (adminPath === 'books') return { icon: BookOpen, title: 'Admin panel' };
      if (adminPath === 'chapters') return { icon: BookOpen, title: 'Admin panel' };
      if (adminPath === 'entity') return { icon: Building2, title: 'Entity' };
      if (adminPath === 'batch') return { icon: Users, title: 'Admin panel' };
      return { icon: LayoutDashboard, title: 'Admin panel' };
    }

    return { icon: LayoutDashboard, title: 'Dashboard' };
  };

  const { icon: Icon, title } = getHeaderContent();

  return (
    <div className="border-b border-[#0d0d0d0d] bg-white px-4 py-0">
      <div className="flex items-center justify-between">

        {/* LEFT: sidebar toggle + page title */}
        <div className="flex items-center space-x-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className={`${userDetails?.roles?.some(role => role.toUpperCase() === 'ROLE_ADMIN') ? '' : 'md:hidden'} flex items-center justify-center p-1`}
            >
              <HiMiniBars3BottomLeft style={{ color: "#000", fontSize: "22px" }} />
            </button>
          )}
          <h1 className="text-md text-gray-900 flex items-center">
            <Icon size={16} className="mr-2" />
            {title}
          </h1>
        </div>

        {/* RIGHT: page actions + auth controls on same line */}
        <div className="flex items-center gap-3 py-2 px-4">
          {rightActions && (
            <div className="flex items-center gap-3">
              {rightActions}
            </div>
          )}
          <AuthHeaderControls />
        </div>

      </div>
    </div>
  );
}

export default UniversalHeader;