import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function ExhibitorBooth() {
    const [exhibitors, setExhibitors] = useState([]);
    const [booths, setBooths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBoothIndex, setActiveBoothIndex] = useState(0);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const exhibitorsRes = await axios.get("http://localhost:3000/exhibitor/getall");
            if (exhibitorsRes.data.status) {
                const myExhibitors = exhibitorsRes.data.data.filter(e => e.userId?._id === user?._id || e.userId === user?._id);
                setExhibitors(myExhibitors);

                if (myExhibitors.length > 0) {
                    const myExhibitorIds = myExhibitors.map(e => e._id);
                    const boothsRes = await axios.get("http://localhost:3000/booth/getall");
                    if (boothsRes.data.status) {
                        const myBooths = boothsRes.data.data.filter(b =>
                            myExhibitorIds.includes(b.assignedTo?._id || b.assignedTo)
                        );
                        setBooths(myBooths);
                    }
                }
            }
        } catch (error) {
            toast.error("Telemetry failure: Booth coordinates lost.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 grayscale opacity-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (exhibitors.length === 0) return (
        <div className="p-24 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-[48px] opacity-40 grayscale flex flex-col items-center gap-stack-md shadow-inner w-full">
            <span className="material-symbols-rounded text-[64px]">storefront</span>
            <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter">No Active Deployments</h3>
            <p className="font-label-md font-semibold tracking-wide max-w-md">You have not initiated any mission applications. Deployment required.</p>
            <button
                onClick={() => navigate('/apply-exhibitor')}
                className="mt-4 h-14 px-stack-xl rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
                Initiate Application
            </button>
        </div>
    );

    const activeBooth = booths[activeBoothIndex];

    return (
        <div className="space-y-stack-xl pb-20 w-full">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-gutter w-full">
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        Booth Locations
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Exhibition Booths Layout
                    </h1>
                </div>
                {booths.length > 1 && (
                    <div className="flex items-center gap-2 bg-surface-container-high p-2 rounded-2xl border border-outline-variant/10 shadow-inner">
                        {booths.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveBoothIndex(idx)}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold tracking-wide transition-all",
                                    activeBoothIndex === idx
                                        ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                                        : "text-on-surface-variant opacity-40 hover:opacity-100 hover:bg-surface-container-highest"
                                )}
                            >
                                Booth {idx + 1}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="w-full">
                {booths.length === 0 ? (
                    <div className="p-24 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-[48px] grayscale flex flex-col items-center gap-stack-md shadow-inner w-full">
                        <div className="w-20 h-20 rounded-[24px] bg-primary/10 flex items-center justify-center mb-4">
                            <span className="material-symbols-rounded text-[40px] text-primary">warning</span>
                        </div>
                        <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter">Assignment Pending</h3>
                        <p className="font-body-md text-on-surface-variant opacity-60 max-w-md mx-auto">
                            You have {exhibitors.length} application(s) detected, but sector hubs have not finalized your node coordinates yet.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        key={activeBooth?._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] overflow-hidden shadow-2xl relative w-full"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                        <div className="bg-surface-container-high/50 p-12 border-b border-outline-variant/20 relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-stack-md">
                                <div>
                                    <div className="flex items-center gap-unit text-primary font-label-sm text-[10px] font-semibold tracking-wide mb-4">
                                        <span className="material-symbols-rounded text-[18px]">location_on</span>
                                        Assigned Booth 
                                    </div>
                                    <h2 className="font-display-md text-display-md text-on-surface tracking-tighter leading-none">Booth Number : {activeBooth.boothNumber}</h2>
                                </div>
                                <div className="flex flex-col items-end gap-4">
                                    
                                    <div className="text-right">
                                        <p className="font-label-sm text-[9px] normal-case font-semibold tracking-wide text-on-surface-variant opacity-40 mb-1">REGISTRY ID</p>
                                        <p className="font-label-md text-label-md text-on-surface opacity-60 font-semibold tracking-wide">
                                            #{((activeBooth.assignedTo?._id || activeBooth.assignedTo)?.toString() || "").slice(-8).toUpperCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10 w-full">
                            <div className="space-y-10">
                                {[
                                    { label: "Booth Size", value: activeBooth.size, icon: "aspect_ratio", color: "text-primary" },
                                    { label: "Booth Location", value: activeBooth.locationOnFloor || "Main Hall", icon: "explore", color: "text-secondary" },
                                    { label: "Event Name", value: activeBooth.eventId?.title, icon: "hub", color: "text-primary", sub: new Date(activeBooth.eventId?.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-6 group">
                                        <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform">
                                            <span className={clsx("material-symbols-rounded text-[28px]", item.color)}>{item.icon}</span>
                                        </div>
                                        <div>
                                            <p className="font-label-sm text-[10px] font-semibold text-on-surface-variant opacity-40 mb-1">{item.label}</p>
                                            <p className="font-label-md text-label-md text-on-surface font-semibold">{item.value}</p>
                                            {item.sub && <p className="font-label-sm text-[10px] text-primary font-semibold mt-1 opacity-60">{item.sub}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col h-full justify-between">
                                <div className="bg-surface-container-high border border-outline-variant/10 rounded-[32px] p-8 relative overflow-hidden group shadow-inner flex flex-col justify-between h-full min-h-[220px]">
                                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 blur-[80px] group-hover:bg-primary/10 transition-colors" />
                                    <div>
                                        <h4 className="font-label-sm text-[10px] font-semibold text-on-surface mb-6 flex items-center gap-unit">
                                            <span className="material-symbols-rounded text-primary text-[18px]">inventory_2</span>
                                            Product
                                        </h4>
                                        <p className="font-body-md text-body-md text-on-surface-variant opacity-60 leading-relaxed mb-8 italic">
                                            "{exhibitors.find(e => (e._id === activeBooth.assignedTo?._id || e._id === activeBooth.assignedTo))?.products || "No asset intel provided."}"
                                        </p>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => navigate('/dashboard/exhibitor/profile')}
                                            className="w-full h-12 rounded-xl bg-surface-container-highest border border-outline-variant/20 text-[10px] font-semibold text-on-surface hover:bg-surface-container-high transition-all"
                                        >
                                            Edit Product
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}