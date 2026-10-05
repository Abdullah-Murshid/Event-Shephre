import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function ManageSchedules() {
    const todayStr = new Date().toISOString().split('T')[0];
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        topic: "",
        speaker: "",
        location: "",
        startTime: "",
        endTime: "",
        capacity: 50
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchSessions();
        } else {
            setSessions([]);
        }
    }, [selectedEventId]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get("http://localhost:3000/event/getall");
            if (response.data.status) {
                setEvents(response.data.data);
            }
        } catch (error) {
            toast.error("Telemetry failure: Event logs lost.");
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/event/get/${selectedEventId}`);
            if (response.data.status) {
                setSessions(response.data.data.schedule || []);
            }
        } catch (error) {
            toast.error("Telemetry failure: Session data lost.");
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const currentEvent = events.find(e => e._id === selectedEventId);
        const targetEventDate = currentEvent?.date ? new Date(currentEvent.date).toISOString().split('T')[0] : "2026-05-28";

        const fullStartTime = `${targetEventDate}T${formData.startTime}`;
        const fullEndTime = `${targetEventDate}T${formData.endTime}`;

        const selectedDate = new Date(fullStartTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            toast.error("Invalid date selected. Past schedules cannot be initialized.");
            return;
        }

        try {
            let updatedSessions = [...sessions];
            const sessionData = {
                title: formData.title,
                topic: formData.topic,
                speaker: formData.speaker,
                location: formData.location,
                startTime: fullStartTime,
                endTime: fullEndTime,
                capacity: Number(formData.capacity)
            };

            if (editingIndex !== null) {
                updatedSessions[editingIndex] = sessionData;
            } else {
                updatedSessions.push(sessionData);
            }

            const response = await axios.put(`http://localhost:3000/event/update/${selectedEventId}`, {
                schedule: updatedSessions
            });

            if (response.data.status) {
                toast.success(editingIndex !== null ? "Protocol updated: Session modified." : "Protocol updated: Session launched.");
                setShowForm(false);
                setEditingIndex(null);
                setFormData({ title: "", topic: "", speaker: "", location: "", startTime: "", endTime: "", capacity: 50 });
                fetchSessions();
            }
        } catch (error) {
            toast.error("Execution failure: Operation denied.");
        }
    };

    const handleDelete = async (index) => {
        if (!window.confirm("Terminate this session record? Node will be removed from schedule.")) return;
        try {
            let updatedSessions = sessions.filter((_, i) => i !== index);
            const response = await axios.put(`http://localhost:3000/event/update/${selectedEventId}`, {
                schedule: updatedSessions
            });

            if (response.data.status) {
                toast.success("Protocol updated: Session terminated.");
                fetchSessions();
            }
        } catch (error) {
            toast.error("Execution failure: Termination denied.");
        }
    };

    return (
        <div className="space-y-stack-xl pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        Timeline Management
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Event Session Schedules
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-stack-sm w-full md:w-auto mt-6 md:mt-0">
                    <div className="relative group w-full min-w-[280px]">
                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity z-10">hub</span>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 pl-12 pr-6 text-on-surface font-label-md text-label-md appearance-none focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                        >
                            <option value="">Select Event</option>
                            {events.map(e => (
                                <option key={e._id} value={e._id}>{e.title}</option>
                            ))}
                        </select>
                        <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 pointer-events-none">expand_more</span>
                    </div>

                    {selectedEventId && (
                        <button
                            onClick={() => { setShowForm(!showForm); setEditingIndex(null); setFormData({ title: "", topic: "", speaker: "", location: "", startTime: "", endTime: "", capacity: 50 }); }}
                            className={clsx(
                                "w-full sm:w-auto justify-center h-14 px-stack-xl rounded-2xl font-label-md text-label-md font-semibold tracking-wide transition-all flex items-center gap-stack-sm shadow-xl",
                                showForm
                                    ? "bg-surface-container-highest text-on-surface-variant border border-outline-variant/30"
                                    : "bg-primary text-on-primary shadow-primary/20 hover:scale-105 active:scale-95"
                            )}
                        >
                            <span className="material-symbols-rounded">{showForm ? "close" : "add_circle"}</span>
                            {showForm ? "Cancel & Discard" : "Create New Session Slot"}
                        </button>
                    )}
                </div>
            </header>

            <AnimatePresence>
                {selectedEventId && showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter mb-10">
                                    {editingIndex !== null ? "Modify Session" : "Create New Session Slot"}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Session Title</label>
                                            <input
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Neural Link Keynote"
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Topic / Category</label>
                                            <input
                                                name="topic"
                                                value={formData.topic}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Cognitive AI"
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Guest Speaker Name</label>
                                            <input
                                                name="speaker"
                                                value={formData.speaker}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Dr. Alistair Thorne"
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Hall / Room Number</label>
                                            <input
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Main Auditorium"
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Start Sequence</label>
                                            <input
                                                name="startTime"
                                                type="time"
                                                value={formData.startTime}
                                                onChange={handleInputChange}
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">End Sequence</label>
                                            <input
                                                name="endTime"
                                                type="time"
                                                value={formData.endTime}
                                                onChange={handleInputChange}
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4">Seating Capacity</label>
                                            <input
                                                name="capacity"
                                                type="number"
                                                value={formData.capacity}
                                                onChange={handleInputChange}
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-16 rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                                    >
                                        {editingIndex !== null ? "Update Session" : "Confirm & Save Session"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!selectedEventId ? (
                <div className="p-24 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-[48px] opacity-40 grayscale flex flex-col items-center gap-stack-md shadow-inner">
                    <span className="material-symbols-rounded text-[64px]">hub</span>
                    <p className="font-label-md font-semibold tracking-wide">Select an Event Hub to visualize timeline nodes.</p>
                </div>
            ) : sessions.length === 0 && !showForm ? (
                <div className="p-24 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-[48px] opacity-40 grayscale flex flex-col items-center gap-stack-md shadow-inner">
                    <span className="material-symbols-rounded text-[64px]">event_busy</span>
                    <p className="font-label-md font-semibold tracking-wide">No active session nodes detected in this sector.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-gutter">
                    {sessions.map((session, index) => (
                        <div key={index} className="bg-surface-container-low border border-outline-variant/15 rounded-[32px] p-8 hover:bg-primary/[0.02] transition-all group shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between gap-gutter">
                                <div className="space-y-stack-md min-w-0 flex-grow">
                                    <div className="flex flex-wrap items-center gap-stack-sm mb-unit">
                                        <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-label-sm text-[10px] font-semibold tracking-wide">
                                            {session.topic}
                                        </span>
                                        <div className="flex items-center gap-unit px-3 py-1 rounded-lg bg-surface-container-high border border-outline-variant/10 text-on-surface-variant opacity-40 font-label-sm text-[10px] font-semibold tracking-wide">
                                            <span className="material-symbols-rounded text-[14px]">groups</span>
                                            {session.capacity} Signal Limit
                                        </div>
                                    </div>
                                    <h3 className="font-display-sm text-display-sm text-on-surface group-hover:text-primary transition-colors tracking-tighter leading-tight">
                                        {session.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-stack-xl">
                                        <div className="flex items-center gap-unit">
                                            <span className="material-symbols-rounded text-primary text-[20px] opacity-60">person</span>
                                            <span className="font-body-md text-body-md text-on-surface-variant opacity-70">{session.speaker}</span>
                                        </div>
                                        <div className="flex items-center gap-unit">
                                            <span className="material-symbols-rounded text-secondary text-[20px] opacity-60">location_on</span>
                                            <span className="font-body-md text-body-md text-on-surface-variant opacity-70">{session.location}</span>
                                        </div>
                                        <div className="flex items-center gap-unit bg-surface-container-high px-4 py-1.5 rounded-xl border border-outline-variant/10">
                                            <span className="material-symbols-rounded text-primary text-[20px]">schedule</span>
                                            <span className="font-label-md text-label-md text-on-surface font-semibold tabular-nums tracking-wide">
                                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                <span className="mx-2 opacity-20">/</span>
                                                {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center md:items-start gap-stack-sm opacity-40 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button
                                        onClick={() => {
                                            setEditingIndex(index);

                                            const startStr = new Date(session.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                                            const endStr = new Date(session.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

                                            setFormData({
                                                ...session,
                                                startTime: startStr,
                                                endTime: endStr
                                            });
                                            setShowForm(true);
                                        }}
                                        className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center justify-center shadow-sm"
                                        title="Modify Node"
                                    >
                                        <span className="material-symbols-rounded">edit_note</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all flex items-center justify-center shadow-sm"
                                        title="Terminate Node"
                                    >
                                        <span className="material-symbols-rounded">delete_sweep</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
