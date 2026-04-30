import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { aiApi } from "../../../services/aiApi";
import { RootState } from "../../../app/store";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Search, Trash2 } from "lucide-react";
import ConfirmDialog from "../../../components/custom/ConfirmDialog";

export const AIChatHistory = () => {
    const navigate = useNavigate();
    const { userDetails, accessToken } = useSelector((state: RootState) => state.ar);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chats, setChats] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        try {
            if (accessToken && userDetails?.id) {
                const data = await aiApi.getChats(accessToken, userDetails.id);
                // Map to match existing structure
                const mappedChats = data.map((c: any) => ({
                    id: c.id,
                    _id: c.id, // Keep both for compatibility
                    title: c.title,
                    lastMessage: "", // AI chat summary API might not return this anymore, but it's optional UI fallback
                    createdAt: c.createdAt
                }));
                setChats(mappedChats);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        setChatToDelete(chatId);
    };

    const confirmDelete = async () => {
        if (chatToDelete && accessToken && userDetails?.id) {
            try {
                await aiApi.deleteChat(accessToken, chatToDelete, userDetails.id);
                loadChats();
                window.dispatchEvent(new Event("chatListUpdate"));
            } catch (err) {
                console.error("Failed to delete chat", err);
            } finally {
                setChatToDelete(null);
            }
        }
    };

    const filteredChats = chats.filter(chat =>
        (chat.title || "Untitled Chat").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* <div className="flex items-center gap-4 mb-8"> */}
                    {/* <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button> */}
                    {/* <h1 className="text-2xl font-bold text-gray-800">Chat History</h1>
                </div> */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search your conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {filteredChats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => navigate(`/ai-chat?chatId=${chat.id}`)}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start justify-between group"
                        >
                            <div className="flex items-start gap-4">
                                {/* <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                    <MessageSquare className="w-5 h-5" />
                                </div> */}
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{chat.title || "Untitled Chat"}</h3>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                        {/* <div className="flex items-center gap-1">
                                            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">L</span>
                                        </div> */}
                                        <span>{new Date(chat.createdAt || Date.now()).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleDeleteClick(e, chat._id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    {filteredChats.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No conversations found matching your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!chatToDelete}
                onClose={() => setChatToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Chat"
                message="Are you sure you want to delete this conversation?"
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </div>
    );
};
