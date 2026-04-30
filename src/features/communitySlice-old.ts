import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { communityClient, API_BASE_URL } from "../graphql/client";
import {
  GET_ALL_CHATS,
  GET_CHAT_PARTICIPANTS,
  GET_MESSAGES_BY_CHAT_ID,
  SEARCH_CHATS,
  SEARCH_MESSAGES,
  GET_PINNED_MESSAGES,
  GET_MESSAGE_LOCATION,
  GET_MESSAGE,
} from "../graphql/queries/communityQueries";
import { RootState } from "../app/store";

export interface Community {
  id: string;
  chatId?: string; // Real database ID from backend
  name: string;
  description: string;
  icon: string;
  members: number;
  avatars: string[];
  pinnedMessageIds: string[];
  admins: string[];
  batchId?: string;
}

export interface Participant {
  id: string;
  username: string;
  avatarUrl: string;
  role: string;
  lastActive: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  isCurrentUser?: boolean;
  type?: "text" | "image" | "file";
  communityId?: string;
  reactions?: { [emoji: string]: number };
  isPinned?: boolean;
  replyTo?: {
    userName: string;
    content: string;
  };
  isEdited?: boolean;
}

export interface PinnedMessage {
  id: string;
  content: string;
}

interface CommunityState {
  communities: Community[];
  messages: Message[];
  // Separate state for search overlay results
  searchMessages: Message[];
  // Pinned messages fetched from API
  pinnedMessages: PinnedMessage[];
  activeCommunity: Community | null;
  participants: Participant[];
  participantsCount: number;
  loading: boolean;
  error: string | null;
  // Pagination for messages
  messagesPage: number;
  messagesSize: number;
  messagesTotal: number;
  messagesHasMore: boolean;
  // Pagination for search results
  searchMessagesPage: number;
  searchMessagesSize: number;
  searchMessagesTotal: number;
  searchMessagesHasMore: boolean;
  // Search state
  searchKeyword: string;
  // Track if we're viewing messages around a specific page (from pinned message click)
  viewingPage: number | null;
}

const initialState: CommunityState = {
  communities: [],
  messages: [],
  searchMessages: [],
  pinnedMessages: [],
  activeCommunity: null,
  participants: [],
  participantsCount: 0,
  loading: false,
  error: null,
  messagesPage: 1,
  messagesSize: 10,
  messagesTotal: 0,
  messagesHasMore: false,
  searchMessagesPage: 1,
  searchMessagesSize: 10,
  searchMessagesTotal: 0,
  searchMessagesHasMore: false,
  searchKeyword: "",
  viewingPage: null,
};

const mockCommunities: Community[] = [
  {
    id: "html_css_101",
    name: "Modern HTML & CSS",
    description:
      "Master responsive design, CSS Grid, Flexbox, and modern styling techniques",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
    members: 237,
    avatars: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    ],
    pinnedMessageIds: [],
    admins: [],
  },
  {
    id: "react_101",
    name: "React.js",
    description:
      "Learn hooks, state management, component lifecycle, and modern React patterns",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    members: 328,
    avatars: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
    ],
    pinnedMessageIds: [],
    admins: [],
  },
  {
    id: "js_101",
    name: "JavaScript",
    description:
      "Deep dive into ES6+, async programming, DOM manipulation, and core concepts",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    members: 178,
    avatars: [
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face",
    ],
    pinnedMessageIds: [],
    admins: [],
  },
  {
    id: "php_101",
    name: "PHP",
    description:
      "Server-side development, databases, security, and building dynamic web applications",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
    members: 254,
    avatars: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    ],
    pinnedMessageIds: [],
    admins: [],
  },
];

export const fetchCommunities = createAsyncThunk(
  "community/fetchCommunities",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.ar.accessToken;

      const { data } = await communityClient.query({
        query: GET_ALL_CHATS,
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        fetchPolicy: "network-only",
      });

      const chats = (data as any).getAllChats || [];

      return chats.map((chat: any) => ({
        id: chat.id,
        chatId: chat.id,
        name: chat.title,
        description: chat.description || "",
        icon: chat.icon,
        courseId: chat.courseId,
        members: chat.participantsCount || 0,
        avatars: [],
        pinnedMessageIds: chat.pinnedMessageIds || [],
        admins: chat.admins || [],
        batchId: chat.batchId,
      })) as Community[];
    } catch (error: any) {
      console.error("fetchCommunities error:", error);
      return mockCommunities;
    }
  }
);

