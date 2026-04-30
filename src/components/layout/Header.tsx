import { useState } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import wele from "../../assets/image/wele.svg";
import avatarimg from "../../assets/image/avatarimg.svg";
import { NotificationBell } from "../common/NotificationBell";

const pages = [
  "Dashboard",
  "Learning Hub",
  "Mentors Connect",
  "Mock Interview",
  "Skill Showcase"
];

const routeMap: Record<string, string> = {
  "Dashboard": "/app/dashboard",
  "Learning Hub": "/app/learninghub",
  "Mentors Connect": "/app/mentors",
  "Mock Interview": "/app/mockinterview",
  "Skill Showcase": "/app/skillshowcase"
};

const Weleheader = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const navigate = useNavigate();

  const navigateToDashBoard = (page: string) => {
    navigate(routeMap[page]);
    setActive(page);
  };

  return (
    <>
      <nav className="shadow-none">
        <div className="flex justify-between items-center px-4 py-3">
          {/* Logo */}
          <div>
            <img src={wele} alt="wele" className="h-8" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 bg-white p-2 rounded-lg">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => navigateToDashBoard(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${active === page
                    ? 'bg-primary text-white font-semibold'
                    : 'text-text-gray hover:bg-background hover:text-primary'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Right Side Profile + Notification */}
          <div className="flex items-center gap-4">
            <NotificationBell />


            {/* Profile Box */}
            <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-1.5 shadow-sm cursor-pointer">
              <img src={avatarimg} alt="profile" className="w-9 h-9 rounded-full" />

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-dark-gray">Krishnakanth S</p>
                <p className="text-xs text-text-gray">Learner</p>
              </div>

              <ChevronDown className="w-4 h-4 text-text-gray" />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-text-gray"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-2 space-y-2">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => {
                  navigateToDashBoard(page);
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

export default Weleheader;