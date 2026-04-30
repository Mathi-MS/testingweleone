import React from "react";
import { Search } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { GET_SESSION_LEARNER_CHATS } from "../../../../graphql/queries/batchQueries";
import { communityClient } from "../../../../graphql/client";
import { LoadingSpinner } from "../../../../components/ui";

interface LearnerChat {
  chatId: string;
  sessionId: string;
  learnerId: string;
  learnerFullName: string;
  lastMessage: string;
  lastMessageAt: string;
  updatedAt: string;
}

interface GetSessionLearnerChatsData {
  getSessionLearnerChats: LearnerChat[];
}

interface LearnerListProps {
  sessionId: string;
  selectedLearnerId: string | null;
  onSelectLearner: (
    learnerId: string,
    learnerName: string,
    chatId: string,
  ) => void;
}

const LearnerList: React.FC<LearnerListProps> = ({
  sessionId,
  selectedLearnerId,
  onSelectLearner,
}) => {
  const { data, loading } = useQuery<GetSessionLearnerChatsData>(
    GET_SESSION_LEARNER_CHATS,
    {
      client: communityClient,
      variables: { sessionId },
      skip: !sessionId,
    },
  );

  const learners = data?.getSessionLearnerChats || [];

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col rounded-bl-xl">
      <div className="px-4 py-1 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Learner..."
            className="w-full pl-10 pr-4 py-[7px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : learners.length === 0 ? (
          <div className="flex justify-center items-center h-32 text-gray-500 text-sm">
            No learners found
          </div>
        ) : (
          learners.map((learner) => (
            <div
              key={learner.learnerId}
              onClick={() =>
                onSelectLearner(
                  learner.learnerId,
                  learner.learnerFullName,
                  learner.chatId,
                )
              }
              className={`px-4 py-2 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedLearnerId === learner.learnerId
                  ? "border-green-500 bg-green-50"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                    {learner.learnerFullName?.charAt(0).toUpperCase() || "L"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {learner.learnerFullName}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(learner.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {learner.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearnerList;
