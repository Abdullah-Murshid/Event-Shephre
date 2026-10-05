import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function ManageBooths() {
    const [booths, setBooths] = useState([]);
    const [events, setEvents] = useState([]);
    const [exhibitors, setExhibitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooth, setEditingBooth] = useState(null);
    const [formData, setFormData] = useState({
        eventId: "",
        boothNumber: "",
        size: "medium",
        locationOnFloor: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [boothsRes, eventsRes, exhibitorsRes] = await Promise.all([
                axios.get("http://localhost:3000/booth/getall"),
                axios.get("http://localhost:3000/event/getall"),
                axios.get("http://localhost:3000/exhibitor/getall")
            ]);

            if (boothsRes.data.status) setBooths(boothsRes.data.data);
            if (eventsRes.data.status) setEvents(eventsRes.data.data);
            if (exhibitorsRes.data.status) setExhibitors(exhibitorsRes.data.data);
        } catch (error) {
            toast.error("Telemetry failure: Sector data lost.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let response;
            if (editingBooth) {
                response = await axios.put(`http://localhost:3000/booth/update/${editingBooth._id}`, formData);
            } else {
                response = await axios.post("http://localhost:3000/booth/create", formData);
            }

            if (response.data.status) {
                toast.success(editingBooth ? "Protocol updated: Booth modified." : "Protocol updated: Booth initialized.");
                setIsModalOpen(false);
                setEditingBooth(null);
                setFormData({ eventId: "", boothNumber: "", size: "medium", locationOnFloor: "" });
                fetchData();
            }
        } catch (error) {
            toast.error("Execution failure: Node error.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Terminate this booth node? This action is irreversible.")) return;
        try {
            const response = await axios.delete(`http://localhost:3000/booth/delete/${id}`);
            if (response.data.status) {
                toast.success("Protocol updated: Booth terminated.");
                fetchData();
            }
        } catch (error) {
            toast.error("Execution failure: Deletion denied.");
        }
    };

    const handleAssign = async (boothId, exhibitorId) => {
        try {
            const response = await axios.put(`http://localhost:3000/booth/assign/${boothId}`, { exhibitorId });
            if (response.data.status) {
                toast.success("Link established: Exhibitor assigned.");
                fetchData();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Link failure: Assignment denied.");
        }
    };

    const handleUnassign = async (boothId) => {
        try {
            const response = await axios.put(`http://localhost:3000/booth/update/${boothId}`, { assignedTo: null, status: 'available' });
            if (response.data.status) {
                toast.success("Link terminated: Booth released.");
                fetchData();
            }
        } catch (error) {
            toast.error("Link failure: Release denied.");
        }
    };

    return (
        <div className="space-y-stack-xl pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        Manage Booth
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Available Booth Spaces
                    </h1>
                </div>
                <button
                    onClick={() => { setIsModalOpen(true); setEditingBooth(null); setFormData({ eventId: "", boothNumber: "", size: "medium", locationOnFloor: "" }); }}
                    className="w-full sm:w-auto h-14 px-stack-xl rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-stack-sm shadow-xl shadow-primary/20"
                >
                    <span className="material-symbols-rounded">add_circle</span>
                    Add Booth Space
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
                {[
                    { label: "Total Booths", value: booths.length, icon: "grid_view", color: "text-primary", bg: "bg-primary/10" },
                    { label: "Available", value: booths.filter(b => b.status === 'available').length, icon: "check_circle", color: "text-secondary", bg: "bg-secondary/10" },
                    { label: "Occupied", value: booths.filter(b => b.status === 'occupied').length, icon: "door_front", color: "text-primary", bg: "bg-primary/10" },
                    { label: "Vendors", value: exhibitors.filter(e => e.status === 'approved').length, icon: "groups", color: "text-on-surface", bg: "bg-surface-container-high" },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-container-low border border-outline-variant/30 rounded-[32px] p-8 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col gap-unit">
                            <span className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40">{stat.label}</span>
                            <span className="font-display-sm text-display-sm tracking-tight text-on-surface leading-none">{stat.value}</span>
                        </div>
                        <span className={clsx("material-symbols-rounded absolute -right-4 -bottom-4 text-[96px] opacity-5 group-hover:opacity-10 transition-opacity", stat.color)}>
                            {stat.icon}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    {booths.length === 0 ? (
                        <div className="p-24 text-center text-on-surface-variant opacity-40 font-label-md font-semibold tracking-wide">No infrastructure nodes detected.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-high/50 text-on-surface-variant text-[10px] normal-case font-semibold tracking-wide border-b border-outline-variant/20">
                                    <th className="px-10 py-6">Booth ID</th>
                                    <th className="px-10 py-6">Assigned Event</th>
                                    <th className="px-10 py-6">Assigned Vendor / Company</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {booths.map((booth) => (
                                    <tr key={booth._id} className="group hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className={clsx(
                                                    "w-16 h-16 rounded-[24px] flex flex-col items-center justify-center font-bold border transition-all shadow-inner",
                                                    booth.status === 'available'
                                                        ? 'bg-secondary/10 text-secondary border-secondary/20 group-hover:scale-110'
                                                        : 'bg-primary/10 text-primary border-primary/20 group-hover:scale-110'
                                                )}>
                                                    <span className="text-[10px] leading-none opacity-40 mb-1">ID</span>
                                                    <span className="text-xl leading-none">{booth.boothNumber}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-label-md text-label-md text-on-surface font-semibold">{booth.size} node</div>
                                                    <div className="text-body-sm text-on-surface-variant opacity-40 flex items-center gap-1 mt-1 truncate">
                                                        <span className="material-symbols-rounded text-[14px]">location_on</span>
                                                        {booth.locationOnFloor || 'No coords'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="font-label-md text-label-md text-on-surface font-bold truncate max-w-[200px]">{booth.eventId?.title}</div>
                                            <div className="text-[10px] text-on-surface-variant opacity-40 font-semibold mt-1">
                                                {new Date(booth.eventId?.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            {booth.assignedTo ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                                        {booth.assignedTo.companyName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-label-md text-label-md text-on-surface font-bold truncate max-w-[150px]">{booth.assignedTo.companyName}</div>
                                                        <button
                                                            onClick={() => handleUnassign(booth._id)}
                                                            className="text-red-400 hover:text-red-300 text-[9px] font-semibold mt-1 flex items-center gap-1 transition-colors"
                                                        >
                                                            <span className="material-symbols-rounded text-[12px]">link_off</span> Release
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : booth.status === 'occupied' || booth.status === 'reserved' ? (
                                                <div className="flex flex-col items-start gap-2">
                                                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[9px] font-semibold border border-outline-variant/30">
                                                        {booth.status} manual
                                                    </span>
                                                    <button onClick={() => handleUnassign(booth._id)} className="text-on-surface-variant/40 hover:text-on-surface text-[9px] font-semibold flex items-center gap-1">
                                                        <span className="material-symbols-rounded text-[12px]">restart_alt</span> Reset
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative group/select min-w-[200px]">
                                                    {!booth.eventId ? (
                                                        <div className="flex items-center gap-2 text-[10px] text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/20 font-semibold">
                                                            <span className="material-symbols-rounded text-[16px]">warning</span>
                                                            Assign Sector First
                                                        </div>
                                                    ) : (
                                                        <select
                                                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-3 px-4 text-on-surface font-label-md text-label-md appearance-none focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    handleAssign(booth._id, e.target.value);
                                                                }
                                                            }}
                                                            value=""
                                                        >
                                                            <option value="">Assign Vendor...</option>
                                                            {(() => {
                                                                const boothEventId = booth.eventId?._id || booth.eventId;
                                                                const allApprovedExhibitors = exhibitors.filter(ex =>
                                                                    ex.status === 'approved' &&
                                                                    !booths.some(b =>
                                                                        (b.assignedTo?._id === ex._id || b.assignedTo === ex._id) && b._id !== booth._id
                                                                    )
                                                                );
                                                                const availableExhibitors = allApprovedExhibitors.filter(ex => {
                                                                    const exEventId = ex.eventId?._id || ex.eventId;
                                                                    return exEventId === boothEventId;
                                                                });
                                                                const list = availableExhibitors.length > 0 ? availableExhibitors : allApprovedExhibitors;
                                                                return list.map(ex => (
                                                                    <option key={ex._id} value={ex._id}>
                                                                        {ex.companyName} {availableExhibitors.length === 0 ? `(${ex.eventId?.title || 'No sector'})` : ''}
                                                                    </option>
                                                                ));
                                                            })()}
                                                        </select>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={clsx(
                                                "inline-flex px-3 py-1 rounded-full text-[9px] font-semibold tracking-wide border",
                                                booth.status === 'available'
                                                    ? 'bg-secondary/10 text-secondary border-secondary/20'
                                                    : 'bg-primary/10 text-primary border-primary/20'
                                            )}>
                                                {booth.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => {
                                                        setEditingBooth(booth);
                                                        setFormData({
                                                            eventId: booth.eventId?._id,
                                                            boothNumber: booth.boothNumber,
                                                            size: booth.size,
                                                            locationOnFloor: booth.locationOnFloor
                                                        });
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center justify-center shadow-sm"
                                                    title="Modify Node"
                                                >
                                                    <span className="material-symbols-rounded text-[18px]">edit_note</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(booth._id)}
                                                    className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all flex items-center justify-center shadow-sm"
                                                    title="Terminate Node"
                                                >
                                                    <span className="material-symbols-rounded text-[18px]">delete_sweep</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-xl">
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter">
                                            {editingBooth ? "Modify Infrastructure Node" : "Initialize Infrastructure Node"}
                                        </h3>
                                        <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                                            <span className="material-symbols-rounded">close</span>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4 text-left block">Sector Assignment</label>
                                            <div className="relative group">
                                                <select
                                                    name="eventId"
                                                    value={formData.eventId}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md appearance-none focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                >
                                                    <option value="">Select Target Sector</option>
                                                    {events.map(e => (
                                                        <option key={e._id} value={e._id}>{e.title}</option>
                                                    ))}
                                                </select>
                                                <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 pointer-events-none">expand_more</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-gutter">
                                            <div className="space-y-unit">
                                                <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4 text-left block">Node Designation</label>
                                                <input
                                                    name="boothNumber"
                                                    value={formData.boothNumber}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. A-101"
                                                    required
                                                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-unit">
                                                <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4 text-left block">Scale Dimensions</label>
                                                <div className="relative group">
                                                    <select
                                                        name="size"
                                                        value={formData.size}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md appearance-none focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                                    >
                                                        <option value="small">Small (3x3m)</option>
                                                        <option value="medium">Medium (6x3m)</option>
                                                        <option value="large">Large (9x6m)</option>
                                                    </select>
                                                    <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-20 pointer-events-none">expand_more</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-unit">
                                            <label className="font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4 text-left block">Deployment Coordinates</label>
                                            <input
                                                name="locationOnFloor"
                                                value={formData.locationOnFloor}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Hall 2, North Sector"
                                                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                            />
                                        </div>

                                        <div className="flex gap-stack-md pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="flex-1 h-16 rounded-2xl bg-surface-container-highest text-on-surface-variant font-label-md text-label-md font-semibold border border-outline-variant/30 hover:bg-surface-container-high transition-all"
                                            >
                                                Abort
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-[2] h-16 rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                {editingBooth ? "Synchronize Updates" : "Launch Mission Node"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
;
