import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Bell, X, CheckCheck } from "lucide-react";
import { getUserNotifications, markNotificationsAsRead } from "../../services/notificationService";

export const NotificationBell = () => {
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userDetails = useSelector((state: any) => state.ar.userDetails);
    const userId = userDetails?.id;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userId) return;
            const data = await getUserNotifications(userId);
            setNotifications(data);
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hasUnread = notifications.some(n => !n.isRead);

    const handleBellClick = async () => {
        const nextState = !notificationsOpen;
        setNotificationsOpen(nextState);

        if (nextState && userId && hasUnread) {
            await markNotificationsAsRead(userId);
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={handleBellClick}
                className={`cursor-pointer flex items-center justify-center relative ${notificationsOpen
                    ? 'text-[#00BF53]'
                    : 'text-dark-gray'
                    }`}
            >
                <div className="relative">
                    <Bell className={`w-5 h-5`} />
                    {hasUnread && (
                        <>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full z-10"></span>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></span>
                        </>
                    )}
                </div>
            </div>

            {notificationsOpen && (
                <div className="absolute min-w-[20vw] right-0 mt-3 w-85 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[100] ring-1 ring-black/5">
                    <div className="p-4 border-b border-border/40 flex justify-between items-center bg-white/50">
                        <div>
                            <h3 className="font-bold text-dark-gray text-sm">Notifications</h3>
                            <p className="text-[10px] text-text-gray font-medium">{notifications.filter(n => !n.isRead).length} New Updates</p>
                        </div>
                        <button
                            onClick={() => setNotificationsOpen(false)}
                            className="p-1.5 hover:bg-green-50 group rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-text-gray group-hover:text-green-500" />
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-1">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-border/30">
                                {notifications.map((notif, index) => (
                                    <div
                                        key={index}
                                        className="p-4 hover:bg-primary/5 cursor-pointer transition-all duration-200 group/item relative overflow-hidden"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300"></div>
                                        <p className="text-xs font-bold text-dark-gray mb-1 group-hover/item:text-primary transition-colors">{notif.title}</p>
                                        <p className="text-[11px] text-text-gray line-clamp-2 leading-relaxed">{notif.body}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-[9px] text-text-gray/60 font-medium">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            {notif.isRead === false && (
                                                <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/30">
                                    <Bell className="w-8 h-8 text-border" />
                                </div>
                                <p className="text-xs text-text-gray font-semibold">All caught up!</p>
                                <p className="text-[10px] text-text-gray/60 mt-1">No new notifications for now.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-border/40 bg-white/50 text-center">
                        <button className="text-[11px] font-bold text-[#00BF53] px-4 py-1 rounded-full hover:text-white hover:bg-[#00BF53] transition-colors flex items-center justify-center gap-1 mx-auto group">
                            View All Notifications
                            <Bell className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};