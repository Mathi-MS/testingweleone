import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MoreHorizontal,
  Smile,
  Mic,
  Plus,
  Users,
  ChevronRight,
  Search,
  Reply,
  Pin,
  Trash2,
  MessageSquare,
  Edit,
  Check,
  X,
  Image,
  File,
  Camera,
  Video,
  MicOff,
  Send,
} from "lucide-react";
import { RootState, AppDispatch } from "../../../app/store";
import {
  fetchCommunities,
  fetchChatHistory,
  fetchChatDetails,
  fetchParticipants,
  setActiveCommunity,
  addMessage,
  updateMessageReaction,
  setParticipantsCount,
  searchMessages,
  searchChats,
  setSearchKeyword,
  getMessages,
  fetchPinnedMessages,
  getMessageLocation,
  fetchCategorizedCommunities,
  Message,
  Community,
  Participant,
} from "../../../features/communitySlice";
import { socketService } from "../../../services/socketService";
import { UserAvatar } from "../../../components/common/UserAvatar";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useAppDispatch } from "../../../app/hook";
import { AuthHeaderControls } from "../../../components/auth/AuthHeaderControls";
import { images } from "../../../assets/image/Images";
import { SidebarContext } from "../ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";

// Static data removed - using Redux state

export function CommunityChatInterface() {
  const dispatch = useAppDispatch();
  const { id: communityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sidebarContext = React.useContext(SidebarContext);
  const {
    communities,
    messages,
    loading,
    participants,
    participantsCount,
    messagesPage,
    messagesHasMore,
    searchKeyword,
    searchMessages: searchMessagesResults,
    pinnedMessages,
    viewingPage,
    categorized,
  } = useSelector((state: RootState) => state.community);
  const { userDetails, accessToken } = useSelector(
    (state: RootState) => state.ar,
  );

  const currentCommunity = communities.find((c) => c.id === communityId) || 
    [...categorized.hot, ...categorized.warm, ...categorized.cool].find((c) => c.id === communityId);
  const activeCommunity = useSelector(
    (state: RootState) => state.community.activeCommunity,
  );

  const [newMessage, setNewMessage] = useState("");
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [showAllHorizontalGroups, setShowAllHorizontalGroups] = useState(false);
  const [showGroupsMenu, setShowGroupsMenu] = useState(false);
  const [activeMenuMessage, setActiveMenuMessage] = useState<string | null>(
    null,
  );
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [messageMenuPosition, setMessageMenuPosition] = useState<{
    [key: string]: "top" | "bottom";
  }>({});
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const [currentPinnedIndex, setCurrentPinnedIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetMessageRef = useRef<string | null>(null);
  const lastTopMessageId = useRef<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const lastBottomMessageId = useRef<string | null>(null);

  const reactionEmojis = ["👍", "💖", "😂", "👏"];

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    dispatch(fetchCommunities());
    dispatch(fetchCategorizedCommunities());

    if (accessToken) {
      socketService.connect(accessToken);
    }

    return () => {
      // socketService.disconnect();
    };
  }, [dispatch, accessToken]);

  const lastJoinedRef = useRef<string | null>(null);

  useEffect(() => {
    if (communityId && userDetails) {
      // Use communityId directly from URL
      dispatch(
        fetchChatDetails({
          communityId: communityId,
          userId: userDetails.id,
        }),
      )
        .unwrap()
        .then((result) => {
          const realChatId = result.chatId;

          // Prevent duplicate joins
          if (lastJoinedRef.current === realChatId) return;
          lastJoinedRef.current = realChatId;

          // Reset initial load state
          setIsInitialLoad(true);
          setShouldScrollToBottom(true);
          lastTopMessageId.current = null;
          lastBottomMessageId.current = null;

          // Fetch pinned messages
          dispatch(fetchPinnedMessages(realChatId));

          // Fetch history using the database chatId
          dispatch(fetchChatHistory(realChatId)).finally(() => {
            // Allow pagination after initial load completes
            setTimeout(() => setIsInitialLoad(false), 1000);
          });

          // Fetch participants
          dispatch(fetchParticipants(realChatId));

          // Join room using the database chatId
          socketService.joinCommunity(realChatId, userDetails);
        })
        .catch((err) => {
          console.error("Failed to initialize chat details:", err);
        });

      return () => {
        if (lastJoinedRef.current) {
          socketService.leaveCommunity(lastJoinedRef.current);
          lastJoinedRef.current = null;
        }
        dispatch(setParticipantsCount(0));
      };
    }
  }, [communityId, userDetails?.id, dispatch]);

  // Only scroll to bottom on initial load or when user sends a message
  useEffect(() => {
    if (shouldScrollToBottom && messages.length > 0) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [messages, shouldScrollToBottom]);

  // Scroll to target message after loading page from pinned message click
  useEffect(() => {
    if (targetMessageRef.current && messages.length > 0 && !isLoadingPage) {
      setTimeout(() => {
        const element = document.getElementById(
          `message-${targetMessageRef.current}`,
        );
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          element.classList.add("bg-green-50");
          setTimeout(() => element.classList.remove("bg-green-50"), 2000);
        }
        targetMessageRef.current = null;
      }, 100);
    }
  }, [messages, isLoadingPage]);

  // Updated scroll handler in CommunityChatInterface component

  // Scroll handler for pagination using message IDs
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (
      !container ||
      isLoadingMore ||
      isInitialLoad ||
      isLoadingPage ||
      shouldScrollToBottom
    )
      return;

    // Mark as user scrolling
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsUserScrolling(false), 150);

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Only trigger API at very edges (5px threshold)
    const LOAD_THRESHOLD = 5;

    // Load older messages when at very top
    if (scrollTop <= LOAD_THRESHOLD && isUserScrolling && messages.length > 0) {
      const oldestMessage = messages[0];
      if (
        !oldestMessage?.id ||
        !lastJoinedRef.current ||
        lastTopMessageId.current === oldestMessage.id
      )
        return;

      lastTopMessageId.current = oldestMessage.id;
      setIsLoadingMore(true);
      previousScrollHeight.current = scrollHeight;

      dispatch(
        getMessages({
          chatId: lastJoinedRef.current,
          messageId: oldestMessage.id,
          type: "BEFORE",
          size: 10,
          append: true,
          appendDirection: "top",
        }),
      )
        .unwrap()
        .then(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop =
              newScrollHeight - previousScrollHeight.current;
          }
        })
        .finally(() => setIsLoadingMore(false));
    }
    // Load newer messages when at very bottom
    else if (
      scrollBottom <= LOAD_THRESHOLD &&
      isUserScrolling &&
      messages.length > 0
    ) {
      const newestMessage = messages[messages.length - 1];
      if (
        !newestMessage?.id ||
        !lastJoinedRef.current ||
        lastBottomMessageId.current === newestMessage.id
      )
        return;

      lastBottomMessageId.current = newestMessage.id;
      setIsLoadingMore(true);
      previousScrollHeight.current = scrollHeight;

      dispatch(
        getMessages({
          chatId: lastJoinedRef.current,
          messageId: newestMessage.id,
          type: "AFTER",
          size: 10,
          append: true,
          appendDirection: "bottom",
        }),
      )
        .unwrap()
        .then(() => {
          if (container) {
            container.scrollTop = container.scrollTop;
          }
        })
        .finally(() => setIsLoadingMore(false));
    }
  };

  // Remove duplicate useEffect
  // Updated pinned message click handler
  const handlePinnedMessageClick = async () => {
    if (!lastJoinedRef.current || pinnedMessages.length === 0) return;

    setIsLoadingPage(true);
    const pinnedMessageId = pinnedMessages[currentPinnedIndex].id;
    targetMessageRef.current = pinnedMessageId;

    try {
      await dispatch(
        getMessages({
          chatId: lastJoinedRef.current,
          messageId: pinnedMessageId,
          type: "BEFORE",
          size: 25,
          append: false,
          appendDirection: "top",
        }),
      ).unwrap();

      setIsLoadingPage(false);
    } catch (error) {
      console.error("Failed to load pinned messages:", error);
      setIsLoadingPage(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCommunities());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".file-menu") &&
        !target.closest(".file-menu-button")
      ) {
        setShowFileMenu(false);
      }
      if (
        !target.closest(".emoji-picker") &&
        !target.closest(".emoji-picker-button")
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (lastJoinedRef.current) {
      if (messageSearchQuery.trim()) {
        setShowSearchResults(true);
      }
      dispatch(
        searchMessages({
          chatId: lastJoinedRef.current,
          keyword: messageSearchQuery,
          page: 1,
          size: 10,
          append: false,
        }),
      );
    }
  }, [messageSearchQuery, dispatch]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      // Temporarily disable scroll handler
      container.removeEventListener("scroll", handleScroll);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      // Re-enable scroll handler after scroll completes
      setTimeout(() => {
        container.addEventListener("scroll", handleScroll);
      }, 500);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && communityId && userDetails) {
      const targetId = lastJoinedRef.current || communityId;

      socketService.sendMessage(
        targetId,
        newMessage,
        userDetails,
        false,
        replyingTo?.id,
      );

      setNewMessage("");
      setReplyingTo(null);
      setShouldScrollToBottom(true); // Scroll to bottom when user sends message
    }
  };

  const handleSearchClear = () => {
    setMessageSearchQuery("");
    setIsSearchExpanded(false);
    setShowSearchResults(false);
  };

  const handleSearchResultClick = (messageId: string) => {
    setShowSearchResults(false);
    setIsSearchExpanded(false);
    setMessageSearchQuery("");

    // Scroll to the message
    setTimeout(() => {
      const element = document.getElementById(`message-${messageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("bg-green-50");
        setTimeout(() => element.classList.remove("bg-green-50"), 2000);
      }
    }, 100);
  };

  const calculateMenuPosition = (messageElement: HTMLElement) => {
    const rect = messageElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const messageTop = rect.top;
    const messageBottom = rect.bottom;

    // If message is in the top half of the viewport, show menu below
    // If message is in the bottom half, show menu above
    return messageTop < viewportHeight / 2 ? "bottom" : "top";
  };

  const handleDeleteMessage = (messageId: string) => {
    if (communityId && userDetails) {
      const targetId = lastJoinedRef.current || communityId;
      socketService.deleteMessage(
        targetId,
        messageId,
        userDetails.id,
        userDetails.name,
      );
      setActiveMenuMessage(null);
    }
  };

  const handlePinMessage = (message: Message) => {
    if (communityId && userDetails) {
      const targetId = lastJoinedRef.current || communityId;
      if (message.isPinned) {
        socketService.unpinMessage(
          targetId,
          message.id,
          userDetails.id,
          userDetails.name,
        );
      } else {
        socketService.pinMessage(
          targetId,
          message.id,
          userDetails.id,
          userDetails.name,
        );
      }
      setActiveMenuMessage(null);
    }
  };

  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message);
    setActiveMenuMessage(null);
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
    setActiveMenuMessage(null);
  };

  const handleSaveEdit = () => {
    if (
      editingMessageId &&
      editingContent.trim() &&
      communityId &&
      userDetails
    ) {
      const targetId = lastJoinedRef.current || communityId;
      socketService.editMessage(
        targetId,
        editingMessageId,
        editingContent,
        userDetails.id,
        userDetails.name,
      );
      setEditingMessageId(null);
      setEditingContent("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const loadCommunityMessages = (community: Community) => {
    navigate(`/community/chat/${community.id}`);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (communityId && userDetails) {
      const targetId = lastJoinedRef.current || communityId;
      socketService.sendReaction(
        messageId,
        emoji,
        userDetails.id,
        userDetails.name,
      );
    }
  };

  const handleFileUpload = (type: "image" | "file" | "camera" | "video") => {
    const input = document.createElement("input");
    input.type = "file";

    switch (type) {
      case "image":
        input.accept = "image/*";
        break;
      case "video":
        input.accept = "video/*";
        break;
      case "camera":
        input.accept = "image/*";
        input.capture = "environment";
        break;
      case "file":
        input.accept = "*";
        break;
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && communityId && userDetails) {
        // Handle file upload logic here
        // You can implement actual file upload to your backend here
        const targetId = lastJoinedRef.current || communityId;
        // socketService.sendFile(targetId, file, userDetails);
      }
    };

    input.click();
    setShowFileMenu(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      recorder.onstop = () => {
        clearInterval(timer);
        if (!isCancelled) {
          const blob = new Blob(chunks, { type: "audio/wav" });
          // Send voice message
          if (communityId && userDetails) {
            const targetId = lastJoinedRef.current || communityId;
            // Create a temporary voice message
            const voiceMessage = `🎤 Voice message (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, "0")})`;
            socketService.sendMessage(
              targetId,
              voiceMessage,
              userDetails,
              false,
              replyingTo?.id,
            );
            setReplyingTo(null);
            setShouldScrollToBottom(true);
          }
        }
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        setRecordingTime(0);
        setMediaRecorder(null);
        setIsCancelled(false);
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      setIsCancelled(true);
      mediaRecorder.stop();
    }
  };

  return (
    <div className="flex-1 bg-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentCommunity ? (
          <>
            <div className="flex items-center justify-between sticky top-0 z-20 border-b border-[#0d0d0d0d] bg-white px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center space-x-2 sm:space-x-4 overflow-hidden">
                <div className="flex items-center space-x-1 sm:space-x-3 overflow-hidden">
                  {!sidebarContext?.sidebarOpen && (
                    <button
                      onClick={sidebarContext?.toggleSidebar}
                      className={`${userDetails?.roles?.some((role) => role.toUpperCase() === "ROLE_ADMIN") ? "" : "md:hidden"} flex items-center justify-center p-1`}
                    >
                      {/* <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" /> */}
                      <HiMiniBars3BottomLeft
                        style={{ color: "#000", fontSize: "22px" }}
                      />
                    </button>
                  )}
                  <Users
                    size={16}
                    className="text-gray-600 sm:w-5 sm:h-5 flex-shrink-0"
                  />
                  <Link
                    className="text-xs sm:text-md font-medium hidden sm:inline"
                    to="/community"
                  >
                    Learning Community
                  </Link>
                  <ChevronRight
                    size={14}
                    className="text-gray-400 hidden sm:inline sm:w-4 sm:h-4"
                  />
                  <span className="text-xs sm:text-md font-medium truncate">
                    {currentCommunity.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <AuthHeaderControls />
              </div>
            </div>
            <div className="flex items-center gap-4 px-2 py-1 border-[#0d0d0d0d] bg-white sticky top-[52px] z-10">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center p-1 px-2 hover:bg-gray-100 rounded-lg transition-colors w-[max-content]"
              >
                <ChevronRight size={16} className="rotate-180 text-gray-600" />
                <span className="text-[10px] text-[14px] text-gray-600 pl-2">
                  Back
                </span>
              </button>
            </div>
            <div className="flex gap-2 mx-auto px-1 sm:px-2 w-full max-w-5xl">
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-white">
                  {/* Group Tabs */}
                  <div className="relative flex items-center justify-between mt-4">
                    {/* <div className="flex items-center space-x-4">
                  <div className="flex flex-wrap">
                    {(() => {
                      const currentIndex = communities.findIndex(c => c.id === currentCommunity.id);
                      const displayCommunities = [];
                      for (let i = 0; i < 3; i++) {
                        displayCommunities.push(communities[(currentIndex + i) % communities.length]);
                      }
                      return displayCommunities;
                    })().map((community) => (
                      <button
                        key={community.id}
                        onClick={() => loadCommunityMessages(community)}
                        className={`flex items-center space-x-2 px-3 py-1 m-1 rounded-full text-sm ${currentCommunity.id === community.id
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                          }`}
                      >
                        <UserAvatar
                          src={community.icon}
                          name={community.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{community.name}</span>
                      </button>
                    ))}
                  </div>
                </div> */}
                    {/* <div className="relative">
                  {communities.length > 3 && (
                    <button
                      onClick={() => setShowGroupsMenu(!showGroupsMenu)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium whitespace-nowrap"
                    >
                      {showAllHorizontalGroups ? "Show Less" : "Show More"}
                    </button>
                  )}

                  {showGroupsMenu && (
                    <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-medium text-gray-800">All Groups</h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {communities.map((community) => (
                          <button
                            key={community.id}
                            onClick={() => {
                              loadCommunityMessages(community);
                              setShowGroupsMenu(false);
                            }}
                            className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors ${currentCommunity?.id === community.id
                              ? "bg-green-50"
                              : ""
                              }`}
                          >
                            <UserAvatar
                              src={community.icon}
                              name={community.name}
                              className="w-8 h-8 rounded-lg shrink-0"
                            />
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-800 text-sm">
                                {community.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {community.members} members
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div> */}
                    {/* Community Info */}
                    <div className="p-1 sm:p-[8px] bg-[#FBFBFB] rounded-t-lg max-w-5xl mx-auto w-full border">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col space-y-1 sm:space-y-2">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <div className="bg-gray-100 rounded-full p-0.5 sm:p-1">
                              <UserAvatar
                                src={currentCommunity.icon}
                                name={currentCommunity.name}
                                className="w-6 h-6 sm:w-10 sm:h-10 rounded-full"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-base font-medium text-gray-800">
                                {currentCommunity.name}
                              </span>
                              <span className="text-[10px] sm:text-sm text-gray-600">
                                {participantsCount || currentCommunity.members}{" "}
                                active members
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-1 sm:space-x-2">
                          <div className="relative">
                            {!isSearchExpanded ? (
                              <button
                                onClick={() => setIsSearchExpanded(true)}
                                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Search
                                  size={14}
                                  className="text-gray-600 sm:w-4 sm:h-4"
                                />
                              </button>
                            ) : (
                              <div className="relative flex items-center">
                                <Search
                                  size={14}
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-4 sm:h-4"
                                />
                                <input
                                  type="text"
                                  placeholder="Search..."
                                  value={messageSearchQuery}
                                  onChange={(e) =>
                                    setMessageSearchQuery(e.target.value)
                                  }
                                  className="pl-6 sm:pl-8 pr-6 sm:pr-8 py-1 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 w-32 sm:w-48"
                                  autoFocus
                                />
                                <button
                                  onClick={handleSearchClear}
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="relative flex flex-col m-auto">
                            <button
                              onClick={() =>
                                setShowMembersList(!showMembersList)
                              }
                              className="text-gray-600 hover:text-gray-800 p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreHorizontal
                                size={14}
                                className="sm:w-4 sm:h-4"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative bg-[#fff] border-l border-r border-b border-[#0000001A] max-w-5xl mx-auto w-full px-1 sm:px-4 rounded-b-lg">
                  {/* Search Results Overlay */}
                  {showSearchResults && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="absolute bg-black bg-opacity-30 z-40"
                        onClick={() => setShowSearchResults(false)}
                      />

                      {/* Results Panel - full overlay over chat area */}
                      <div className="abolute top-24 bottom-0 z-50 flex justify-center pointer-events-none">
                        <div className="w-full max-w-5xl mx-4 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
                          <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-800">
                                Search Results{" "}
                                {searchMessagesResults.length > 0 &&
                                  `(${searchMessagesResults.length})`}
                              </h3>
                              <button
                                onClick={() => setShowSearchResults(false)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 max-h-full overflow-y-auto">
                            {messageSearchQuery.trim() === "" ? (
                              <div className="p-6 text-sm text-gray-500">
                                Type to search messages in this chat.
                              </div>
                            ) : searchMessagesResults.length === 0 ? (
                              <div className="p-6 text-sm text-gray-500">
                                No messages found for{" "}
                                <span className="font-medium">
                                  "{messageSearchQuery}"
                                </span>
                                .
                              </div>
                            ) : (
                              searchMessagesResults.map((message) => (
                                <div
                                  key={message.id}
                                  onClick={() =>
                                    handleSearchResultClick(message.id)
                                  }
                                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                                >
                                  <div className="flex items-start space-x-3">
                                    <UserAvatar
                                      src={message.userAvatar}
                                      name={message.userName}
                                      className="w-8 h-8 rounded-full shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium text-gray-800">
                                          {message.userName ===
                                          userDetails?.name
                                            ? "You"
                                            : message.userName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {message.timestamp}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 line-clamp-2">
                                        {message.content}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Sticky Pinned Messages - Moved under chat name */}
                  {pinnedMessages.length > 0 && (
                    <div
                      className="mx-1 sm:mx-[10px] mb-2 bg-white border border-gray-100 flex items-center px-2 sm:px-4 py-1.5 sm:py-2 space-x-2 sm:space-x-3 shadow-sm rounded-lg animate-in slide-in-from-top duration-300 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={handlePinnedMessageClick}
                    >
                      <Pin
                        size={12}
                        className="text-[#00BF53] shrink-0 sm:w-4 sm:h-4"
                        fill="currentColor"
                      />
                      <div className="flex-1 overflow-hidden">
                        <div className="text-[8px] sm:text-[10px] font-bold text-[#00BF53] uppercase tracking-wider">
                          Pinned Message {currentPinnedIndex + 1} of{" "}
                          {pinnedMessages.length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700 truncate">
                          {pinnedMessages[currentPinnedIndex].content}
                        </div>
                      </div>
                      {pinnedMessages.length > 1 && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPinnedIndex((prev) =>
                                prev > 0 ? prev - 1 : pinnedMessages.length - 1,
                              );
                            }}
                            className="text-gray-400 hover:text-gray-600 px-1"
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPinnedIndex((prev) =>
                                prev < pinnedMessages.length - 1 ? prev + 1 : 0,
                              );
                            }}
                            className="text-gray-400 hover:text-gray-600 px-1"
                          >
                            ›
                          </button>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Find the message in the messages array to unpin
                          const msgInMessages = messages.find(
                            (m) =>
                              m.id === pinnedMessages[currentPinnedIndex].id,
                          );
                          if (msgInMessages) {
                            handlePinMessage(msgInMessages);
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600 px-2 text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  {/* Messages */}
                  <div className="relative flex-1 overflow-hidden mt-2">
                    {(isLoadingMore || isLoadingPage) && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white px-4 rounded-full shadow-md z-10 flex items-center space-x-2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}

                    {loading && messages.length === 0 && !isLoadingPage && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 bg-white">
                        <LoadingSpinner size="lg" />
                      </div>
                    )}

                    <div
                      ref={messagesContainerRef}
                      onScroll={handleScroll}
                      className={`max-w-5xl mx-auto overflow-y-auto p-2 sm:p-6 pb-16 sm:pb-20 ${
                        pinnedMessages.length > 0
                          ? "h-[calc(100vh-270px)] sm:h-[calc(100vh-270px)]"
                          : "h-[calc(100vh-170px)] sm:h-[calc(100vh-170px)]"
                      } scrollbar-hide`}
                    >
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20 px-4">
                          <div className="bg-gray-50 p-8 rounded-full mb-6 transform hover:scale-110 transition-transform duration-300 border border-gray-100 shadow-sm">
                            <MessageSquare
                              size={48}
                              className="text-green-500 opacity-60"
                            />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No messages yet
                          </h3>
                          <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
                            {/* This is the beginning of the{" "}
                                                        <span className="text-green-600 font-semibold">
                                                            {selectedCommunity.name}
                                                        </span>{" "}
                                                        community.  */}
                            Start the conversation!
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* {messages.length > 0 && (
                                                    <div className="text-center mb-8">
                                                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-gray-100">
                                                            Yesterday
                                                        </span>
                                                    </div>
                                                )} */}

                          {messages.map((message) => (
                            <div
                              key={message.id}
                              id={`message-${message.id}`}
                              className={`flex space-x-1 sm:space-x-3 transition-colors duration-500 rounded-lg p-1 sm:p-2 ${
                                message.userName === userDetails?.name ||
                                message.isCurrentUser
                                  ? "justify-end"
                                  : ""
                              }`}
                            >
                              {!(
                                message.userName === userDetails?.name ||
                                message.isCurrentUser
                              ) && (
                                <UserAvatar
                                  src={message.userAvatar}
                                  name={message.userName}
                                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shrink-0"
                                />
                              )}
                              <div
                                className={`max-w-[85%] sm:max-w-2xl mb-2 relative ${
                                  message.userName === userDetails?.name ||
                                  message.isCurrentUser
                                    ? "text-right"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`flex items-center ${
                                    message.userName === userDetails?.name ||
                                    message.isCurrentUser
                                      ? "justify-end"
                                      : ""
                                  }  space-x-1 sm:space-x-2 mb-0.5 sm:mb-1`}
                                >
                                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                                    {message.userName === userDetails?.name ||
                                    message.isCurrentUser
                                      ? "You"
                                      : message.userName}
                                  </span>
                                </div>
                                <div
                                  className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm text-left relative ${
                                    message.userName === userDetails?.name ||
                                    message.isCurrentUser
                                      ? "bg-[#f1fdf054] text-black"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                  onMouseEnter={(e) => {
                                    setHoveredMessage(message.id);
                                    const position = calculateMenuPosition(
                                      e.currentTarget,
                                    );
                                    setMessageMenuPosition((prev) => ({
                                      ...prev,
                                      [message.id]: position,
                                    }));
                                  }}
                                  onMouseLeave={() => {
                                    setHoveredMessage(null);
                                    setActiveMenuMessage(null);
                                  }}
                                >
                                  {message.replyTo && (
                                    <div className="mb-2 p-2 bg-white bg-opacity-50 rounded border-l-4 border-green-500">
                                      <div className="text-xs font-medium text-green-600 mb-1">
                                        {message.replyTo.userName
                                          ? message.replyTo.userName ===
                                            userDetails?.name
                                            ? "You"
                                            : message.replyTo.userName
                                          : "Unknown User"}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate">
                                        {message.replyTo.content?.length > 50
                                          ? message.replyTo.content.substring(
                                              0,
                                              50,
                                            ) + "..."
                                          : message.replyTo.content || ""}
                                      </div>
                                    </div>
                                  )}
                                  {editingMessageId === message.id ? (
                                    <div className="flex flex-col space-y-2 min-w-[200px]">
                                      <textarea
                                        value={editingContent}
                                        onChange={(e) =>
                                          setEditingContent(e.target.value)
                                        }
                                        className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                                        rows={2}
                                        autoFocus
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={handleCancelEdit}
                                          className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                                        >
                                          <X size={16} />
                                        </button>
                                        <button
                                          onClick={handleSaveEdit}
                                          className="p-1 hover:bg-green-100 rounded-full text-green-600"
                                        >
                                          <Check size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    message.content
                                  )}

                                  {/* Emoji Reactions & More Options Popup */}
                                  {hoveredMessage === message.id && (
                                    <div
                                      className={`absolute ${
                                        messageMenuPosition[message.id] ===
                                        "bottom"
                                          ? "top-full"
                                          : "-top-10"
                                      } ${
                                        message.userName ===
                                          userDetails?.name ||
                                        message.isCurrentUser
                                          ? "right-0"
                                          : "left-0"
                                      } bg-white border border-gray-200 rounded-full px-2 py-1 shadow-lg flex items-center space-x-1 z-20`}
                                    >
                                      <div className="flex space-x-1 pr-2 border-r border-gray-100 mr-1">
                                        {reactionEmojis.map((emoji) => (
                                          <button
                                            key={emoji}
                                            onClick={() =>
                                              handleReaction(message.id, emoji)
                                            }
                                            className="hover:bg-gray-100 p-1 rounded text-lg transition-transform hover:scale-125"
                                          >
                                            {emoji}
                                          </button>
                                        ))}
                                      </div>

                                      <div className="relative">
                                        <button
                                          onClick={() =>
                                            setActiveMenuMessage(
                                              activeMenuMessage === message.id
                                                ? null
                                                : message.id,
                                            )
                                          }
                                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                                        >
                                          <MoreHorizontal size={18} />
                                        </button>

                                        {activeMenuMessage === message.id && (
                                          <div
                                            className={`absolute ${
                                              messageMenuPosition[
                                                message.id
                                              ] === "bottom"
                                                ? "top-full mt-2"
                                                : "bottom-full mb-2"
                                            } ${
                                              message.userName ===
                                                userDetails?.name ||
                                              message.isCurrentUser
                                                ? "right-0"
                                                : "left-0"
                                            } bg-white border border-gray-200 rounded-xl shadow-xl py-2 w-40 z-30`}
                                          >
                                            <button
                                              onClick={() =>
                                                handleReplyMessage(message)
                                              }
                                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                                            >
                                              <Reply size={16} />
                                              <span>Reply</span>
                                            </button>
                                            <button
                                              onClick={() =>
                                                handlePinMessage(message)
                                              }
                                              className={`w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-sm ${
                                                message.isPinned
                                                  ? "text-green-600 font-medium"
                                                  : "text-gray-700"
                                              }`}
                                            >
                                              <Pin size={16} />
                                              <span>
                                                {message.isPinned
                                                  ? "Unpin"
                                                  : "Pin"}
                                              </span>
                                            </button>
                                            {(message.userName ===
                                              userDetails?.name ||
                                              message.isCurrentUser) && (
                                              <button
                                                onClick={() =>
                                                  handleEditMessage(message)
                                                }
                                                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                                              >
                                                <Edit size={16} />
                                                <span>Edit</span>
                                              </button>
                                            )}
                                            <button
                                              onClick={() =>
                                                handleDeleteMessage(message.id)
                                              }
                                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                                            >
                                              <Trash2 size={16} />
                                              <span>Delete</span>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Display Reactions */}
                                {message.reactions &&
                                  Object.keys(message.reactions).length > 0 && (
                                    <div
                                      className={`flex space-x-1 mt-1 ${
                                        message.userName ===
                                          userDetails?.name ||
                                        message.isCurrentUser
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >
                                      {Object.entries(message.reactions).map(
                                        ([emoji, count]) => (
                                          <span
                                            key={emoji}
                                            className="bg-gray-200 rounded-full px-2 py-1 text-xs flex items-center space-x-1"
                                          >
                                            <span>{emoji}</span>
                                            <span>{count}</span>
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  )}

                                <div className="flex items-center justify-between mt-1">
                                  <div className="text-[10px] text-gray-500 flex items-center space-x-1">
                                    {message.isEdited && (
                                      <span className="italic">Edited •</span>
                                    )}
                                    <span className={message.replyTo ? "ml-3" : ""}>{message.timestamp}</span>
                                  </div>
                                  {message.isPinned && (
                                    <Pin
                                      size={10}
                                      className="text-[#00BF53] ml-2"
                                      fill="currentColor"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>
                  </div>
                  {/* Message Input - Inside chat container */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white border border-gray-200 px-2 sm:px-4 z-10 mx-1 sm:mx-12 my-1 sm:my-2 rounded-[12px] sm:rounded-[16px]">
                    <div className="flex items-center space-x-1 sm:space-x-3">
                      {/* File Upload Menu */}
                      <div className="relative file-menu">
                        <button
                          onClick={() => setShowFileMenu(!showFileMenu)}
                          className="text-gray-600 hover:text-gray-800 file-menu-button p-1 sm:p-0"
                          disabled={isRecording}
                        >
                          <Plus size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        {showFileMenu && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 w-48 z-50">
                            <button
                              onClick={() => handleFileUpload("image")}
                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                            >
                              <Image size={16} className="text-blue-500" />
                              <span>Photo</span>
                            </button>
                            <button
                              onClick={() => handleFileUpload("camera")}
                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                            >
                              <Camera size={16} className="text-green-500" />
                              <span>Camera</span>
                            </button>
                            <button
                              onClick={() => handleFileUpload("video")}
                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                            >
                              <Video size={16} className="text-red-500" />
                              <span>Video</span>
                            </button>
                            <button
                              onClick={() => handleFileUpload("file")}
                              className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm"
                            >
                              <File size={16} className="text-purple-500" />
                              <span>Document</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Emoji Picker */}
                      <div className="relative emoji-picker">
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-gray-600 hover:text-gray-800 emoji-picker-button p-1 sm:p-0"
                          disabled={isRecording}
                        >
                          <Smile size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-full left-0 mb-2 z-50">
                            <Picker
                              data={data}
                              onEmojiSelect={handleEmojiSelect}
                              theme="light"
                              previewPosition="none"
                              skinTonePosition="none"
                              maxFrequentRows={2}
                              perLine={8}
                              set="native"
                            />
                          </div>
                        )}
                      </div>
                      {replyingTo && (
                        <div className="absolute bottom-full left-0 right-0 bg-gray-50 border-t border-gray-200 px-6 py-2 flex items-center justify-between z-10">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="border-l-4 border-green-500 pl-3">
                              <div className="text-xs font-bold text-green-600">
                                Replying to{" "}
                                {replyingTo.userName === userDetails?.name
                                  ? "yourself"
                                  : replyingTo.userName}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-md">
                                {replyingTo.content}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      {isRecording ? (
                        <div className="flex-1">
                          <div className="flex items-center justify-between p-2 sm:p-4 bg-red-50 border-b border-red-100">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-red-600 font-medium text-xs sm:text-sm">
                                Recording... {Math.floor(recordingTime / 60)}:
                                {(recordingTime % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <button
                                onClick={cancelRecording}
                                className="px-2 py-0.5 sm:px-3 sm:py-1 text-red-100 hover:bg-red-100 rounded-lg text-xs sm:text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              !isRecording &&
                              handleSendMessage()
                            }
                            placeholder={
                              isRecording ? "Recording..." : "Type a message..."
                            }
                            className="w-full border-0 px-2 sm:px-4 py-2 sm:py-4 focus:outline-none bg-white text-xs sm:text-sm"
                            disabled={isRecording}
                          />
                        </div>
                      )}

                      {isRecording ? (
                        <button
                          onClick={stopRecording}
                          className="p-1.5 sm:p-2 rounded-lg bg-[#00BF531A]"
                        >
                          <Send
                            size={18}
                            className="text-[#00BF53] sm:w-5 sm:h-5"
                          />
                        </button>
                      ) : newMessage.trim() === "" ? (
                        <button
                          onClick={startRecording}
                          className="text-gray-600 hover:text-[#00BF53] p-1.5 sm:p-2"
                        >
                          <Mic size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSendMessage}
                          className="text-white p-1.5 sm:p-2 rounded-lg bg-[#00BF531A]"
                        >
                          <Send
                            size={18}
                            className="text-[#00BF53] sm:w-5 sm:h-5"
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Sidebar - Outside chat */}
              {showMembersList && (
                <div
                  className={`fixed sm:relative inset-0 sm:inset-auto z-50 sm:z-auto bg-black bg-opacity-50 sm:bg-transparent flex items-end sm:items-start justify-center sm:justify-start sm:w-[300px] sm:bg-white sm:border sm:border-gray-200 sm:rounded-lg sm:shadow-lg sm:flex-col sm:mt-4 ${
                    pinnedMessages.length > 0
                      ? "sm:h-[calc(100vh-950px)]"
                      : "sm:h-[calc(100vh-95px)]"
                  }`}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowMembersList(false);
                    }
                  }}
                >
                  <div className="w-[95%] max-w-md sm:max-w-none bg-white rounded-t-2xl sm:rounded-lg shadow-xl sm:shadow-none max-h-[80vh] sm:max-h-none flex flex-col overflow-auto">
                    <div className="p-4 sm:p-5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800">
                          Members ({currentCommunity?.members || 0})
                        </h3>
                        <button
                          onClick={() => setShowMembersList(false)}
                          className="text-gray-600 hover:text-gray-800 p-1"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1">
                      {currentCommunity?.participantFullNames &&
                        currentCommunity.participantFullNames.length > 0 ? (
                        currentCommunity.participantFullNames.map(
                          (fullName, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-3"
                            >
                              <UserAvatar
                                src={undefined}
                                name={fullName}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-800">
                                  {fullName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Member
                                </div>
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <div className="text-sm text-gray-400 text-center py-4">
                          No members info available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : (
              <div className="text-gray-500 text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                <p>Select a community to start chatting</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
