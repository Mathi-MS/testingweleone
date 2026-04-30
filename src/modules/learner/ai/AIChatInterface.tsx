import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Clock,
  ArrowUp,
  Paperclip,
  Mic,
  MoreHorizontal,
} from "lucide-react";
import { aiApi } from "../../../services/aiApi";
import {
  setActiveAiChat,
  clearAiMessages,
  setAiMessages,
} from "../../../features/aiChatSlice";
import { AppDispatch, RootState } from "../../../app/store";
import { socketService } from "../../../services/socketService";
import { AuthHeaderControls } from "../../../components/auth/AuthHeaderControls";
import { ChatInputArea } from "./components/ChatInputArea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { images } from "../../../assets/image/Images";

export const AIChatInterface = ({ isModal = false, sidebarOpen = false, onToggleSidebar }: { isModal?: boolean; sidebarOpen?: boolean; onToggleSidebar?: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { messages, activeChatId: storeActiveChatId, isStreaming } = useSelector((state: RootState) => state.aiChat);
  const { userDetails, accessToken } = useSelector(
    (state: RootState) => state.ar,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    !isModal ? searchParams.get("chatId") : null
  );
  const [inputValue, setInputValue] = useState("");
  const pendingMessageRef = React.useRef<string | null>(null);

  let lastUserMsgIdx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].isCurrentUser) {
      lastUserMsgIdx = i;
      break;
    }
  }

  const lastScrolledMsgIdRef = React.useRef<string | number | null>(null);

  useEffect(() => {
    if (lastUserMsgIdx >= 0) {
      const msg = messages[lastUserMsgIdx];
      const msgId = msg.id || lastUserMsgIdx;

      if (lastScrolledMsgIdRef.current !== msgId) {
        const el = document.getElementById(`message-${msgId}`);
        const scrollContainer = document.getElementById("ai-chat-scroll-container");

        if (el && scrollContainer) {
          const targetTop = Math.max(0, el.offsetTop - 20);
          const currentScroll = scrollContainer.scrollTop;

          if (Math.abs(targetTop - currentScroll) > 20) {
            scrollContainer.scrollTo({ top: targetTop, behavior: "smooth" });
          }
          lastScrolledMsgIdRef.current = msgId;
        }
      }
    }
  }, [messages, lastUserMsgIdx]);

  const newlyCreatedChatIdsRef = React.useRef<Set<string>>(new Set());
  const lastLoadedChatIdRef = React.useRef<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const isNewChat = !activeChatId || (!isModal && searchParams.get("new") === "true");

  useEffect(() => {
    if (accessToken) {
      socketService.connect(accessToken);
    }
  }, [accessToken]);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    // Listen for new chat creation via socket service event
    const handleChatCreated = (e: any) => {
      const data = e.detail;
      if (isNewChat && data && data.chatId) {
        if (!isModal) {
          navigate(`/ai-chat?chatId=${data.chatId}`, { replace: true });
        } else {
          setActiveChatId(data.chatId);
        }

        // Fix race condition where incoming socket messages are dropped while `chats` loads via API
        dispatch(setActiveAiChat(data.chatId));
        newlyCreatedChatIdsRef.current.add(data.chatId);

        // Refresh chat list to show the new chat
        loadChats();
        window.dispatchEvent(new Event("chatListUpdate"));
      }
    };

    window.addEventListener("aiChatCreated", handleChatCreated);

    return () => {
      window.removeEventListener("aiChatCreated", handleChatCreated);
    };
  }, [isNewChat, navigate]);

  useEffect(() => {
    if (!isModal) {
      const urlChatId = searchParams.get("chatId");
      if (urlChatId && urlChatId !== activeChatId) {
        setActiveChatId(urlChatId);
      } else if (!urlChatId && searchParams.get("new") === "true") {
        if (activeChatId !== null) {
          setActiveChatId(null);
        }
        dispatch(clearAiMessages());
      }
    }
  }, [searchParams, isModal, activeChatId, dispatch]);

  useEffect(() => {
    // Prevent stale effects from running when navigating away to a new chat
    if (!isModal && searchParams.get("new") === "true") {
      return;
    }
    if (!isModal && searchParams.get("chatId") !== activeChatId && activeChatId) {
      return;
    }

    if (activeChatId) {
      socketService.joinCommunity(activeChatId, userDetails);

      const currentChat = chats.find((c) => c.id === activeChatId);

      // Dispatch setActiveAiChat if our activeChatId doesn't match the activeChatId.
      // This ensures that when we switch chats (or load for the first time), the target
      // community is marked active BEFORE we load history, preventing a race condition 
      // where later `loadChats` calls clear the populated messages.
      if (storeActiveChatId !== activeChatId) {
        dispatch(setActiveAiChat(activeChatId));
      }

      const initChat = async () => {
        if (lastLoadedChatIdRef.current !== activeChatId) {
          lastLoadedChatIdRef.current = activeChatId;
          if (newlyCreatedChatIdsRef.current.has(activeChatId)) {
            newlyCreatedChatIdsRef.current.delete(activeChatId);
          } else {
            await loadHistory(activeChatId);
          }
        }
      };

      initChat();
    }
  }, [activeChatId, chats, userDetails, isModal, searchParams, dispatch, storeActiveChatId]);

  const loadChats = async () => {
    try {
      if (accessToken && userDetails?.id) {
        const data = await aiApi.getChats(accessToken, userDetails.id);
        const mappedChats = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          lastMessage: "",
          createdAt: c.createdAt,
          source: c.source,
        }));
        setChats(mappedChats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async (chatId: string) => {
    setIsHistoryLoading(true);
    dispatch(clearAiMessages());
    try {
      if (accessToken && userDetails?.id) {
        const response = await aiApi.getChatHistory(accessToken, chatId, userDetails.id, 1, 100);
        const messages = response.messages;

        // Map API messages
        const mapped = messages.map((msg: any, idx: number) => ({
          id: msg.id || `hist-${idx}`,
          userId: msg.userId,
          userName:
            msg.role === "ai"
              ? "AI Assistant"
              : userDetails?.name || "You",
          userAvatar: "", // Add default avatar
          content: msg.content,
          timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString(),
          communityId: chatId,
          isCurrentUser: msg.role === "user",
          type: "text" as const,
          reactions: msg.reactions || {},
        }));

        dispatch(setAiMessages(mapped));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Determine target Chat ID
    let targetChatId = isNewChat ? "temp-new-chat" : activeChatId;

    const messageContent = inputValue;
    setInputValue("");

    // Extract sessionId if on session page
    let sessionId: string | undefined = undefined;
    const pathParts = window.location.pathname.split('/');
    if (pathParts.includes('session')) {
      const sessionIndex = pathParts.indexOf('session');
      if (sessionIndex !== -1 && pathParts.length > sessionIndex + 1) {
        sessionId = pathParts[sessionIndex + 1];
      }
    }

    if (isNewChat && accessToken && userDetails?.id) {
      try {
        const title = messageContent.length > 30 ? messageContent.substring(0, 30) + "..." : messageContent;
        const sourceType = sessionId ? 'session' : 'dashboard';
        const newChat = await aiApi.createChat(accessToken, userDetails.id, title, sourceType, undefined, sessionId);
        targetChatId = newChat.id;
        window.dispatchEvent(new CustomEvent("aiChatCreated", { detail: { chatId: targetChatId } }));
      } catch (err) {
        console.error("Failed to create chat", err);
      }
    }

    if (targetChatId) {
      socketService.sendMessage(
        targetChatId,
        messageContent,
        userDetails || { id: "guest", name: "Guest" },
        { isPersonalized: true, sessionId },
      );
    }
  };

  const handleStop = () => {
    if (activeChatId) {
      socketService.stopAiMessage(activeChatId);
    }
  };


  return (
    <>

      {/* {!sidebarOpen && (
        <button 
          onClick={onToggleSidebar || (() => console.log('Toggle sidebar'))}
          className={`${userDetails?.roles?.some(role => role.toUpperCase() === 'ROLE_ADMIN') ? '' : 'md:hidden'} flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors absolute top-4 left-4 z-10`}
        >
            <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" />
        </button>
      )} */}

      <div className={`flex flex-col bg-white ${isModal ? "h-full" : "h-[calc(100vh-50px)]"}`}>
        {activeChatId ? (
          <>
            {/* Messages Area */}
            <div id="ai-chat-scroll-container" className="flex-1 overflow-y-auto space-y-6 bg-white py-4 relative">
              <div className="max-w-3xl mx-auto flex flex-col space-y-6 h-full px-4">
                {isHistoryLoading ? (
                  <div className="flex justify-center items-center h-full mt-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-[2px] border-gray-200 border-t-[#00BF53]"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => {
                      const isAfterLastUserMsg = idx > lastUserMsgIdx;
                      return (
                        <div
                          key={msg.id || idx}
                          id={`message-${msg.id || idx}`}
                          className={`flex items-start w-full ${msg.isCurrentUser ? "justify-end" : "justify-start"} ${!msg.isCurrentUser && isAfterLastUserMsg ? "min-h-[70vh]" : ""
                            }`}
                        >
                          <div
                            className={`max-w-[100%] px-3 sm:px-5 py-2 ${msg.isCurrentUser
                              ? "bg-[#F3F4F6] text-gray-900 rounded-[20px] rounded-br-sm mx-2 sm:mx-4" // User: Light Gray, right aligned
                              : "bg-transparent text-gray-800 pr-6 sm:pr-10" // AI: Transparent/White, left aligned
                              }`}
                          >
                            <div className={`leading-relaxed text-[15px] ${!msg.isCurrentUser ? "text-gray-800" : "whitespace-pre-wrap"}`}>
                              {!msg.isCurrentUser ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-3 mt-4" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 mt-4" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-3" {...props} />,
                                    strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                    code: ({ node, inline, className, ...props }: any) => {
                                      const match = /language-(\w+)/.exec(className || "");
                                      return !inline ? (
                                        <div className="rounded-md bg-gray-900 text-gray-100 overflow-hidden my-4">
                                          {match && (
                                            <div className="flex px-4 py-1.5 bg-gray-800 text-xs font-mono text-gray-400 border-b border-gray-700">
                                              {match[1]}
                                            </div>
                                          )}
                                          <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
                                            <code className={className} {...props} />
                                          </pre>
                                        </div>
                                      ) : (
                                        <code className="bg-gray-100 text-gray-800 font-mono text-[13px] px-1.5 py-0.5 rounded border border-gray-200" {...props} />
                                      );
                                    },
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 my-3 text-gray-600 italic" {...props} />,
                                    table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg" {...props} /></div>,
                                    thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                                    tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 bg-white" {...props} />,
                                    tr: ({ node, ...props }) => <tr className="hover:bg-gray-50" {...props} />,
                                    th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b" {...props} />,
                                    td: ({ node, ...props }) => <td className="px-4 py-3 text-sm text-gray-700 border-b" {...props} />,
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              ) : (
                                msg.content
                              )}
                            </div>

                            {/* Loading Animation for AI */}
                            {(msg.id?.startsWith("temp-ai") ||
                              msg.userName === "AI Assistant") &&
                              !msg.content && (
                                (isStreaming && idx === messages.length - 1) ? (
                                  <div className="flex space-x-1.5 mt-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-sm">Response stopped.</span>
                                )
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Input Area */}
            <ChatInputArea
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSend={handleSend}
              isStreaming={isStreaming}
              handleStop={handleStop}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="text-center max-w-[1200px] px-4 w-full">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-3">
                Hey Learner, What can I help you with today?
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 leading-relaxed">
                Ask anything from career guidance to learning support. I’m here
                to make your journey easier.
              </p>
              <ChatInputArea
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSend={handleSend}
                isStreaming={isStreaming}
                handleStop={handleStop}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};