import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function ManageFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get("http://localhost:3000/feedback/getall");
            if (response.data.status) {
                setFeedbacks(response.data.data);
            }
        } catch (error) {
            toast.error("Telemetry failure: Signal lost.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Terminate this feedback record? This action is irreversible.")) return;
        try {
            const response = await axios.delete(`http://localhost:3000/feedback/delete/${id}`);
            if (response.data.status) {
                toast.success("Protocol updated: Data purged.");
                fetchFeedbacks();
            }
        } catch (error) {
            toast.error("Execution failure: Purge denied.");
        }
    };

    return (
        <div className="space-y-stack-xl pb-20">
            <header>
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        User Feedback
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Platform Reviews & Ratings
                    </h1>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-gutter">
                {feedbacks.length === 0 ? (
                    <div className="p-24 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-[48px] opacity-40 grayscale flex flex-col items-center gap-stack-md shadow-inner">
                        <span className="material-symbols-rounded text-[64px]">rate_review</span>
                        <p className="font-label-md font-semibold tracking-wide">No feedback transmissions detected.</p>
                    </div>
                ) : (
                    feedbacks.map((fb) => (
                        <div key={fb._id} className="bg-surface-container-low border border-outline-variant/30 rounded-[40px] p-10 shadow-xl group hover:bg-primary/[0.02] transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                            <div className="flex flex-col md:flex-row justify-between gap-gutter relative z-10">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-[20px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                                            <span className="material-symbols-rounded text-[24px]">message</span>
                                        </div>
                                        <div>
                                            <span className={clsx(
                                                "text-[9px] font-bold tracking-wide px-3 py-1 rounded-full border",
                                                fb.type === 'issue' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                                                    fb.type === 'suggestion' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                                        'bg-primary/10 text-primary border-primary/20'
                                            )}>
                                                {fb.type} Transmission
                                            </span>
                                            <p className="text-on-surface font-label-md text-label-md font-semibold opacity-40 mt-1">Operative ID: {fb.userId}</p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <span className="material-symbols-rounded absolute -left-2 -top-2 text-primary opacity-10 text-[48px] pointer-events-none">format_quote</span>
                                        <p className="font-body-lg text-body-lg text-on-surface leading-relaxed ml-8">
                                            {fb.message}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-stack-xl pt-6 border-t border-outline-variant/10">
                                        <div className="flex items-center gap-unit text-on-surface-variant opacity-40">
                                            <span className="material-symbols-rounded text-[18px]">calendar_today</span>
                                            <span className="font-label-sm text-[10px] font-semibold tracking-wide">
                                                {new Date(fb.createdAt).toLocaleDateString()} / {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-unit text-on-surface-variant opacity-40">
                                            <span className="material-symbols-rounded text-[18px]">hub</span>
                                            <span className="font-label-sm text-[10px] font-semibold tracking-wide">
                                                Sector Hub: {fb.eventId}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <button
                                        onClick={() => handleDelete(fb._id)}
                                        className="w-14 h-14 bg-surface-container-high border border-outline-variant/20 rounded-2xl text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all flex items-center justify-center shadow-sm group/btn"
                                        title="Purge Transmission"
                                    >
                                        <span className="material-symbols-rounded text-[24px] group-hover/btn:scale-110 transition-transform">delete_sweep</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
