import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";
import { connectSocket, getSocket } from "../services/socketService";

export default function ChatModal({ isOpen, onClose, partnerExhibitor, eventId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const hasFetchedRef = useRef(false);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (!isOpen || !user || !partnerExhibitor) return;
        if (partnerExhibitor._id !== hasFetchedRef.current) {
            hasFetchedRef.current = partnerExhibitor._id;
            setMessages([]);
            fetchMessages();
        }
    }, [isOpen, user, partnerExhibitor?._id]);

    useEffect(() => {
        if (!isOpen) return;
        const s = getSocket();
        if (!s) return;
        const handleNewMessage = (message) => {
            const partnerId = partnerExhibitor?.userId?._id || partnerExhibitor?.userId;
            const senderId = message.senderId?._id ?? message.senderId;
            if (senderId === partnerId) {
                setMessages((prev) => {
                    if (prev.some((m) => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }
        };
        s.on("newMessage", handleNewMessage);
        return () => {
            s.off("newMessage", handleNewMessage);
        };
    }, [isOpen, partnerExhibitor]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async () => {
        if (!user || !partnerExhibitor) return;
        setLoading(true);
        try {
            const partnerId = partnerExhibitor.userId?._id || partnerExhibitor.userId;
            const response = await axios.get(
                `http://localhost:3000/message/thread/${user._id}/${partnerId}`
            );
            if (response.data.status) {
                setMessages(response.data.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user || !partnerExhibitor) return;
        const partnerId = partnerExhibitor.userId?._id || partnerExhibitor.userId;
        connectSocket(user._id);
        setSending(true);
        try {
            const response = await axios.post("http://localhost:3000/message/send", {
                senderId: user._id,
                receiverId: partnerId,
                expoId: eventId,
                content: newMessage
            });
            if (response.data.status) {
                const messageData = {
                    ...response.data.data,
                    senderId: { _id: user._id, name: user.name },
                    receiverId: { _id: partnerId, name: partnerExhibitor.companyName }
                };
                setMessages((prev) => [...prev, messageData]);
                setNewMessage("");
                const s = getSocket();
                if (s && s.connected) {
                    s.emit("sendMessage", {
                        receiverId: partnerId,
                        message: messageData
                    });
                }
            }
        } catch (error) {
            toast.error("Transmission failed.");
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-surface-container-low border border-outline-variant/30 w-full max-w-lg h-[650px] flex flex-col rounded-[40px] shadow-2xl relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-stack-xl border-b border-outline-variant/15 bg-surface-container-low/50 backdrop-blur-xl">
                        <div className="flex items-center gap-stack-md">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-rounded">support_agent</span>
                            </div>
                            <div>
                                <h3 className="font-title-md text-title-md tracking-tight text-on-surface">
                                    {partnerExhibitor?.companyName || "Tactical Unit"}
                                </h3>
                                <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60 flex items-center gap-unit font-medium tracking-wide font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Channel
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"
                        >
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>

                    {/* Transmission Stream */}
                    <div className="flex-1 overflow-y-auto p-stack-xl space-y-stack-md custom-scrollbar bg-surface-container-lowest/30">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-40 grayscale gap-stack-md">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="font-label-sm text-label-sm font-medium tracking-wide font-bold">Syncing Thread...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-stack-md opacity-40">
                                <span className="material-symbols-rounded text-[56px]">chat_bubble_outline</span>
                                <div>
                                    <h4 className="font-title-sm text-title-sm tracking-tight text-on-surface">Secure Channel Established</h4>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[240px] mx-auto">
                                        Initiate transmission with {partnerExhibitor?.companyName}.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: isOwn ? 10 : -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={clsx("flex flex-col", isOwn ? "items-end" : "items-start")}
                                    >
                                        <div
                                            className={clsx(
                                                "max-w-[85%] px-stack-lg py-stack-md rounded-[24px] shadow-sm",
                                                isOwn
                                                    ? "bg-primary text-on-primary rounded-tr-none"
                                                    : "bg-surface-container-high text-on-surface rounded-tl-none border border-outline-variant/20"
                                            )}
                                        >
                                            <p className="font-body-md text-body-md leading-relaxed">{msg.content}</p>
                                        </div>
                                        <span className="font-label-sm text-[10px] mt-unit text-on-surface-variant opacity-40 px-2 font-medium tracking-tight">
                                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    </motion.div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Command Input */}
                    <div className="p-stack-xl border-t border-outline-variant/15 bg-surface-container-low/50 backdrop-blur-xl">
                        <div className="flex items-center gap-stack-md bg-surface-container-high border border-outline-variant/30 rounded-2xl p-unit focus-within:border-primary/50 transition-all shadow-inner">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter message payload..."
                                className="flex-1 bg-transparent border-none px-stack-md py-stack-sm text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/30 focus:outline-none"
                                disabled={sending}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || sending}
                                className={clsx(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg",
                                    !newMessage.trim() || sending
                                        ? "bg-surface-container-highest text-on-surface-variant/30 opacity-50"
                                        : "bg-primary text-on-primary hover:bg-primary/90"
                                )}
                            >
                                {sending ? (
                                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-rounded">send</span>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}