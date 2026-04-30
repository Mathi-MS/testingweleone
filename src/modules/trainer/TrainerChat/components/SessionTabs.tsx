import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Maximize, Minimize } from "lucide-react";

interface Session {
  id: number;
  name: string;
  unreadCount: number;
}

interface SessionTabsProps {
  sessions: Session[];
  activeSession: number;
  onSessionChange: (sessionId: number) => void;
  onToggleHeader: () => void;
  isHeaderCollapsed: boolean;
}

const SessionTabs: React.FC<SessionTabsProps> = ({
  sessions,
  activeSession,
  onSessionChange,
  onToggleHeader,
  isHeaderCollapsed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSessionData = sessions.find((s) => s.id === activeSession);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="bg-white border-b border-gray-200 px-6 py-3 rounded-t-xl"
      ref={dropdownRef}
    >
      <div className="relative">
        <div className="flex">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm text-gray-900">
                {activeSessionData?.name || "Select Session"}
              </span>
              {activeSessionData && activeSessionData.unreadCount > 0 && (
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {activeSessionData.unreadCount}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={onToggleHeader}
            className="ms-3 p-2 hover:bg-gray-100 rounded-lg transition-colors relative group"
            title={isHeaderCollapsed ? "Maximize" : "Minimize"}
          >
            {isHeaderCollapsed ? (
              <Maximize className="w-5 h-5 text-gray-600" />
            ) : (
              <Minimize className="w-5 h-5 text-gray-600" />
            )}
            <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isHeaderCollapsed ? "Maximize" : "Minimize"}
            </span>
          </button>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {sessions.map((session) => (
              <>
                <button
                  key={session.id}
                  onClick={() => {
                    onSessionChange(session.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    activeSession === session.id ? "bg-green-50" : ""
                  }`}
                >
                  <span
                    className={`font-medium text-sm ${
                      activeSession === session.id
                        ? "text-green-600"
                        : "text-gray-900"
                    }`}
                  >
                    {session.name}
                  </span>
                  {session.unreadCount > 0 && (
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                      {session.unreadCount}
                    </span>
                  )}
                </button>
              </>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionTabs;
