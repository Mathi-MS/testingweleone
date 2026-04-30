import { io, Socket } from "socket.io-client";
import { store } from "../app/store";
import {
  addMessage,
  updateMessageReaction,
  setParticipantsCount,
  removeMessage,
  toggleMessagePin,
  updateMessage,
  appendMessageContent,
} from "../features/communitySlice";
import {
  addAiMessage,
  appendAiMessageContent,
  setStreamingStatus,
} from "../features/aiChatSlice";
import {
  setQuestions,
  setShowAssessment,
  setWarning,
  setCurrentQuestionIndex,
  setAssessmentResult,
  setShowResults,
  setActiveSet,
} from "../features/careerSlice";

const { VITE_BASE_URL, VITE_API_BASE_URL } = import.meta.env;

class SocketService {
  public socket: Socket | null = null;
  private currentRoomId: string | null = null;

  connect(token: string) {
    if (this.socket) {
      if (this.socket.active || this.socket.connected) return;
      this.socket.close();
    }

    // Use specific chat URL if available, otherwise fallback to main API URL, or default to localhost
    const targetUrl = VITE_API_BASE_URL || "http://localhost:4000";

    let socketUrl = "";
    try {
      socketUrl = new URL(targetUrl).origin;
    } catch (e) {
      console.error("[SocketService] Invalid URL configuration:", targetUrl);
      return;
    }

    // In local development, we connect directly to the service which uses default /socket.io path
    // In production, we go through a gateway which likely routes /api/chat/socket.io -> /socket.io
    const isLocal = socketUrl.includes("localhost") || socketUrl.includes("127.0.0.1");

    try {
      this.socket = io(socketUrl, {
        path: isLocal ? "/socket.io" : "/api/chat/socket.io",
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
      });
      this.socket.on("connect", () => {
        console.log("[SocketService] CONNECTED. Socket ID:", this.socket?.id);
      });
      this.socket.on("MESSAGE_CREATED", (message: any) => {
        const state = store.getState() as any;
        const isAI = message.role === "ai" || message.role === "system";

        const mappedMessage = {
          id: message._id || message.id || `msg-${Date.now()}`,
          userId: message.userId || message.senderId || "",
          userName:
            message.username ||
            message.userName ||
            message.senderName ||
            (isAI ? "AI Assistant" : "Unknown User"),
          userAvatar: message.avatarUrl || message.userAvatar || "",
          content: message.content || "",
          timestamp: new Date(
            message.createdAt || Date.now()
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCurrentUser: isAI ? false : (message.userId || message.senderId) === state.ar.userDetails?.id,
          communityId: message.chatId || message.communityId || message.conversationId,
          reactions: message.reactions
            ? Object.entries(message.reactions).reduce(
              (acc, [emoji, users]: [string, any]) => ({
                ...acc,
                [emoji]: users.length,
              }),
              {}
            )
            : {},
          replyTo: message.replyTo || message.message?.replyTo,
          isPinned: message.isPinned || message.message?.isPinned,
          isEdited: message.isEdited || message.message?.isEdited || false,
        };
        store.dispatch(addMessage(mappedMessage));
        store.dispatch(addAiMessage(mappedMessage));
      });
      this.socket.on("MESSAGE_REPLIED", (data: any) => {
        const state = store.getState() as any;
        const messages = state.community.messages;
        const isAI = data.role === "ai" || data.role === "system";

        // Find the replied-to message
        const replyToMessage = messages.find(
          (m: any) => m.id === data.replyToMessageId
        );
        const mappedMessage = {
          id: data.id || data._id || `msg-${Date.now()}`,
          userId: data.userId || "",
          userName: data.username || data.userName || (isAI ? "AI Assistant" : "Unknown User"),
          userAvatar: data.avatarUrl || data.userAvatar || "",
          content: data.content || "",
          timestamp: new Date(
            data.createdAt || Date.now()
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isCurrentUser: isAI ? false : data.userId === state.ar.userDetails?.id,
          communityId: data.chatId || data.communityId || data.conversationId,
          reactions: data.reactions
            ? Object.entries(data.reactions).reduce(
              (acc, [emoji, users]: [string, any]) => ({
                ...acc,
                [emoji]: users.length,
              }),
              {}
            )
            : {},
          replyTo: replyToMessage || {
            id: data.replyToMessageId,
            content: "Original message",
            userName: "Unknown",
          },
          isPinned: data.isPinned || false,
          isEdited: data.isEdited || false,
        };
        store.dispatch(addMessage(mappedMessage));
        store.dispatch(addAiMessage(mappedMessage));
      });
      this.socket.on("MESSAGE_REACTED", (data: any) => {
        const messageId = data.messageId || data._id;
        store.dispatch(
          updateMessageReaction({
            messageId: messageId,
            reactions: data.reactions
              ? Object.entries(data.reactions).reduce(
                (acc, [emoji, users]: [string, any]) => ({
                  ...acc,
                  [emoji]: users.length,
                }),
                {}
              )
              : {},
          })
        );
      });
      this.socket.on("chat-participants-updated", (data: any) => {
        store.dispatch(setParticipantsCount(data.participantsCount));
      });
      this.socket.on("MESSAGE_DELETED", (data: any) => {
        const messageId = data.messageId || data._id;
        store.dispatch(removeMessage(messageId));
      });
      this.socket.on("MESSAGE_PINNED", (data: any) => {
        const messageId = data.messageId || data._id;
        store.dispatch(
          toggleMessagePin({ messageId: messageId, isPinned: true })
        );
      });
      this.socket.on("MESSAGE_UNPINNED", (data: any) => {
        const messageId = data.messageId || data._id;
        store.dispatch(
          toggleMessagePin({ messageId: messageId, isPinned: false })
        );
      });
      this.socket.on("MESSAGE_EDITED", (data: any) => {
        const messageId =
          data.messageId ||
          data._id ||
          data.id ||
          (data.message && (data.message.id || data.message._id));
        const content = data.content || (data.message && data.message.content);
        if (messageId && content) {
          store.dispatch(
            updateMessage({
              id: messageId,
              content: content,
              isEdited: true,
            })
          );
        }
      });
      this.socket.on("AI_STREAM_START", (data: any) => {
        const chatId = data.chatId;
        // Use the ID from backend if available, otherwise fallback
        const messageId = data.messageId || `temp-ai-${chatId}`;

        store.dispatch(addMessage({
          id: messageId,
          userId: 'AI_BOT',
          userName: 'AI Assistant',
          userAvatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
          content: '',
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          communityId: chatId,
          isCurrentUser: false,
          type: 'text'
        }));
        store.dispatch(addAiMessage({
          id: messageId,
          userId: 'AI_BOT',
          userName: 'AI Assistant',
          userAvatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
          content: '',
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          communityId: chatId,
          isCurrentUser: false,
          type: 'text'
        }));
        store.dispatch(setStreamingStatus(true));
      });
      this.socket.on("AI_STREAM_CHUNK", (data: any) => {
        const state = store.getState() as any;
        if (!state.aiChat.isStreaming) return;

        const chatId = data.chatId;
        const messageId = data.messageId || `temp-ai-${chatId}`;
        store.dispatch(appendMessageContent({
          id: messageId,
          content: data.content
        }));
        store.dispatch(appendAiMessageContent({
          id: messageId,
          content: data.content
        }));
      });
      this.socket.on("AI_STREAM_END", (data: any) => {
        store.dispatch(setStreamingStatus(false));
      });
      this.socket.on("AI_CHAT_CREATED", (data: any) => {
        window.dispatchEvent(new CustomEvent('aiChatCreated', { detail: data }));
      });
      this.socket.on("assessment_started", (data: any) => {
        const order = { cognitive: 1, behavioral: 2, track: 3 };
        const sorted = [...data.questions].sort(
          (a: any, b: any) =>
            (order[a.category as keyof typeof order] || 99) -
            (order[b.category as keyof typeof order] || 99)
        );
        const mapped = sorted.map((q: any) => ({
          id: q.id,
          question: q.text,
          category: q.category,
          options: (q.options || []).map((o: any) => ({
            id: o.id,
            text: o.text,
          })),
        }));
        store.dispatch(setQuestions(mapped));
        store.dispatch(setShowAssessment(true));
      });
      this.socket.on(
        "answer_recorded",
        (data: { success: boolean; speedWarning?: string; questionId?: string }) => {
          const state = store.getState() as any;
          const currentQuestions = state.career.questions;
          const currentQuestionIndex = state.career.currentQuestionIndex;
          
          const answeredQuestionId = data.questionId || sessionStorage.getItem('lastSubmittedQuestionId');
          
          if (answeredQuestionId === sessionStorage.getItem('lastSubmittedQuestionId')) {
            sessionStorage.removeItem('lastSubmittedQuestionId');
          }

          if (data.speedWarning && answeredQuestionId) {
            const answeredIndex = currentQuestions.findIndex((q: any) => q.id === answeredQuestionId);
            const questionGap = currentQuestionIndex - answeredIndex;
            
            if (questionGap <= 2) {
              store.dispatch(
                setWarning({
                  message: data.speedWarning,
                  questionId: answeredQuestionId,
                })
              );
              
              setTimeout(() => {
                const currentState = store.getState() as any;
                if (currentState.career.warningQuestionId === answeredQuestionId) {
                  store.dispatch(setWarning({ message: null, questionId: null }));
                }
              }, 5000);
            }
          }
        }
      );
      this.socket.on("assessment_completed", (data: any) => {
        store.dispatch(setAssessmentResult(data));
        store.dispatch(setShowResults(true));
      });
      this.socket.on("connect_error", (error) => {
        console.error("[SocketService] CONNECTION ERROR:", error.message);
      });
      this.socket.on("disconnect", (reason) => {
        console.log("[SocketService] DISCONNECTED. Reason:", reason);
      });
      this.socket.connect();
    } catch (error) {
      console.error("[SocketService] Initialization failed:", error);
    }
  }
  joinCommunity(chatId: string, user: any) {
    if (!this.socket) return;
    if (this.socket.connected) {
      if (this.currentRoomId === chatId) {
        console.log("[SocketService] Already in room:", chatId);
        return;
      }
      this.currentRoomId = chatId;
      this.socket.emit(
        "joinChat",
        chatId
      );
    } else {
      this.socket.once("connect", () => this.joinCommunity(chatId, user));
    }
  }
  leaveCommunity(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave-chat", { chatId });
      if (this.currentRoomId === chatId) {
        this.currentRoomId = null;
      }
    }
  }

  stopAiMessage(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit("STOP_AI_MESSAGE", { chatId });
      store.dispatch(setStreamingStatus(false));
    }
  }