export const fetchParticipants = createAsyncThunk(
  "community/fetchParticipants",
  async (chatId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.ar.accessToken;

      const { data } = await communityClient.query({
        query: GET_CHAT_PARTICIPANTS,
        variables: { chatId },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        fetchPolicy: "network-only",
      });

      return (data as any).getChatParticipants || [];
    } catch (error: any) {
      console.error("fetchParticipants error:", error);
      // Mock data if API fails
      return Array.from({ length: 15 }, (_, i) => ({
        id: `mock-${i}`,
        username: `Member ${i + 1}`,
        avatarUrl: `https://i.pravataar.cc/150?u=${i}`,
        role: i === 0 ? "admin" : "member",
        lastActive: "Online",
      }));
    }
  }
);

export const fetchChatDetails = createAsyncThunk(
  "community/fetchChatDetails",
  async (
    { communityId }: { communityId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      const courseId = `course_${communityId}`;
      const response = await fetch(`${API_BASE_URL}/chat/course/${courseId}`);

      if (!response.ok) {
        // If the course chat doesn't exist, we might need to create it.
        // For now, return a predicted ID based on the user's logs
        return { chatId: communityId };
      }

      const chat = await response.json();
      return { chatId: chat._id || chat.id };
    } catch (error) {
      console.error("fetchChatDetails error:", error);
      return { chatId: communityId };
    }
  }
);

