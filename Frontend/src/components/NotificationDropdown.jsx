import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Bell, Calendar, Clock, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({ 
    isOpen, 
    onClose, 
    user, 
    notifications: propNotifications, 
    count, 
    setNotificationCount, 
    setNotifications 
}) {
    const isDbMode = !!propNotifications;
    const notifications = isDbMode ? propNotifications : [];
    const navigate = useNavigate();

    const handleNotificationClick = async (notification) => {
        onClose();
        if (isDbMode && setNotifications && setNotificationCount) {
            try {
                await axios.put(`http://localhost:3000/notifications/read/${notification._id}`);
                // Update parent states
                setNotifications(prev => prev.filter(n => n._id !== notification._id));
                setNotificationCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.log("Failed to mark notification as read:", error);
            }
        }
        
        // Redirect based on type
        if (notification.type === 'event') {
            navigate("/events");
        } else if (notification.type === 'schedule') {
            navigate("/dashboard/attendee");
        } else {
            navigate("/dashboard");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'event': return <Calendar size={18} />;
            case 'schedule': return <Clock size={18} />;
            case 'system':
            default: return <Bell size={18} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'event': return "text-accent-blue bg-accent-blue/10";
            case 'schedule': return "text-orange-400 bg-orange-400/10";
            case 'system':
            default: return "text-teal-400 bg-teal-400/10";
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Bell size={18} className="text-accent-blue" />
                        <h3 className="text-white font-bold text-sm tracking-wide">Notifications</h3>
                    </div>
                    {count > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                            {count} Unread
                        </span>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={16} className="text-slate-400" />
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell size={40} className="mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-400 text-sm font-semibold">All caught up!</p>
                            <p className="text-slate-500 text-xs mt-1">
                                No new notifications at the moment.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification, index) => (
                                <button
                                    key={notification._id || index}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="w-full p-4 hover:bg-white/5 transition-colors text-left"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getTypeColor(notification.type)}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-white font-bold text-sm truncate">
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[9px] font-semibold text-slate-400">
                                                    {notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-3 border-t border-white/10">
                        <button
                            onClick={() => {
                                onClose();
                                navigate("/dashboard/attendee");
                            }}
                            className="w-full text-center text-xs text-accent-blue hover:text-white font-bold"
                        >
                            View Dashboard Panel
                        </button>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}