import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { ChatTextIcon } from "@phosphor-icons/react";
import { logout } from "../../features/authSlice";
import {
  ChevronDown,
  ChevronUp,
  TvMinimalPlay,
  LogOut,
  LayoutDashboard,
  Book,
  LibraryBig,
  NotebookPen,
  Microchip,
  CalendarCheck as Vote,
  UsersRound,
  Shield, Compass,
  MessageSquare, Clock, ArrowRight,
  GraduationCap,
  LucideBookOpen,
  LucideCalendar,
  PlayCircle,
  ChartBar,
  Users,
  FileText,
  Ticket,
  Layers ,
  Calendar,
  Building2
} from "lucide-react";
import { aiApi } from "../../services/aiApi";
import { images } from "../../assets/image/Images";
import ConfirmDialog from "../custom/ConfirmDialog";
import SettingsDialog from "../../features/SettingsDialog";
import { Tooltip } from "@mui/material";
// import SettingsDialog from "../../features/SettingsDialog";
const icons: any = { LayoutDashboard, TvMinimalPlay, Book, NotebookPen, Vote, UsersRound, Compass, GraduationCap, LucideBookOpen, LucideCalendar, Users, FileText, ChartBar,Ticket ,Calendar,Layers, ChatTextIcon,Building2 };

const childIcons: any = {
  UserList: NotebookPen,
  AddUser: LibraryBig,
  General: Microchip,
  Security: Shield,
  Book: Book,
  Learners: UsersRound,
  GraduationCap:GraduationCap,
  LucideCalendar:LucideCalendar,
  LucideBookOpen:LucideBookOpen,
  Compass:Compass
};

const sidebarMenu = [
  // { type: "link", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard", roles: ["ROLE_ADMIN", "ROLE_MENTOR", "ROLE_TRAINER", "ROLE_EDUCATOR"] },
  { type: "link", label: "Dashboard", icon: "LayoutDashboard", path: "/", roles: [,"ROLE_ADMIN","ROLE_TRAINER", "ROLE_EDUCATOR","ROLE_LEARNER"] },
  { type: "link", label: "Admin Dashboard", icon: "ChartBar", path: "/admin/dashboard", roles: ["ROLE_ADMIN"] },
  { type: "link", label: "Learning Hub", icon: "LucideBookOpen", path: "/learninghub", roles: [,"ROLE_ADMIN","ROLE_TRAINER", "ROLE_EDUCATOR","ROLE_LEARNER"] },
  // { type: "link", label: "Learner Calendar", icon: "Calendar", path: "/learnercalendar", roles: ["ROLE_LEARNER"] },
  { type: "link", label: "Learner Calendar", icon: "Calendar", path: "/learnercalendar", roles: ["ROLE_LEARNER"], excludeRoles: ["ROLE_TRAINER", "ROLE_ADMIN"] },
  {
    type: "dropdown",
    label: "Content",
    icon: "TvMinimalPlay",
    roles: ["ROLE_ADMIN"],
    children: [
      { label: "Courses", icon: "Book", path: "/admin/courses" },
      { label: "Books", icon: "AddUser", path: "/admin/book" },
      { label: "Chapters", icon: "UserList", path: "/admin/chapter" },
      { label: "Micro learners", icon: "General", path: "/admin/microlearning" },

    ],
  },
  { type: "link", label: "Batch", icon: "Vote", path: "/admin/batch", roles: ["ROLE_ADMIN"] },
  { type: "link", label: "Coupon code ", icon:"Ticket", path: "/admin/referralcode", roles: ["ROLE_ADMIN",] },
  { type: "link", label: "Entity Management ", icon:"Building2", path: "/admin/entity", roles: ["ROLE_ADMIN",] },
  { type: "link", label: "My Batch", icon: "Layers", path: "/trainer/mybatch", roles: ["ROLE_TRAINER","ROLE_ADMIN"] },
  { type: "link", label: "Trainer Calendar", icon: "Calendar", path: "/trainer/trainercalendar", roles: ["ROLE_TRAINER"] },
  { type: "link", label: "My Chats", icon: "ChatTextIcon", path: "/trainer/mychats", roles: ["ROLE_ADMIN", "ROLE_TRAINER"] },


  
  // {  
  //   type: "dropdown",
  //   label: "Users",
  //   icon: "Users",
  //   roles: ["ROLE_ADMIN"],
  //   children: [
  //     { label: "Learners", icon: "Learners", path: "/admin/users/learners" },
  //   ],
  // },
  { type: "link", label: "Learning Community", icon: "UsersRound", path: "/community", roles: ["ROLE_ADMIN","ROLE_LEARNER"] },
  { type: "link", label: "Career Compass", icon: "Compass", path: "/career", roles: [ "ROLE_LEARNER",] },
  { type: "link", label: "Courses", icon: "GraduationCap", path: "/CourseLearner", roles: ["ROLE_ADMIN", "ROLE_LEARNER", "ROLE_MENTOR", "ROLE_TRAINER", "ROLE_EDUCATOR"] },
  { type: "link", label: "Masterclass", icon: "LucideCalendar", path: "/masterclass", roles: ["ROLE_ADMIN", "ROLE_LEARNER", "ROLE_MENTOR", "ROLE_TRAINER", "ROLE_EDUCATOR"] },
    {
    type: "link",
    label: "Blog",
    icon: "FileText",
    roles: ["ROLE_ADMIN"],
    path: "/blog",
  },
    {
    type: "link",
    label: "Newsletter",
    icon: "FileText",
    roles: ["ROLE_ADMIN"],
    path: "/newsletter",
  },
    {
    type: "dropdown",
    label: "Reports",
    icon: "FileText",
    roles: ["ROLE_ADMIN"],
    children: [
      { label: "CoursesReport", icon: "GraduationCap", path: "/admin/CoursesReport" },
      { label: "MasterclassReport", icon: "LucideCalendar", path: "/admin/MasterclassReport" },
      { label: "CareercompassReport", icon: "Compass", path: "/admin/careercompassReport" },
    ],
  },

];
const AUTHENTICATED_ALLOWED_MENUS = ["Learning Community"];

