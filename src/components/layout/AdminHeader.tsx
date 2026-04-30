import { useState, useEffect } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import wele from "../../assets/image/wele.svg";
import avatarimg from "../../assets/image/avatarimg.svg";
import { NotificationBell } from "../common/NotificationBell";

const adminPages = [
  "Dashboard",
  "Micro Learning",
  "Chapters",
  "Book",
  "Course"
];

const adminRouteMap: Record<string, string> = {
  "Dashboard": "/admin/dashboard",
  "Micro Learning": "/admin/microlearning",
  "Chapters": "/admin/chapters",
  "Mock Interview": "/admin/mock-interview",
  "Skill Showcase": "/admin/skill-showcase"
};

const AdminHeader = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPage = Object.entries(adminRouteMap).find(
      ([, route]) => location.pathname.startsWith(route)
    )?.[0];
    if (currentPage) {
      setActive(currentPage);
    }
  }, [location.pathname]);

  const navigateToPage = (page: string) => {
    navigate(adminRouteMap[page]);
    setActive(page);
  };

  return (
    <>
      <nav className="shadow-none">
        <div className="flex justify-between items-center px-4 py-3">
          <div>
            <img src={wele} alt="wele" className="h-8" />
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white p-2 rounded-lg">
            {adminPages.map((page) => (
              <button
                key={page}
                onClick={() => navigateToPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors text-[14px] ${active === page
                  ? 'bg-primary text-white font-semibold'
                  : 'text-text-gray hover:bg-background hover:text-primary'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-1.5 shadow-sm cursor-pointer">
              <img src={avatarimg} alt="profile" className="w-9 h-9 rounded-full" />

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-dark-gray">Admin User</p>
                <p className="text-xs text-text-gray">Administrator</p>
              </div>

              <ChevronDown className="w-4 h-4 text-text-gray" />
            </div>

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-text-gray"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-2 space-y-2">
            {adminPages.map((page) => (
              <button
                key={page}
                onClick={() => {
                  navigateToPage(page);
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-dark-gray hover:bg-background rounded-lg"
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;