  sendMessage(
    chatId: string,
    content: string,
    user: any,
    aiMessageOrOptions?: boolean | { language?: string; isVoice?: boolean; isPersonalized?: boolean; sessionId?: string },
    replyToMessageId?: string
  ) {
    const isAI = typeof aiMessageOrOptions === 'boolean' ? aiMessageOrOptions : (typeof aiMessageOrOptions === 'object');
    const options = typeof aiMessageOrOptions === 'object' ? aiMessageOrOptions : undefined;

    const executeSend = () => {
      if (!this.socket) return;
      if (isAI) {
        const eventName = "SEND_PERSONALIZED_AI_MESSAGE";
        this.socket.emit(eventName, {
          chatId: chatId,
          userId: user.id || user.userId,
          username: user.name || user.userName,
          content: content,
          language: options?.language,
          isVoice: options?.isVoice,
          sessionId: options?.sessionId
        }, (response: any) => {
          console.log(`[SocketService] '${eventName}' ACK:`, response);
        });
      } else if (replyToMessageId) {
        const replyPayload = {
          chatId: chatId,
          replyToMessageId: replyToMessageId,
          content: content,
          userId: user.id || user.userId,
          username: user.name || user.userName,
        };
        this.socket.emit("REPLY_MESSAGE", replyPayload, (response: any) => {
          console.log("[SocketService] 'REPLY_MESSAGE' ACK:", response);
        });
      } else {
        // Regular message without reply
        const payload = {
          chatId: chatId,
          userId: user.id || user.userId,
          username: user.name || user.userName,
          content: content,
        };
        this.socket.emit("SEND_MESSAGE", payload, (response: any) => {
          console.log("[SocketService] 'SEND_MESSAGE' ACK:", response);
        });
      }
    };

    if (this.socket?.connected) {
      executeSend();
    } else if (this.socket) {
      console.log("[SocketService] Socket connecting, queuing message...");
      this.socket.once("connect", executeSend);
    } else {
      console.error("[SocketService] Cannot send: Socket not initialized");
    }

    // Optimistic update
    const optimisticId = `temp-${Date.now()}`;
    store.dispatch(
      addMessage({
        id: optimisticId,
        communityId: chatId,
        content: content,
        userId: user.id || user.userId,
        userName: user.name || "You",
        userAvatar: user.avatar || "",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: true,
        replyTo: undefined, // In a real app, we'd resolve this from the state
      })
    );
    store.dispatch(
      addAiMessage({
        id: optimisticId,
        communityId: chatId,
        content: content,
        userId: user.id || user.userId,
        userName: user.name || "You",
        userAvatar: user.avatar || "",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: true,
        replyTo: undefined, // In a real app, we'd resolve this from the state
      })
    );

    // Immediately show AI typing indicator locally if sending to AI
    if (isAI) {
      const tempAiMessageId = `temp-ai-${chatId}`;
      store.dispatch(addMessage({
        id: tempAiMessageId,
        userId: 'AI_BOT',
        userName: 'AI Assistant',
        userAvatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        communityId: chatId,
        isCurrentUser: false,
        type: 'text'
      }));
      store.dispatch(addAiMessage({
        id: tempAiMessageId,
        userId: 'AI_BOT',
        userName: 'AI Assistant',
        userAvatar: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        communityId: chatId,
        isCurrentUser: false,
        type: 'text'
      }));
      store.dispatch(setStreamingStatus(true));
    }
  }
  sendReaction(
    messageId: string,
    emoji: string,
    userId: string,
    userName: string
  ) {
    if (this.socket?.connected) {
      this.socket.emit("REACT_MESSAGE", {
        messageId: messageId,
        emoji: emoji,
        userId: userId,
        userName: userName,
      });
    }
  }
  deleteMessage(chatId: string, messageId: string, userId: string, username: string) {
    if (this.socket?.connected) {
      const payload = {
        messageId,
        userId,
        username,
        reason: "User deleted message"
      };
      this.socket.emit("DELETE_MESSAGE", payload);
    }
  }
  pinMessage(chatId: string, messageId: string, userId: string, username: string) {
    if (this.socket?.connected) {
      const payload = { messageId, userId, username };
      this.socket.emit("PIN_MESSAGE", payload);
    }
  }
  unpinMessage(chatId: string, messageId: string, userId: string, username: string) {
    if (this.socket?.connected) {
      const payload = { messageId, userId, username };
      this.socket.emit("UNPIN_MESSAGE", payload);
    }
  }
  editMessage(chatId: string, messageId: string, content: string, userId: string, username: string) {
    if (this.socket?.connected) {
      const payload = {
        messageId,
        newContent: content,
        userId,
        username,
      };
      this.socket.emit("EDIT_MESSAGE", payload, (response: any) => {
        if (response && response.success === false) {
          console.error(
            "[SocketService] Edit failed:",
            response.error || response.message
          );
        }
      });
    }
  }
  startAssessment(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit("start_assessment", { userId });
    }
  }
  private answerQueue: Map<string, { userId: string; questionId: string; selectedOptionId: string }> = new Map();

  submitAnswer(userId: string, questionId: string, selectedOptionId: string) {
    if (this.socket?.connected) {
      this.answerQueue.set(questionId, { userId, questionId, selectedOptionId });
      
      this.socket.emit("submit_answer", {
        userId,
        questionId,
        selectedOptionId,
      });
    }
  }
  endAssessment(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit("end_assessment", { userId });
    }
  }
}
export const socketService = new SocketService();