import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

interface AiChatState {
    messages: Message[];
    activeChatId: string | null;
    isStreaming: boolean;
}

const initialState: AiChatState = {
    messages: [],
    activeChatId: null,
    isStreaming: false,
};

const aiChatSlice = createSlice({
    name: "aiChat",
    initialState,
    reducers: {
        setStreamingStatus: (state, action: PayloadAction<boolean>) => {
            state.isStreaming = action.payload;
        },
        setActiveAiChat: (state, action: PayloadAction<string | null>) => {
            if (state.activeChatId !== action.payload) {
                state.activeChatId = action.payload;
                state.messages = [];
            }
        },
        setAiMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },
        clearAiMessages: (state) => {
            state.messages = [];
        },
        addAiMessage: (state, action: PayloadAction<Message>) => {
            // Allow optimistic messages (temp-new-chat) or ones matching active chat
            if (
                action.payload.communityId !== state.activeChatId &&
                action.payload.communityId !== "temp-new-chat"
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
                    replyTo: action.payload.replyTo || state.messages[existingIndex].replyTo,
                    isCurrentUser: state.messages[existingIndex].isCurrentUser,
                };
            } else {
                state.messages.push(action.payload);
            }
        },
        appendAiMessageContent: (state, action: PayloadAction<{ id: string; content: string }>) => {
            const msg = state.messages.find((m) => m.id === action.payload.id);
            if (msg) {
                msg.content += action.payload.content;
            }
        },
    },
});

export const {
    setStreamingStatus,
    setActiveAiChat,
    setAiMessages,
    clearAiMessages,
    addAiMessage,
    appendAiMessageContent,
} = aiChatSlice.actions;

export default aiChatSlice.reducer;
