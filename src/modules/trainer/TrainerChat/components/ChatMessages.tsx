import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Image, Send, Info } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../app/store";
import { getMessages } from "../../../../features/communitySlice";
import { socketService } from "../../../../services/socketService";
import { LoadingSpinner } from "../../../../components/ui";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  learnerName: string;
  learnerUserId: string;
  learnerAvatar: string;
  onToggleHeader: () => void;
  chatId?: string;
  isHeaderCollapsed: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages: propMessages,
  learnerName,
  learnerUserId,
  learnerAvatar,
  onToggleHeader,
  chatId,
  isHeaderCollapsed,
}) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages: storeMessages, loading } = useSelector(
    (state: RootState) => state.community,
  );
  const { userDetails, accessToken } = useSelector(
    (state: RootState) => state.ar,
  );
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    if (chatId) {
      dispatch(getMessages({ chatId, size: 50, append: false }) as any);

      if (userDetails) {
        const joinChat = () => {
          if (socketService.socket?.connected) {
            socketService.joinCommunity(chatId, userDetails);
          } else {
            socketService.socket?.once("connect", () => {
              socketService.joinCommunity(chatId, userDetails);
            });
          }
        };
        joinChat();
      }
    }
    return () => {
      if (chatId) {
        socketService.leaveCommunity(chatId);
      }
    };
  }, [chatId, dispatch, userDetails]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storeMessages]);

  const handleSend = () => {
    if (messageText.trim() && chatId && userDetails) {
      socketService.sendMessage(chatId, messageText, userDetails, false);
      setMessageText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 rounded-br-xl">
      <div className="bg-white border-b border-gray-200 px-4 py-1">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {learnerAvatar ? (
                <>
                  <img
                    src={learnerAvatar}
                    alt={learnerName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                  {learnerName?.charAt(0).toUpperCase() || "L"}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{learnerName}</h3>
              <p className="text-sm text-gray-600">{learnerUserId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
            {/* <button
              onClick={onToggleHeader}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative group"
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
            </button> */}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-2 ">
        {loading && storeMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center">
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                Today
              </span>
            </div>
            {storeMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xl `}>
                  <div
                    className={`inline-block px-4 py-3 ${
                      message.isCurrentUser
                        ? "bg-green-500 text-white rounded-t-xl rounded-bl-xl"
                        : "bg-white text-gray-900 border border-gray-200 rounded-t-xl rounded-br-xl"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className="mt-1 px-2">
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="bg-white border-t border-gray-200 px-4 pb-1 pt-2 rounded-br-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Image className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-gray-400 hover:bg-gray-500 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessages;
