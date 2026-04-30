import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { useSelector } from "react-redux";
import ChatDetail from "./ChatDetail";
import { GET_TRAINER_BATCHES } from "../../../graphql/queries/batchQueries";
import { communityClient } from "../../../graphql/client";
import { LoadingSpinner } from "../../../components/ui";
import { ChatTextIcon } from "@phosphor-icons/react";

interface ChatItem {
  batchId: string;
  batch_name: string;
  batch_description: string;
  activityStatus: string;
}

interface GetTrainerBatchesData {
  getTrainerBatches: ChatItem[];
}

const MyChats: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>("");
  const [selectedActivityStatus, setSelectedActivityStatus] =
    useState<string>("");
  const userId = useSelector((state: any) => state.ar?.userDetails?.id);

  const { data, loading, error } = useQuery<GetTrainerBatchesData>(
    GET_TRAINER_BATCHES,
    {
      client: communityClient,
      context: {
        headers: {
          // "x-user-id": "4e1fefb3-2422-430a-b7eb-dd0b7eb9473d",
          "x-user-id": userId,
        },
      },
      skip: !userId,
    },
  );

  const chats: ChatItem[] = data?.getTrainerBatches || [];

  if (selectedChatId) {
    return (
      <ChatDetail
        chatId={selectedChatId}
        chatName={selectedChatName}
        activityStatus={selectedActivityStatus}
        onBack={() => {
          setSelectedChatId(null);
          setSelectedChatName("");
          setSelectedActivityStatus("");
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-red-600">
          Error loading batches: {error.message}
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <div className="text-gray-600">No batches found</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with Breadcrumb */}
      <div className="sticky top-0 z-30 border-b bg-white p-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <ChatTextIcon className="text-gray-900 h-4 w-4 me-1" />
          <span className="text-gray-900 font-medium">My Chats</span>
        </div>
      </div>

      <div className="p-6">
        <div className="w-full max-w-5xl mx-auto space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.batchId}
              onClick={() => {
                setSelectedChatId(chat.batchId);
                setSelectedChatName(chat.batch_name);
                setSelectedActivityStatus(chat.activityStatus);
              }}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {chat.batch_name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 text-white text-xs font-medium rounded-full uppercase ${
                        chat.activityStatus?.toLowerCase() === "active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {chat.activityStatus}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {chat.batch_description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyChats;
