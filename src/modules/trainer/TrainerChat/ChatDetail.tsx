import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ChevronRight } from "lucide-react";
import ChatHeader from "./components/ChatHeader";
import SessionTabs from "./components/SessionTabs";
import LearnerList from "./components/LearnerList";
import ChatMessages from "./components/ChatMessages";
import { GET_BATCH_SESSIONS } from "../../../graphql/queries/batchQueries";
import { communityClient } from "../../../graphql/client";
import { LoadingSpinner } from "../../../components/ui";
import { ChatTextIcon } from "@phosphor-icons/react";

interface ChatDetailProps {
  chatId: string;
  chatName: string;
  activityStatus: string;
  onBack: () => void;
}

interface Session {
  sessionId: string;
  sessionName: string;
  chatCount: number;
}

interface GetBatchSessionsData {
  getBatchSessions: Session[];
}

const ChatDetail: React.FC<ChatDetailProps> = ({
  chatId,
  chatName,
  activityStatus,
  onBack,
}) => {
  const [activeSession, setActiveSession] = useState(1);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(
    null,
  );
  const [selectedLearnerName, setSelectedLearnerName] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const { data, loading } = useQuery<GetBatchSessionsData>(GET_BATCH_SESSIONS, {
    client: communityClient,
    variables: { batchId: chatId },
    skip: !chatId,
  });

  const sessions =
    data?.getBatchSessions?.map((session, index) => ({
      id: index + 1,
      sessionId: session.sessionId,
      name: session.sessionName,
      unreadCount: session.chatCount,
    })) || [];

  const activeSessionData = sessions.find((s) => s.id === activeSession);
  const activeSessionId = activeSessionData?.sessionId || "";
  // const activeSessionId = "69ca1c660d948f190cf738c6";

  const messages = [
    {
      id: "1",
      text: "Hi Dr. Mitchell! I have a question about the useEffect hook we covered today.",
      timestamp: "2:15 PM",
      isOwn: false,
    },
    {
      id: "2",
      text: "Of course! What would you like to know?",
      timestamp: "2:18 PM",
      isOwn: true,
    },
    {
      id: "3",
      text: "I'm confused about when to use the cleanup function. Can you explain it again?",
      timestamp: "2:20 PM",
      isOwn: false,
    },
    {
      id: "4",
      text: "Great question! The cleanup function is used to clean up side effects when the component unmounts or before the effect runs again. For example, if you set up an event listener, you should remove it in the cleanup function to prevent memory leaks.",
      timestamp: "2:22 PM",
      isOwn: true,
    },
  ];

  const chatData = {
    title:
      "Meta Full Stack Developer: Front-End & Back-End from Scratch Specialization",
    description: "Complete MERN stack training with real-world projects",
    status: "ACTIVE",
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with Breadcrumb */}
      <div className="sticky top-0 z-30 border-b bg-white p-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600 hover:text-green-600">
          <ChatTextIcon className="h-4 w-4 me-1" />
          <button onClick={onBack} className="cursor-pointer">
            My Chats
          </button>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900">{chatName}</span>
        </div>
      </div>

      <div className="h-[85vh] flex flex-col bg-gray-50 w-full max-w-5xl mx-auto my-6 border border-grey-400 rounded-xl">
        <ChatHeader
          title={chatName}
          description={chatData.description}
          status={activityStatus}
          isCollapsed={isHeaderCollapsed}
        />
        <SessionTabs
          sessions={sessions}
          activeSession={activeSession}
          onSessionChange={(sessionId) => {
            setActiveSession(sessionId);
            setSelectedLearnerId(null);
            setSelectedLearnerName("");
            setSelectedChatId("");
          }}
          onToggleHeader={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
          isHeaderCollapsed={isHeaderCollapsed}
        />
        <div className="flex-1 flex overflow-hidden">
          <LearnerList
            sessionId={activeSessionId}
            selectedLearnerId={selectedLearnerId}
            onSelectLearner={(learnerId, learnerName, chatId) => {
              setSelectedLearnerId(learnerId);
              setSelectedLearnerName(learnerName);
              setSelectedChatId(chatId);
            }}
          />
          {selectedLearnerId ? (
            <ChatMessages
              messages={messages}
              learnerName={selectedLearnerName}
              learnerUserId=""
              learnerAvatar=""
              onToggleHeader={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
              chatId={selectedChatId}
              isHeaderCollapsed={isHeaderCollapsed}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-br-xl gap-4">
              <img
                src="/src/assets/image/Empty Chat.svg"
                alt="Empty chat"
                className="w-60 h-60"
              />
              <p className="text-gray-400 text-sm">
                Click the chat to receive or send messages !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatDetail;
