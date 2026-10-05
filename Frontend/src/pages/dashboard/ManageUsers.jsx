import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ManageUsers() {
    const [activeTab, setActiveTab] = useState('exhibitors')
    const [exhibitors, setExhibitors] = useState([])
    const [attendees, setAttendees] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchExhibitors()
        fetchAttendees()
    }, [])

    const fetchExhibitors = async () => {
        try {
            const response = await axios.get('http://localhost:3000/exhibitor/getall')
            if (response.data.status) setExhibitors(response.data.data)
        } catch (error) {
            toast.error('Telemetry failure: Exhibitor logs lost.')
        } finally {
            setLoading(false)
        }
    }

    const fetchAttendees = async () => {
        try {
            const response = await axios.get('http://localhost:3000/attendee/getall')
            if (response.data.status) setAttendees(response.data.data)
        } catch (error) {
            toast.error('Telemetry failure: Attendee logs lost.')
        }
    }

    const handleApprove = async (id) => {
        try {
            const response = await axios.put(`http://localhost:3000/exhibitor/approve/${id}`)
            if (response.data.status) {
                toast.success('Protocol update: Exhibitor approved.')
                fetchExhibitors()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error('Execution failure: Approval denied.')
        }
    }

    const handleReject = async (id) => {
        try {
            const response = await axios.put(`http://localhost:3000/exhibitor/reject/${id}`)
            if (response.data.status) {
                toast.success('Protocol update: Exhibitor rejected.')
                fetchExhibitors()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error('Execution failure: Rejection denied.')
        }
    }

    const handleDeleteExhibitor = async (id) => {
        if (!window.confirm('Decommission this exhibitor? Node will revert to Attendee status.')) return
        try {
            const response = await axios.delete(`http://localhost:3000/exhibitor/delete/${id}`)
            if (response.data.status) {
                toast.success('Role purged. User reverted to Attendee.')
                fetchExhibitors()
                setTimeout(() => fetchAttendees(), 500)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error('Execution failure: Role purge denied.')
        }
    }

    const handleDeleteAttendee = async (id) => {
        if (!window.confirm('Terminate this attendee record?')) return
        try {
            const response = await axios.delete(`http://localhost:3000/attendee/delete/${id}`)
            if (response.data.status) {
                toast.success('Operative record terminated.')
                fetchAttendees()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error('Execution failure: Termination denied.')
        }
    }

    const handleViewDetails = (item) => {
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20'
            default: return 'bg-surface-container-high text-on-surface-variant border-outline-variant/20'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return 'verified'
            case 'pending': return 'history'
            case 'rejected': return 'error'
            default: return 'help'
        }
    }

    const filteredExhibitors = exhibitors.filter(e =>
        e.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredAttendees = attendees.filter(a =>
        a.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.eventId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-stack-xl pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        User Management
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Registered Profiles Registry
                    </h1>
                </div>

                <div className="flex items-center gap-stack-md">
                    <div className="px-stack-lg py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-stack-sm shadow-sm">
                        <span className="material-symbols-rounded text-amber-400 text-[18px]">history</span>
                        <span className="text-amber-400 font-label-sm text-[10px] font-semibold tracking-wide">
                            {exhibitors.filter(e => e.status === 'pending').length} Awaiting
                        </span>
                    </div>
                    <div className="px-stack-lg py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-stack-sm shadow-sm">
                        <span className="material-symbols-rounded text-emerald-400 text-[18px]">verified</span>
                        <span className="text-emerald-400 font-label-sm text-[10px] font-semibold tracking-wide">
                            {exhibitors.filter(e => e.status === 'approved').length} Active
                        </span>
                    </div>
                </div>
            </header>

            {/* Tactical Tabs */}
            <div className="flex items-center gap-unit p-stack-xs rounded-[24px] bg-surface-container-high border border-outline-variant/15 w-fit shadow-inner">
                <button
                    onClick={() => setActiveTab('exhibitors')}
                    className={clsx(
                        "flex items-center gap-stack-sm px-stack-xl py-3 rounded-[20px] font-label-md text-label-md font-semibold tracking-wide transition-all duration-500",
                        activeTab === 'exhibitors'
                            ? "bg-primary text-on-primary shadow-xl shadow-primary/20 scale-105"
                            : "text-on-surface-variant hover:text-on-surface opacity-60"
                    )}
                >
                    <span className="material-symbols-rounded text-[18px]">storefront</span>
                    Exhibitors
                    <span className={clsx("ml-unit text-[10px] px-2 py-0.5 rounded-full", activeTab === 'exhibitors' ? "bg-on-primary/20" : "bg-surface-container-low")}>
                        {exhibitors.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('attendees')}
                    className={clsx(
                        "flex items-center gap-stack-sm px-stack-xl py-3 rounded-[20px] font-label-md text-label-md font-semibold tracking-wide transition-all duration-500",
                        activeTab === 'attendees'
                            ? "bg-secondary text-on-secondary shadow-xl shadow-secondary/20 scale-105"
                            : "text-on-surface-variant hover:text-on-surface opacity-60"
                    )}
                >
                    <span className="material-symbols-rounded text-[18px]">group</span>
                    Attendees
                    <span className={clsx("ml-unit text-[10px] px-2 py-0.5 rounded-full", activeTab === 'attendees' ? "bg-on-secondary/20" : "bg-surface-container-low")}>
                        {attendees.length}
                    </span>
                </button>
            </div>

            {/* Neural Search */}
            <div className="flex flex-col md:flex-row gap-stack-md">
                <div className="relative flex-grow group">
                    <span className="material-symbols-rounded absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors" size={20}>search</span>
                    <input
                        type="text"
                        placeholder={activeTab === 'exhibitors' ? "Scan by company, entity or status..." : "Scan by operative, signal or deployment..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant/30 rounded-[28px] py-5 pl-14 pr-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner placeholder:opacity-20"
                    />
                </div>
            </div>

            {/* Data Terminals */}
            <div className="bg-surface-container-low border border-outline-variant/15 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center opacity-40 grayscale flex flex-col items-center gap-stack-md">
                            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="font-label-md font-medium tracking-wide">Syncing Identity Grid...</p>
                        </div>
                    ) : (activeTab === 'exhibitors' ? filteredExhibitors : filteredAttendees).length === 0 ? (
                        <div className="p-20 text-center opacity-40 grayscale flex flex-col items-center gap-stack-md">
                            <span className="material-symbols-rounded text-[56px]">search_off</span>
                            <p className="font-label-md font-semibold tracking-wide">No matching operatives found in sector.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-high/30 font-label-sm text-[10px] normal-case font-semibold tracking-wide text-on-surface-variant/40">
                                    {activeTab === 'exhibitors' ? (
                                        <>
                                            <th className="px-stack-xl py-6">Company/Node</th>
                                            <th className="px-stack-xl py-6">Applicant</th>
                                            <th className="px-stack-xl py-6">Target Deployment</th>
                                            <th className="px-stack-xl py-6">Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="px-stack-xl py-6">Operative/Signal</th>
                                            <th className="px-stack-xl py-6">Mission Focus</th>
                                            <th className="px-stack-xl py-6 text-center">Sessions</th>
                                            <th className="px-stack-xl py-6 text-center">Bookmarks</th>
                                        </>
                                    )}
                                    <th className="px-stack-xl py-6 text-right">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {(activeTab === 'exhibitors' ? filteredExhibitors : filteredAttendees).map((item) => (
                                    <tr key={item._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        {activeTab === 'exhibitors' ? (
                                            <>
                                                <td className="px-stack-xl py-8">
                                                    <div className="flex items-center gap-stack-md">
                                                        <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/15 font-display-sm text-display-sm tracking-tight shadow-inner group-hover:scale-110 transition-transform">
                                                            {item.companyName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-title-md text-title-md tracking-tight text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px]">
                                                                {item.companyName}
                                                            </div>
                                                            <div className="font-label-sm text-[10px] text-on-surface-variant opacity-40 font-semibold truncate max-w-[200px]">
                                                                {item.products}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-stack-xl py-8">
                                                    <div className="font-body-md text-body-md text-on-surface">{item.userId?.name || 'N/A'}</div>
                                                    <div className="font-body-sm text-[11px] text-on-surface-variant opacity-40">{item.userId?.email || ''}</div>
                                                </td>
                                                <td className="px-stack-xl py-8">
                                                    <div className="font-body-md text-body-md text-on-surface-variant opacity-70 flex items-center gap-unit">
                                                        <span className="material-symbols-rounded text-primary text-[18px]">event_available</span>
                                                        {item.eventId?.title || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-stack-xl py-8">
                                                    <span className={clsx("inline-flex items-center gap-stack-sm px-4 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide border shadow-sm", getStatusStyle(item.status))}>
                                                        <span className="material-symbols-rounded text-[16px]">{getStatusIcon(item.status)}</span>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-stack-xl py-8">
                                                    <div className="flex items-center gap-stack-md">
                                                        <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-secondary border border-outline-variant/15 font-display-sm text-display-sm tracking-tight shadow-inner group-hover:scale-110 transition-transform">
                                                            {item.userId?.name?.charAt(0).toUpperCase() || 'A'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-title-md text-title-md tracking-tight text-on-surface group-hover:text-secondary transition-colors truncate max-w-[200px]">
                                                                {item.userId?.name || 'N/A'}
                                                            </div>
                                                            <div className="font-body-sm text-[11px] text-on-surface-variant opacity-40 truncate max-w-[200px]">
                                                                {item.userId?.email || ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-stack-xl py-8">
                                                    <div className="font-body-md text-body-md text-on-surface-variant opacity-70 flex items-center gap-unit">
                                                        <span className="material-symbols-rounded text-secondary text-[18px]">rocket_launch</span>
                                                        {item.eventId?.title || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-stack-xl py-8 text-center">
                                                    <div className="font-display-sm text-display-sm tracking-tight text-on-surface tabular-nums">
                                                        {item.registeredSessions?.length || 0}
                                                    </div>
                                                    <div className="font-label-sm text-[10px] text-on-surface-variant opacity-30 normal-case font-semibold tracking-wide">Active</div>
                                                </td>
                                                <td className="px-stack-xl py-8 text-center">
                                                    <div className="font-display-sm text-display-sm tracking-tight text-on-surface tabular-nums">
                                                        {item.bookmarks?.length || 0}
                                                    </div>
                                                    <div className="font-label-sm text-[10px] text-on-surface-variant opacity-30 normal-case font-semibold tracking-wide">Saved</div>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-stack-xl py-8 text-right">
                                            <div className="flex items-center justify-end gap-stack-sm">
                                                {activeTab === 'exhibitors' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleViewDetails(item)}
                                                            className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center justify-center shadow-sm"
                                                            title="Inspect Payload"
                                                        >
                                                            <span className="material-symbols-rounded text-[20px]">visibility</span>
                                                        </button>
                                                        {item.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(item._id)}
                                                                    className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-on-primary transition-all flex items-center justify-center shadow-sm"
                                                                    title="Initialize"
                                                                >
                                                                    <span className="material-symbols-rounded text-[20px]">check_circle</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(item._id)}
                                                                    className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-on-primary transition-all flex items-center justify-center shadow-sm"
                                                                    title="Terminate"
                                                                >
                                                                    <span className="material-symbols-rounded text-[20px]">cancel</span>
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteExhibitor(item._id)}
                                                            className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all flex items-center justify-center shadow-sm"
                                                            title="Purge Role"
                                                        >
                                                            <span className="material-symbols-rounded text-[20px]">delete_forever</span>
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'attendees' && (
                                                    <button
                                                        onClick={() => handleDeleteAttendee(item._id)}
                                                        className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all flex items-center justify-center shadow-sm"
                                                        title="Terminate Operative"
                                                    >
                                                        <span className="material-symbols-rounded text-[20px]">delete_sweep</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Neural Modal Interface */}
            <AnimatePresence>
                {isModalOpen && selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-surface-dim/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl"
                        >
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter">Identity Profile</h3>
                                        <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center">
                                            <span className="material-symbols-rounded">close</span>
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center gap-stack-lg p-stack-xl rounded-[32px] bg-surface-container-high border border-outline-variant/15 shadow-inner">
                                            <div className="w-20 h-20 rounded-[24px] bg-primary text-on-primary flex items-center justify-center font-display-md text-display-md tracking-tight shadow-lg shadow-primary/20">
                                                {selectedItem.companyName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-display-sm text-display-sm text-on-surface tracking-tight leading-none mb-unit">{selectedItem.companyName}</p>
                                                <span className={clsx("inline-flex items-center gap-stack-sm px-3 py-1 rounded-lg text-[10px] font-semibold tracking-wide border", getStatusStyle(selectedItem.status))}>
                                                    <span className="material-symbols-rounded text-[14px]">{getStatusIcon(selectedItem.status)}</span>
                                                    {selectedItem.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                            {[
                                                { label: 'Primary Operative', value: selectedItem.userId?.name, icon: 'person' },
                                                { label: 'Secure Signal', value: selectedItem.userId?.email, icon: 'alternate_email' },
                                                { label: 'Target Hub', value: selectedItem.eventId?.title, icon: 'hub' },
                                                { label: 'Uplink Contact', value: selectedItem.contactInfo, icon: 'cell_tower' },
                                            ].map((item, i) => (
                                                <div key={i} className="flex flex-col gap-unit p-stack-md rounded-[24px] bg-surface-container-high/40 border border-outline-variant/10 group">
                                                    <div className="flex items-center gap-unit text-primary/40 group-hover:text-primary transition-colors">
                                                        <span className="material-symbols-rounded text-[18px]">{item.icon}</span>
                                                        <span className="font-label-sm text-[10px] font-semibold opacity-60">{item.label}</span>
                                                    </div>
                                                    <span className="font-body-md text-body-md text-on-surface pl-stack-md">{item.value || 'N/A'}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-stack-lg rounded-[24px] bg-surface-container-high/40 border border-outline-variant/10">
                                            <div className="flex items-center gap-unit text-primary/40 mb-unit">
                                                <span className="material-symbols-rounded text-[18px]">inventory_2</span>
                                                <span className="font-label-sm text-[10px] font-semibold opacity-60">Commercial Specializations</span>
                                            </div>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 leading-relaxed pl-stack-md">{selectedItem.products || 'No industrial data found.'}</p>
                                        </div>

                                        <div className="p-stack-lg rounded-[24px] bg-surface-container-high/40 border border-outline-variant/10">
                                            <div className="flex items-center gap-unit text-primary/40 mb-unit">
                                                <span className="material-symbols-rounded text-[18px]">description</span>
                                                <span className="font-label-sm text-[10px] font-semibold opacity-60">Mission Directive</span>
                                            </div>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 leading-relaxed pl-stack-md">{selectedItem.description || 'No strategic vision defined.'}</p>
                                        </div>

                                        {selectedItem.status === 'pending' && (
                                            <div className="flex gap-stack-md pt-stack-md">
                                                <button
                                                    onClick={() => { handleReject(selectedItem._id); setIsModalOpen(false) }}
                                                    className="flex-1 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/30 text-red-400 font-label-md text-label-md font-bold tracking-wide hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-stack-sm"
                                                >
                                                    <span className="material-symbols-rounded">cancel</span>
                                                    Terminate
                                                </button>
                                                <button
                                                    onClick={() => { handleApprove(selectedItem._id); setIsModalOpen(false) }}
                                                    className="flex-1 h-16 rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-stack-sm"
                                                >
                                                    <span className="material-symbols-rounded">verified</span>
                                                    Initialize
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