export const searchMessages = createAsyncThunk(
  "community/searchMessages",
  async (
    {
      chatId,
      keyword = "",
      page = 1,
      size = 10,
      append = false,
    }: {
      chatId: string;
      keyword?: string;
      page?: number;
      size?: number;
      append?: boolean;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.ar.accessToken;
      const currentUserId = state.ar.userDetails?.id || "";

      const { data } = await communityClient.query({
        query: SEARCH_MESSAGES,
        variables: { chatId, keyword: keyword || "", page, size },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        fetchPolicy: "network-only",
      });

      const result = (data as any).searchMessages;
      const messages = result?.items || [];

      const mappedMessages = messages.map((msg: any) => {
        // Find replied-to message if exists
        const allMessages = append ? state.community.messages : [];
        const replyToMessage = msg.replyToMessageId
          ? allMessages.find((m: any) => m.id === msg.replyToMessageId)
          : null;

        return {
          id: msg.id,
          userId: msg.userId,
          userName: msg.username || "User",
          userAvatar: "", // Add if avatarUrl is available in query later
          content: msg.content || "",
          timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          ),
          communityId: msg.chatId || chatId,
          isCurrentUser: msg.userId === currentUserId,
          type: "text" as const,
          reactions: {}, // Add if reactions are available in query
          isPinned: msg.isPinned || false,
          isEdited: msg.isEdited || false,
          replyTo: replyToMessage
            ? {
              userName: replyToMessage.userName,
              content: replyToMessage.content,
            }
            : undefined,
        };
      }) as Message[];

      return {
        messages: mappedMessages,
        page: result?.page || page,
        size: result?.size || size,
        total: result?.total || 0,
        append,
      };
    } catch (error: any) {
      console.error("searchMessages error:", error);
      return rejectWithValue(error.message);
    }
  }
);
// Updated getMessages thunk using message ID-based pagination
export const getMessages = createAsyncThunk(
  "community/getMessages",
  async (
    {
      chatId,
      messageId,
      type = "BEFORE", // "BEFORE" for older messages (scroll up), "AFTER" for newer messages (scroll down)
      size = 10,
      append = false,
      appendDirection = "top",
    }: {
      chatId: string;
      messageId?: string; // Optional - if not provided, gets latest messages
      type?: "BEFORE" | "AFTER";
      size?: number;
      append?: boolean;
      appendDirection?: "top" | "bottom";
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.ar.accessToken;
      const currentUserId = state.ar.userDetails?.id || "";

      // Use GetAdvancedMessageLocation query
      const { data } = await communityClient.query({
        query: GET_MESSAGE,
        variables: {
          chatId,
          messageId: messageId || null, // If no messageId, backend should return latest messages
          type,
          size,
        },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        fetchPolicy: "network-only",
      });

      const result = (data as any).GetMessages;
      const messages = result?.items || [];

      const mappedMessages = messages.map((msg: any) => {
        // Find replied-to message if exists
        const allMessages = append ? state.community.messages : [];
        const replyToMessage = msg.replyToMessageId
          ? allMessages.find((m: any) => m.id === msg.replyToMessageId)
          : null;

        // Process reactions
        const reactions: { [emoji: string]: number } = {};
        if (msg.reactions && Array.isArray(msg.reactions)) {
          msg.reactions.forEach((r: any) => {
            if (r.emoji && r.reaction?.count) {
              reactions[r.emoji] = r.reaction.count;
            }
          });
        }

        return {
          id: msg.id,
          userId: msg.userId,
          userName: msg.username || "User",
          userAvatar: "",
          content: msg.content || "",
          timestamp: new Date(msg.createdAt || Date.now()).toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          ),
          communityId: msg.chatId || chatId,
          isCurrentUser: msg.userId === currentUserId,
          type: "text" as const,
          reactions,
          isPinned: msg.isPinned || false,
          isEdited: msg.isEdited || false,
          replyTo: replyToMessage
            ? {
              userName: replyToMessage.userName,
              content: replyToMessage.content,
            }
            : undefined,
        };
      }) as Message[];

      return {
        messages: mappedMessages,
        page: result?.page || 1,
        size: result?.size || size,
        total: result?.total || 0,
        append,
        appendDirection,
        hasMore: messages.length === size, // If we got a full page, there might be more
      };
    } catch (error: any) {
      console.error("getMessages error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const searchChats = createAsyncThunk(
  "community/searchChats",
  async (
    {
      keyword = "",
      page = 1,
      size = 10,
    }: {
      keyword?: string;
      page?: number;
      size?: number;
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.ar.accessToken;

      const { data } = await communityClient.query({
        query: SEARCH_CHATS,
        variables: { keyword: keyword || null, page, size },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        fetchPolicy: "network-only",
      });

      const result = (data as any).searchChats;
      const chats = result?.items || [];

      return chats.map((chat: any) => ({
        id: chat.id,
        chatId: chat.id,
        name: chat.title,
        description: chat.description || "",
        icon: chat.icon,
        courseId: chat.courseId,
        members: chat.participantsCount || 0,
        avatars: [],
        pinnedMessageIds: chat.pinnedMessageIds || [],
        admins: chat.admins || [],
        batchId: chat.batchId,
      })) as Community[];
    } catch (error: any) {
      console.error("searchChats error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPinnedMessages = createAsyncThunk(
  "community/fetchPinnedMessages",
  async (chatId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const token = state.ar.accessToken;

      const { data } = await communityClient.query({
        query: GET_PINNED_MESSAGES,
        variables: { chatId },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        fetchPolicy: "network-only",
      });

      const pinnedMessages = (data as any).getPinnedMessages || [];
      return pinnedMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
      })) as PinnedMessage[];
    } catch (error: any) {
      console.error("fetchPinnedMessages error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const getMessageLocation = createAsyncThunk(
  "community/getMessageLocation",
  async (
    { messageId, pageSize = 10 }: { messageId: string; pageSize?: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const token = state.ar.accessToken;

      const { data } = await communityClient.query({
        query: GET_MESSAGE_LOCATION,
        variables: { messageId, pageSize },
        context: {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
        fetchPolicy: "network-only",
      });

      const result = (data as any).getMessageLocation;
      return {
        page: result?.page || 1,
        size: result?.size || pageSize,
      };
    } catch (error: any) {
      console.error("getMessageLocation error:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Keep the old fetchChatHistory for backward compatibility
export const fetchChatHistory = createAsyncThunk(
  "community/fetchChatHistory",
  async (chatId: string, { getState, dispatch }) => {
    // Use getMessages with default params for main chat history
    const result = await dispatch(
      getMessages({ chatId, size: 10, append: false })
    );
    return result.payload;
  }
);

const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    setActiveCommunity: (state, action: PayloadAction<Community>) => {
      state.activeCommunity = action.payload;
      // Reset messages when switching communities
      state.messages = [];
      state.messagesPage = 1;
      state.messagesHasMore = false;
      state.pinnedMessages = [];
      state.viewingPage = null;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const currentChatId = state.activeCommunity?.chatId;
      const currentCommId = state.activeCommunity?.id;

      // Allow if it matches either the DB chatId or the UI communityId
      if (
        action.payload.communityId !== currentChatId &&
        action.payload.communityId !== currentCommId
      ) {
        return;
      }

      const existingIndex = state.messages.findIndex(
        (m) =>
          m.id === action.payload.id ||
          (m.id.startsWith("temp-") && m.content === action.payload.content)
      );

      if (existingIndex > -1) {
        state.messages[existingIndex] = {
          ...state.messages[existingIndex],
          ...action.payload,
          replyTo:
            action.payload.replyTo || state.messages[existingIndex].replyTo,
          isCurrentUser: state.messages[existingIndex].isCurrentUser,
        };
      } else {
        state.messages.push(action.payload);
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.messagesPage = 1;
      state.messagesHasMore = false;
    },
    updateMessageReaction: (
      state,
      action: PayloadAction<{
        messageId: string;
        emoji?: string;
        reactions?: { [key: string]: number };
      }>
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        if (action.payload.reactions) {
          msg.reactions = action.payload.reactions;
        } else if (action.payload.emoji) {
          if (!msg.reactions) msg.reactions = {};
          msg.reactions[action.payload.emoji] =
            (msg.reactions[action.payload.emoji] || 0) + 1;
        }
      }
    },
    setParticipantsCount: (state, action: PayloadAction<number>) => {
      state.participantsCount = action.payload;
    },
    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },
    toggleMessagePin: (
      state,
      action: PayloadAction<{ messageId: string; isPinned: boolean }>
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        msg.isPinned = action.payload.isPinned;
      }
    },
    updateMessage: (
      state,
      action: PayloadAction<{ id: string; content: string; isEdited?: boolean }>
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.id);
      if (msg) {
        msg.content = action.payload.content;
        msg.isEdited = action.payload.isEdited ?? true;
      }
    },
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
        if (!state.activeCommunity && action.payload.length > 0) {
          state.activeCommunity = action.payload[0];
        }
      })
      .addCase(fetchCommunities.rejected, (state) => {
        state.loading = false;
        state.communities = mockCommunities;
        if (!state.activeCommunity) {
          state.activeCommunity = mockCommunities[0];
        }
      })
      .addCase(fetchChatDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeCommunity) {
          state.activeCommunity.chatId = action.payload.chatId;
        }
      })
      .addCase(fetchChatDetails.rejected, (state) => {
        state.loading = false;
      })
      .addCase(searchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchMessages.fulfilled, (state, action: any) => {
        state.loading = false;
        const { messages, page, size, total, append } = action.payload;
        // Update separate searchMessages state for overlay
        if (append) {
          state.searchMessages = [
            ...(messages as Message[]),
            ...state.searchMessages,
          ];
        } else {
          state.searchMessages = messages as Message[];
        }

        state.searchMessagesPage = page;
        state.searchMessagesSize = size;
        state.searchMessagesTotal = total;
        state.searchMessagesHasMore = state.searchMessages.length < total;
      })
      .addCase(searchMessages.rejected, (state) => {
        state.loading = false;
        state.searchMessagesHasMore = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMessages.fulfilled, (state, action: any) => {
        state.loading = false;
        const { messages, page, size, total, append, appendDirection } =
          action.payload;

        if (append && appendDirection === "top") {
          // Prepend older messages at the top
          const newMessages = messages as Message[];
          const existingIds = new Set(state.messages.map(m => m.id));
          const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
          state.messages = [...uniqueNewMessages, ...state.messages];
        } else if (append && appendDirection === "bottom") {
          // Append newer messages at the bottom
          const newMessages = messages as Message[];
          const existingIds = new Set(state.messages.map(m => m.id));
          const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id));
          state.messages = [...state.messages, ...uniqueNewMessages];
        } else {
          // Replace messages for initial load
          state.messages = messages as Message[];
        }

        state.messagesPage = page;
        state.messagesSize = size;
        state.messagesTotal = total;
        state.messagesHasMore = state.messages.length < total;
      })
      .addCase(getMessages.rejected, (state) => {
        state.loading = false;
        state.messagesHasMore = false;
      })
      .addCase(searchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
      })
      .addCase(searchChats.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action: any) => {
        state.loading = false;
        if (action.payload?.messages) {
          state.messages = action.payload.messages;
          state.messagesPage = action.payload.page || 1;
          state.messagesSize = action.payload.size || 10;
          state.messagesTotal = action.payload.total || 0;
          state.messagesHasMore =
            action.payload.messages.length < (action.payload.total || 0);
        }
      })
      .addCase(fetchChatHistory.rejected, (state) => {
        state.loading = false;
        state.messages = [];
      })
      .addCase(fetchParticipants.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchParticipants.fulfilled, (state, action) => {
        state.loading = false;
        state.participants = action.payload;
      })
      .addCase(fetchParticipants.rejected, (state) => {
        state.loading = false;
        state.participants = [];
      })
      .addCase(fetchPinnedMessages.pending, (state) => {
        // Don't set loading to true to avoid blocking UI
      })
      .addCase(fetchPinnedMessages.fulfilled, (state, action) => {
        state.pinnedMessages = action.payload;
      })
      .addCase(fetchPinnedMessages.rejected, (state) => {
        state.pinnedMessages = [];
      })
      .addCase(getMessageLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMessageLocation.fulfilled, (state, action: any) => {
        state.loading = false;
        state.viewingPage = action.payload.page;
        state.messagesPage = action.payload.page;
        state.messagesSize = action.payload.size;
      })
      .addCase(getMessageLocation.rejected, (state) => {
        state.loading = false;
        state.viewingPage = null;
      });
  },
});

export const {
  setActiveCommunity,
  addMessage,
  setMessages,
  clearMessages,
  updateMessageReaction,
  setParticipantsCount,
  removeMessage,
  toggleMessagePin,
  updateMessage,
  setSearchKeyword,
} = communitySlice.actions;
export default communitySlice.reducer;
