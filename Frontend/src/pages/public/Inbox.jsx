import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";
import { connectSocket, getSocket } from "../../services/socketService";

export default function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesContainerRef = useRef(null);

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch (e) {
            return null;
        }
    }, []);

    const selectedConvRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = useCallback(async () => {
        if (!user?._id) return;
        try {
            const response = await axios.get(
                `http://localhost:3000/message/conversations/${user._id}`
            );
            if (response.data.status) {
                setConversations(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user?._id]);

    useEffect(() => {
        selectedConvRef.current = selectedConversation;
    }, [selectedConversation]);

    useEffect(() => {
        if (!user?._id) return;
        connectSocket(user._id);
        fetchConversations();
    }, [user?._id, fetchConversations]);

    useEffect(() => {
        if (!user?._id) return;

        const s = getSocket();
        if (!s) return;

        const handleNewMessage = (message) => {
            const current = selectedConvRef.current;
            if (current) {
                const partnerId = current.partnerId;
                const senderId = message.senderId?._id ?? message.senderId;
                const receiverId = message.receiverId?._id ?? message.receiverId;

                if (senderId === partnerId || receiverId === partnerId) {
                    setMessages((prev) => {
                        if (prev.some((m) => m._id === message._id)) return prev;
                        return [...prev, message];
                    });
                }
            }
            fetchConversations();
        };

        s.on("newMessage", handleNewMessage);
        return () => s.off("newMessage", handleNewMessage);
    }, [user?._id, fetchConversations]);

    const fetchMessages = async (conversation) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/message/thread/${user._id}/${conversation.partnerId}`
            );
            if (response.data.status) {
                setMessages(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        await fetchMessages(conversation);
        fetchConversations();
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || sending) return;

        const optimisticMsg = {
            _id: `temp-${Date.now()}`,
            senderId: { _id: user._id, name: user.name },
            receiverId: {
                _id: selectedConversation.partnerId,
                name: selectedConversation.partnerName,
            },
            content: newMessage,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setNewMessage("");
        setSending(true);

        try {
            const response = await axios.post("http://localhost:3000/message/send", {
                senderId: user._id,
                receiverId: selectedConversation.partnerId,
                expoId: selectedConversation.eventId,
                content: optimisticMsg.content,
            });

            if (response.data.status) {
                const realMsg = {
                    ...response.data.data,
                    senderId: { _id: user._id, name: user.name },
                    receiverId: {
                        _id: selectedConversation.partnerId,
                        name: selectedConversation.partnerName,
                    },
                };
                setMessages((prev) => {
                    const alreadyExists = prev.some(m => m._id === realMsg._id);
                    if (alreadyExists) {
                        return prev.filter(m => m._id !== optimisticMsg._id);
                    }
                    return prev.map((m) => (m._id === optimisticMsg._id ? realMsg : m));
                });
                fetchConversations();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to send message");
            setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
            setNewMessage(optimisticMsg.content);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const diff = now - msgDate;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return msgDate.toLocaleDateString();
    };

    if (!user) return null;

    return (


        
        <div className="space-y-stack-xl pb-20">

            <header className="relative">
                <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                           Messages
                </div>
                <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">Direct Messaging</h1>

            </header>

            <div className="flex flex-1 min-h-0 bg-surface-container-low border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xl">
                
                <div className={clsx(
                    "flex flex-col w-full md:w-80 lg:w-96 border-r border-outline-variant/30 bg-surface-container-low shrink-0 transition-all",
                    selectedConversation ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-stack-md border-b border-outline-variant/30 bg-surface-container flex items-center justify-between">
                        <span className="font-title-sm text-title-sm tracking-tight text-on-surface font-medium tracking-wide">Inbox</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-stack-xl flex flex-col items-center gap-stack-md opacity-40">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="font-label-md">Syncing communications...</p>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-stack-xl text-center flex flex-col items-center opacity-30">
                                <span className="material-symbols-rounded text-[48px] mb-stack-md">chat_bubble</span>
                                <p className="font-title-sm">No transmissions found</p>
                            </div>
                        ) : (
                            conversations.map((conv, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={clsx(
                                        "w-full px-stack-md py-stack-md border-b border-outline-variant/20 hover:bg-surface-container-high transition-all text-left flex items-start gap-stack-md relative group",
                                        selectedConversation?.partnerId === conv.partnerId && "bg-surface-container-highest"
                                    )}
                                >
                                    {selectedConversation?.partnerId === conv.partnerId && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                    )}
                                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
                                        <span className="material-symbols-rounded text-[24px]">account_circle</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-stack-sm mb-unit">
                                            <span className="font-title-sm text-title-sm tracking-tight text-on-surface truncate group-hover:text-primary transition-colors">
                                                {conv.partnerName}
                                            </span>
                                            <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">
                                                {formatTime(conv.lastMessageTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-unit mb-1">
                                            <span className="px-1.5 py-0.5 bg-surface-container-highest text-on-surface-variant rounded text-[11px] font-medium tracking-wide font-bold">
                                                {conv.partnerRole}
                                            </span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate opacity-80 group-hover:opacity-100 transition-opacity">
                                            {conv.lastMessage}
                                        </p>
                                    </div>

                                    {conv.unreadCount > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-primary text-on-primary font-bold text-[10px] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={clsx(
                    "flex-1 flex flex-col min-w-0 bg-surface-dim relative",
                    !selectedConversation ? "hidden md:flex" : "flex"
                )}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-stack-md py-stack-md border-b border-outline-variant/30 bg-surface-container flex items-center gap-stack-md shrink-0">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant"
                                >
                                    <span className="material-symbols-rounded">arrow_back</span>
                                </button>
                                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                                    <span className="material-symbols-rounded">person</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="font-title-md text-title-md tracking-tight text-on-surface truncate">
                                        {selectedConversation.partnerName}
                                    </h3>
                                   
                                </div>
                                <div className="ml-auto flex items-center gap-stack-sm">
                                    <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors">
                                        <span className="material-symbols-rounded">more_vert</span>
                                    </button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div 
                                className="h-[calc(100vh-420px)] overflow-y-auto pr-2 px-stack-lg py-stack-lg space-y-stack-md custom-scrollbar bg-[radial-gradient(circle_at_bottom_right,_rgba(30,58,138,0.05),_transparent_40%)]" 
                                ref={messagesContainerRef}
                            >
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full opacity-20 py-stack-xl">
                                        <span className="material-symbols-rounded text-[64px]">chat_bubble_outline</span>
                                        <p className="font-body-md mt-stack-md">Initiate transmission sequence...</p>
                                    </div>
                                )}
                                {messages.map((msg, index) => {
                                    const isOwn = (msg.senderId?._id ?? msg.senderId) === user._id;
                                    return (
                                        <div
                                            key={msg._id ?? index}
                                            className={clsx(
                                                "flex w-full",
                                                isOwn ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={clsx(
                                                "max-w-[75%] p-stack-md rounded-2xl shadow-sm transition-all hover:shadow-md",
                                                isOwn
                                                    ? "bg-primary text-on-primary rounded-tr-none"
                                                    : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/30"
                                            )}>
                                                <p className="font-body-sm text-body-sm leading-relaxed">{msg.content}</p>
                                                <div className={clsx(
                                                    "flex items-center gap-unit mt-unit",
                                                    isOwn ? "justify-end" : "justify-start"
                                                )}>
                                                    <span className={clsx(
                                                        "font-label-sm text-[9px] font-medium tracking-tight opacity-60",
                                                        isOwn ? "text-on-primary" : "text-on-surface-variant"
                                                    )}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    {isOwn && <span className="material-symbols-rounded text-[10px] opacity-60">check_circle</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Message Input */}
                            <div className="p-stack-md bg-surface-container-low border-t border-outline-variant/30">
                                <div className="flex items-center gap-stack-sm bg-surface-container-high border border-outline-variant/50 rounded-xl px-stack-md py-stack-xs focus-within:border-primary/50 transition-all shadow-inner">
                                    <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                                        <span className="material-symbols-rounded">attach_file</span>
                                    </button>
                                    <textarea
                                        rows="1"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Enter transmission data..."
                                        className="flex-1 bg-transparent border-none py-2 text-on-surface font-body-sm text-body-sm placeholder:text-on-surface-variant/50 focus:ring-0 resize-none max-h-32"
                                        disabled={sending}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all shrink-0 shadow-lg",
                                            !newMessage.trim() || sending
                                                ? "bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                                                : "bg-primary text-on-primary hover:bg-primary/90 hover:scale-105"
                                        )}
                                    >
                                        <span className="material-symbols-rounded">send</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-stack-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,58,138,0.05),_transparent_70%)] group-hover:scale-125 transition-transform duration-1000" />
                            <div className="w-20 h-20 rounded-3xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center mb-stack-lg shadow-xl relative z-10 group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-rounded text-primary text-[40px]">forum</span>
                            </div>
                            <h3 className="font-display-md text-display-md tracking-tight text-on-surface mb-unit relative z-10">Select Transmission</h3>
                            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm relative z-10">
                                Secure point-to-point communication channel for exhibitors and attendees.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}