const Sidebar = ({ open, setOpen }: { open: boolean; setOpen: any }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userDetails, accessToken } = useSelector((state: RootState) => state.ar);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<any>({});
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  useEffect(() => {
    if (userDetails && accessToken) {
      loadChats();
    }
  }, [userDetails, accessToken]);

  // Listen for chat updates from other components
  useEffect(() => {
    const handleChatUpdate = () => {
      if (userDetails && accessToken) {
        loadChats();
      }
    };
    
    window.addEventListener('chatListUpdate', handleChatUpdate);
    return () => window.removeEventListener('chatListUpdate', handleChatUpdate);
  }, [userDetails, accessToken]);

  const loadChats = async () => {
    try {
      if (accessToken && userDetails?.id) {
        const data = await aiApi.getChats(accessToken, userDetails.id);
        setChats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDropdown = (label: string) => {
    setDropdownOpen((prev: any) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = () => {
    dispatch(logout());
    setLogoutDialogOpen(false);
    navigate("/");
  };

  const activePath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isLearnerOrTrainer = userDetails?.roles?.some((role: string) => 
    ["ROLE_LEARNER", "ROLE_TRAINER","ROLE_MENTOR", "ROLE_EDUCATOR"].includes(role.toUpperCase())
  ) && !userDetails?.roles?.some((role: string) => 
    ["ROLE_ADMIN", ].includes(role.toUpperCase())
  );

  const isPathActive = (menuPath: string) => {
    if (menuPath === '/CourseLearner') {
      if (activePath === menuPath) return true;
      if (activePath.startsWith('/course/')) {
        const courseId = activePath.split('/')[2];
        const isMasterClass = sessionStorage.getItem(`course_${courseId}_isMasterClass`) === 'true';
        return !isMasterClass;
      }
      return false;
    }
    if (menuPath === '/masterclass') {
      if (activePath === menuPath) return true;
      if (activePath.startsWith('/course/')) {
        const courseId = activePath.split('/')[2];
        const isMasterClass = sessionStorage.getItem(`course_${courseId}_isMasterClass`) === 'true';
        return isMasterClass;
      }
      return false;
    }
    if (menuPath === '/learninghub') {
      if (activePath === menuPath) return true;
      if (activePath.startsWith('/learninghub/')) return true;
      return false;
    }
    return activePath === menuPath;
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 768) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    if (window.innerWidth <= 768) setOpen(false);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if ((isLearnerOrTrainer || !userDetails) && windowWidth > 768) {
    return (
      <aside className={`h-screen bg-[var(--texttwo)] border-r border-[var(--greyborder)] flex flex-col transition-[width] duration-300 overflow-hidden md:relative fixed top-0 left-0 z-[99] bg-white ${!open ? "w-0" : isCollapsed ? "w-[60px]" : "w-[238px]"}`}
        style={{ visibility: open ? "visible" : "hidden" }}
      >
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-4 py-3`}>
          {isCollapsed ? (
            <div className="group relative">
              <img
                src={images.favicon}
                alt="Favicon"
                className="w-[24px] h-[24px] cursor-pointer group-hover:opacity-0 transition-opacity"
                onClick={() => setIsCollapsed(false)}
              />
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" />
                {/* <ChartBar /> */}
              </button>
            </div>
          ) : (
            <>
              <img
                src={images.logo}
                alt="Logo"
                className="w-[100px] cursor-pointer"
                onClick={() => navigate("")}
              />
              <button
                onClick={() => setIsCollapsed(true)}
                className="flex items-center justify-center"
              >
                <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" />
              </button>
            </>
          )}
        </div>
        {!isCollapsed && (
        <div className="px-4 py-4 pb-0 font-[900] text-[var(--textlight)] text-[12px]">
        Main Menu
      </div>
        )}
      {open && (
        <Tooltip title={isCollapsed ? "New Chat" : ""} placement="right" arrow>
          <div
            onClick={() => navigate('/ai-chat?new=true')}
            className={`flex items-center w-full px-4 py-2 cursor-pointer transition-colors hover:bg-black/5 ${isCollapsed ? "justify-center" : ""} relative group`}
          >
            <div className={`${isCollapsed ? "w-6 h-6" : "w-10 min-w-[40px] mr-2.5 rounded-lg"} flex items-center justify-center`}>
              {<MessageSquare size={isCollapsed ? 20 : 16} />}
            </div>
                    {!isCollapsed && (
                      <span className="text-[13px] text-[var(--textone)]">New Chat</span>
                    )}
          </div>
        </Tooltip>
        )}
        <nav className="px-0 flex-grow">
          {sidebarMenu
            // .filter((item) => {
            //   if (!userDetails?.roles) {
            //     return ["Dashboard", "Career Compass", "Courses", "Masterclass"].includes(item.label);
            //   }
            //   const userRoles = userDetails?.roles?.map(r => r.toUpperCase()) || [];
            //   return item.roles?.some(role => userRoles.includes(role as any));
            // })
            .filter((item) => {
  if (!userDetails?.roles) {
    return ["Dashboard", "Career Compass", "Courses", "Masterclass"].includes(item.label);
  }
  const userRoles = userDetails?.roles?.map(r => r.toUpperCase()) || [];
  
  // Add this check
  if (item.excludeRoles?.some((role: string) => userRoles.includes(role))) {
    return false;
  }
  
  return item.roles?.some((role: any) => userRoles.includes(role));
})
            .map((item, index) => {
              const IconComp = icons[item.icon];
              const isActive = item.type === "link" && item.path && isPathActive(item.path);

              return (
                item.type === "link" && (
                  <>
                <Tooltip title={isCollapsed ? item.label : ""} placement="right" arrow>
                  <div
                    key={index}
                    onClick={() => item.path && navigate(item.path)}
                    className={`flex items-center w-full px-4 py-2 cursor-pointer transition-colors hover:bg-black/5 ${isCollapsed ? "justify-center" : ""} relative group`}
                  >
                      <div
                      className={`${isCollapsed ? "w-6 h-6" : "w-10 min-w-[40px] mr-2.5 rounded-lg"} flex items-center justify-center ${isActive ? "text-[var(--primary)]" : "text-[var(--text)]"}`}
                      >
                        {IconComp && <IconComp size={isCollapsed ? 20 : 16} />}
                      </div>
                    {!isCollapsed && (
                      <span className={`text-[13px] ${isActive ? "text-[var(--primary)]" : "text-[var(--textone)]"}`}>
                        {item.label}
                      </span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Tooltip>
                </>
                )
              );
            })}
          {/* Chat History Section */}
          {!isCollapsed && (
        <>
          {userDetails && open && (
          <div className="flex-1 overflow-y-auto px-0">
            <div className="px-4 py-2 font-[900] text-[var(--textlight)] text-[12px] tracking-wider mt-4">
              Your Chats
            </div>

            <div className="flex items-center justify-between mb-2 px-4 py-2">
              <div className="flex items-center w-full gap-2 text-sm font-medium text-gray-700">
                <div className="w-10 min-w-[40px] rounded-lg flex items-center justify-center text-gray-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Chat History</span>
              </div>
              <button
                onClick={() => navigate('/ai-chat/history')}
                className="text-[10px] whitespace-nowrap text-[#00BF53] font-bold hover:underline flex items-center gap-1"
              >
                Show All
              </button>
            </div>

            <div className="space-y-0.5">
              {chats.slice(0, 5).map((chat) => {
                const isActive = location.pathname === '/ai-chat' && new URLSearchParams(location.search).get('chatId') === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => navigate(`/ai-chat?chatId=${chat.id}`)}
                    className={`flex items-center w-full px-4 py-2 cursor-pointer transition-colors hover:bg-black/5 ${
                      isActive ? 'bg-black/5' : ''
                    }`}
                  >
                    <div className={`w-10 min-w-[40px] mr-2.5 rounded-lg flex items-center justify-center ${
                      isActive ? 'text-[#00BF53]' : 'text-[var(--text)]'
                    }`}>
                      <MessageSquare size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <div className={`text-[13px] font-medium truncate ${
                        isActive ? 'text-[#00BF53]' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {chat.title || "Untitled Chat"}
                      </div>
                      <div className="text-[11px] text-gray-400 capitalize">
                        {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </>
      )}
        </nav>
        
        {userDetails && (
          <div className="py-2 px-4 border-t border-[var(--greyborder)] flex items-center justify-between shrink-0">
            {isCollapsed ? (
              <button className="text-[var(--text)] hover:text-red-500 transition-colors w-full flex justify-center relative group" onClick={() => setLogoutDialogOpen(true)} title="Logout">
                <LogOut size={20} />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Logout
                </div>
              </button>
            ) : (
              <>
                <div className="flex items-center cursor-pointer" onClick={() => setSettingsOpen(true)}>
                  <img
                    src={userDetails?.avatar && userDetails.avatar.trim() !== "" ? userDetails.avatar : images.avatar}
                    alt="Avatar"
                    className="w-[40px] h-[40px] rounded-full object-cover shrink-0"
                  />
                  <div className="ml-2 overflow-hidden">
                    <div className="font-[600] text-[14px] capitalize truncate">{userDetails?.name?.split(/[.@]/)[0]?.trim() || "User"}</div>
                    <div className="text-[12px] text-gray-500 capitalize truncate">
                      {userDetails?.roles && userDetails.roles.length > 0
                        ? (() => {
                            const roles = userDetails.roles.map(r => r.toUpperCase());
                            if (roles.includes('ROLE_ADMIN')) return 'admin';
                            if (roles.includes('ROLE_EDUCATOR')) return 'educator';
                            if (roles.includes('ROLE_MENTOR')) return 'mentor';
                            if (roles.includes('ROLE_TRAINER')) return 'trainer';
                            if (roles.includes('ROLE_LEARNER')) return 'learner';
                            return 'role';
                          })()
                        : "Role"}
                    </div>
                  </div>
                </div>
                <button className="text-[var(--text)] hover:text-red-500 transition-colors ml-2" onClick={() => setLogoutDialogOpen(true)} title="Logout">
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        )}
        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          userDetails={userDetails}
        />
        <ConfirmDialog
          open={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
          onConfirm={handleLogout}
          title="Sign Out"
          message="Are you sure you want to sign out?"
          confirmLabel="Sign out"
          cancelLabel="Cancel"
        />
        </aside>
    );
  }

  return (
    <aside
      className={`h-screen bg-[var(--texttwo)] border-r border-[var(--greyborder)] flex flex-col transition-[width] duration-300 overflow-hidden md:relative fixed top-0 left-0 z-[99] bg-white ${open ? "w-[238px]" : "w-0"}`}
      style={{ visibility: open ? "visible" : "hidden" }}
    >
      {/* Header */}
      <div className={`flex items-center ${open ? "justify-between" : "justify-center"} px-4 py-4`}>
        {open && (
          <img
            src={images.logo}
            alt="Logo"
            className="w-[110px] cursor-pointer"
            onClick={() => navigate("")}
          />
        )}

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center"
        >
          <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" />
        </button>
      </div>


      {/* Menu List */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden px-0 [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-[var(--greyborder)] [&::-webkit-scrollbar-thumb]:rounded-[10px]">
      <div className="px-4 py-4 pb-0 font-[900] text-[var(--textlight)] text-[12px]">
        Main Menu
      </div>
 
        {/* New Chat */}
        {open && (
          <div
            onClick={() => {
              navigate('/ai-chat?new=true');
              // Close sidebar on mobile after navigation
              if (window.innerWidth < 768) {
                setOpen(false);
              }
            }}
            className="flex items-center w-full px-4 py-2 cursor-pointer transition-colors hover:bg-black/5"
          >
            <div className="w-10 min-w-[40px] mr-2.5 rounded-lg flex items-center justify-center text-[var(--text)]">
              <MessageSquare size={16} className="rotate-0" />
            </div>
            <span className="text-[13px] text-[var(--textone)]">New Chat</span>
          </div>
        )}

        <nav className="px-0">
          {sidebarMenu
            .filter((item) => {
              if (!userDetails?.roles) {
                return ["Career Compass", "Courses", "Masterclass"].includes(item.label);
              }
              const userRoles = userDetails.roles.map(r => r.toUpperCase());
              return item.roles?.some(role => userRoles.includes(role as any));
            })
            .map((item, index) => {
              const IconComp = icons[item.icon];
              const isActive = item.type === "link" && item.path && isPathActive(item.path);
              const isDropdownActive = dropdownOpen[item.label];

              return (
                <div key={index}>
                  {item.type === "link" && (
                    <div
                      onClick={() => {
                        if (item.path) {
                          navigate(item.path);
                          // Close sidebar on mobile after navigation
                          if (window.innerWidth < 768) {
                            setOpen(false);
                          }
                        }
                      }}
                      className="flex items-center w-full px-4 py-2 cursor-pointer transition-colors hover:bg-black/5"
                    >
                      <div
                        className={`w-10 min-w-[40px] mr-2.5 rounded-lg flex items-center justify-center ${isActive ? "text-[var(--primary)]" : "text-[var(--text)]"
                          }`}
                      >
                        {IconComp && <IconComp size={16} />}
                      </div>
                      {open && (
                        <span
                          className={`text-[13px] ${isActive ? "text-[var(--primary)]" : "text-[var(--textone)]"
                            }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>
                  )}

                  {item.type === "dropdown" && (
                    <>
                      <div
                        onClick={() => toggleDropdown(item.label)}
                        className="flex items-center w-full px-4 py-2 cursor-pointer transition-colors hover:bg-black/5"
                      >
                        <div
                          className={`w-10 min-w-[40px] mr-2.5 rounded-lg flex items-center justify-center ${isDropdownActive ? "text-[var(--primary)]" : "text-[var(--text)]"
                            }`}
                        >
                          {IconComp && <IconComp size={16} />}
                        </div>

                        {open && (
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`text-[13px] ${isDropdownActive ? "text-[var(--primary)]" : "text-[var(--textone)]"
                                }`}
                            >
                              {item.label}
                            </span>
                            {isDropdownActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        )}
                      </div>

                      <div
                        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${dropdownOpen[item.label] ? "max-h-96" : "max-h-0"
                          }`}
                      >
                        <div className={open ? "pl-[56px]" : "pl-[16px]"}>
                          {item.children?.map((child: any, i: number) => {
                            const ChildIconComp = childIcons[child.icon];
                            const isChildActive = child.path === activePath;

                            return (
                              <div
                                key={i}
                                onClick={() => {
                                  if (child.path) {
                                    navigate(child.path);
                                    // Close sidebar on mobile after navigation
                                    if (window.innerWidth < 768) {
                                      setOpen(false);
                                    }
                                  }
                                }}
                                className="flex items-center w-full py-2 cursor-pointer transition-colors hover:bg-black/5"
                              >
                                <div
                                  className={`w-8 min-w-[8px] mr-2.5 rounded-lg flex items-center justify-center ${isChildActive ? "text-[var(--primary)]" : "text-[var(--text)]"
                                    }`}
                                >
                                  {ChildIconComp && <ChildIconComp size={14} />}
                                </div>
                                {open && (
                                  <span
                                    className={`text-[12px] ${isChildActive ? "text-[var(--primary)]" : "text-[var(--text)]"
                                      }`}
                                  >
                                    {child.label}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
        </nav>

        {/* Chat History Section */}
        {userDetails && open && (
          <div className="flex-1 overflow-y-auto px-0">
            <div className="px-4 py-2 font-[900] text-[var(--textlight)] text-[12px] tracking-wider mt-4">
              Your Chats
            </div>

            <div className="flex items-center justify-between mb-2 px-4 py-2">
              <div className="flex items-center w-full gap-2 text-sm font-medium text-gray-700">
                <div className="w-10 min-w-[40px] rounded-lg flex items-center justify-center text-gray-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Chat History</span>
              </div>
              <button
                onClick={() => {
                  navigate('/ai-chat/history');
                  if (window.innerWidth < 768) {
                    setOpen(false);
                  }
                }}
                className="text-[10px] whitespace-nowrap text-[#00BF53] font-bold hover:underline flex items-center gap-1"
              >
                Show All
              </button>
            </div>

            <div className="space-y-0.5">
              {chats.slice(0, 5).map((chat) => {
                const isActive = location.pathname === '/ai-chat' && new URLSearchParams(location.search).get('chatId') === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      navigate(`/ai-chat?chatId=${chat.id}`);
                      if (window.innerWidth < 768) {
                        setOpen(false);
                      }
                    }}
                    className={`flex items-center w-full px-4 py-2 cursor-pointer transition-colors hover:bg-black/5 ${
                      isActive ? 'bg-black/5' : ''
                    }`}
                  >
                    <div className={`w-10 min-w-[40px] mr-2.5 rounded-lg flex items-center justify-center ${
                      isActive ? 'text-[#00BF53]' : 'text-[var(--text)]'
                    }`}>
                      <MessageSquare size={14} />
                    </div>
                    <div className="overflow-hidden">
                      <div className={`text-[13px] font-medium truncate ${
                        isActive ? 'text-[#00BF53]' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
                        {chat.title || "Untitled Chat"}
                      </div>
                      <div className="text-[11px] text-gray-400 capitalize">
                        {new Date(chat.updatedAt || chat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* User Profile - Fixed at Bottom */}
      {userDetails && (
        <div className="py-2 px-4 border-t border-[var(--greyborder)] flex items-center justify-between shrink-0">
          <div className="flex items-center cursor-pointer" onClick={() => setSettingsOpen(true)}>
            <img
              src={userDetails?.avatar && userDetails.avatar.trim() !== "" ? userDetails.avatar : images.avatar}
              alt="Avatar"
              className="w-[40px] h-[40px] rounded-full object-cover shrink-0"
            />
            {open && (
              <div className="ml-2 overflow-hidden">
                <div className="font-[600] text-[14px] capitalize truncate">{userDetails?.name?.split(/[.@]/)[0]?.trim() || "User"}</div>
                <div className="text-[12px] text-gray-500 capitalize truncate">
                  {userDetails?.roles && userDetails.roles.length > 0
                    ? (() => {
                        const roles = userDetails.roles.map(r => r.toUpperCase());
                        if (roles.includes('ROLE_ADMIN')) return 'admin';
                        if (roles.includes('ROLE_MENTOR')) return 'mentor';
                        if (roles.includes('ROLE_TRAINER')) return 'trainer';
                        if (roles.includes('ROLE_LEARNER')) return 'learner';
                        if (roles.includes('ROLE_EDUCATOR')) return 'educator';
                        return 'role';
                      })()
                    : "Role"}
                </div>
              </div>
            )}
          </div>

          {open && (
            <button className="text-[var(--text)] hover:text-red-500 transition-colors ml-2" onClick={() => setLogoutDialogOpen(true)} title="Logout">
              <LogOut size={18} />
            </button>
          )}
        </div>
      )
      }
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        userDetails={userDetails}
      />
      <ConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        cancelLabel="Cancel"
      />
    </aside >
  );
};

export default Sidebar;
