import React from "react";

interface ChatHeaderProps {
  title: string;
  description: string;
  status: string;
  isCollapsed: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  description,
  status,
  isCollapsed,
}) => {
  if (isCollapsed) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border-gray-200">
      <div className="p-6 pt-3 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <span
                className={`px-2.5 py-0.5 text-white text-xs font-medium rounded-full uppercase ${
                  status?.toLowerCase() === "active"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {status}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
