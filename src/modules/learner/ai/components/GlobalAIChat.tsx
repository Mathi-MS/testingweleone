import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChatInputArea } from "./ChatInputArea";
import { AIChatInterface } from "../AIChatInterface";
import { X, Bot } from "lucide-react";
import { socketService } from "../../../../services/socketService";
import { AppDispatch, RootState } from "../../../../app/store";
import { aiApi } from "../../../../services/aiApi";
import { setActiveAiChat } from "../../../../features/aiChatSlice";

export const GlobalAIChat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const { isStreaming } = useSelector((state: RootState) => state.aiChat);
    const { userDetails, accessToken } = useSelector((state: RootState) => state.ar);
    const isSessionPage = location.pathname.includes('/session/');

    // If we are on the dedicated full-screen page, do not render this global interface
    if (location.pathname === "/ai-chat" || location.pathname.startsWith("/ai-chat/") || location.pathname.startsWith("/admin/") || location.pathname.startsWith("/trainer/" )) {
        return null;
    }

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const messageContent = inputValue;
        setInputValue("");

        // Extract sessionId if on session page
        let sessionId: string | undefined = undefined;
        const pathParts = location.pathname.split('/');
        if (pathParts.includes('session')) {
            const sessionIndex = pathParts.indexOf('session');
            if (sessionIndex !== -1 && pathParts.length > sessionIndex + 1) {
                sessionId = pathParts[sessionIndex + 1];
            }
        }

        // Open the drawer
        setIsOpen(true);

        let targetChatId = "temp-new-chat";
        if (accessToken && userDetails?.id) {
            try {
                const title = messageContent.length > 30 ? messageContent.substring(0, 30) + "..." : messageContent;
                const sourceType = sessionId ? 'session' : 'dashboard';
                const newChat = await aiApi.createChat(accessToken, userDetails.id, title, sourceType, undefined, sessionId);
                targetChatId = newChat.id;

                // Set active ai chat so messages don't get rejected by slice
                dispatch(setActiveAiChat(targetChatId));

                window.dispatchEvent(new CustomEvent("aiChatCreated", { detail: { chatId: targetChatId } }));
            } catch (err) {
                console.error("Failed to create chat", err);
            }
        }

        socketService.sendMessage(
            targetChatId,
            messageContent,
            userDetails || { id: "guest", name: "Guest" },
            { isPersonalized: true, sessionId }
        );

    };

    const handleStop = () => {
        // Here we don't have activeChatId readily available in component state 
    };

    return (
        <>
            {/* Floating Input Area for all other pages */}
            {!isOpen && (
                <div className="fixed bottom-0 left-0 w-full z-30 pt-4 sm:pt-10 pointer-events-none lg:left-[239px] lg:w-[calc(100%-239px)]">
                    <div className="pointer-events-auto px-2 sm:px-4">
                        <ChatInputArea
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            handleSend={handleSend}
                            className="!bg-transparent !pb-2 sm:!pb-4 max-w-4xl mx-auto"
                            showSuggestions={isSessionPage}
                            isStreaming={isStreaming}
                            handleStop={handleStop}
                        />
                    </div>
                </div>
            )}

            {/* Side Drawer Modal */}
            <div
                className={`fixed inset-y-0 right-0 w-full lg:w-[calc(100%-239px)] bg-white shadow-xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header for the modal */}
                <div className="flex items-center justify-end px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    </button>
                </div>

                {/* Chat Interface Content */}
                <div className="flex-1 overflow-hidden relative">
                    {isOpen && <AIChatInterface isModal={true} />}
                </div>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
