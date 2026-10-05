import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ManageEvents() {
    const [events, setEvents] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [formLoading, setFormLoading] = useState(false)
    const [bannerFile, setBannerFile] = useState(null)
    const user = JSON.parse(localStorage.getItem('user'))

    const [formData, setFormData] = useState({
        title: '',
        date: '',           // ✅ FIXED: added date field
        location: '',
        description: '',
        theme: '',
        status: 'upcoming'
    })

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3000/event/getall')
            if (response.data.status) setEvents(response.data.data)
        } catch (error) {
            toast.error('Telemetry failure: Event logs inaccessible.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        setBannerFile(e.target.files[0])
    }

   const handleCreate = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    // ✅ Validate date is not in the past
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
        toast.error('Event date cannot be in the past.')
        setFormLoading(false)  // ✅ don't forget to reset loading
        return
    }

    try {
        const data = new FormData()
        data.append('title', formData.title)
        data.append('date', formData.date)
        data.append('location', formData.location)
        data.append('description', formData.description)
        data.append('theme', formData.theme)
        data.append('status', formData.status)
        data.append('createdBy', user._id)
        if (bannerFile) {
            data.append('banner', bannerFile)
        }

        const response = await axios.post('http://localhost:3000/event/create', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (response.data.status) {
            toast.success('Protocol update: Event initialized.')
            setIsModalOpen(false)
            setBannerFile(null)
            setFormData({ title: '', date: '', location: '', description: '', theme: '', status: 'upcoming' })
            fetchEvents()
        } else {
            toast.error(response.data.message)
        }
    } catch (error) {
        toast.error('Execution failure: Initialization denied.')
    }
    setFormLoading(false)
}
    const handleEditClick = (event) => {
        setSelectedEvent(event)
        setFormData({
            title: event.title,
            date: event.date ? event.date.split('T')[0] : '',   
            location: event.location,
            description: event.description,
            theme: event.theme || '',
            status: event.status
        })
        setBannerFile(null)
        setIsEditModalOpen(true)
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        try {
            const data = new FormData()
            data.append('title', formData.title)
            data.append('date', formData.date)           /
            data.append('location', formData.location)
            data.append('description', formData.description)
            data.append('theme', formData.theme)
            data.append('status', formData.status)
            if (bannerFile) {
                data.append('banner', bannerFile)
            }

            const response = await axios.put(`http://localhost:3000/event/update/${selectedEvent._id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            if (response.data.status) {
                toast.success('Protocol update: Event logs synchronized.')
                setIsEditModalOpen(false)
                setSelectedEvent(null)
                setBannerFile(null)
                fetchEvents()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error('Execution failure: Sync denied.')
        }
        setFormLoading(false)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this event record? This action is irreversible.')) return
        try {
            const response = await axios.delete(`http://localhost:3000/event/delete/${id}`)
            if (response.data.status) {
                toast.success('Event record terminated.')
                fetchEvents()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error('Execution failure: Termination denied.')
        }
    }

    const closeModals = () => {
        setIsModalOpen(false)
        setIsEditModalOpen(false)
        setBannerFile(null)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'ongoing': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'upcoming': return 'bg-primary/10 text-primary border-primary/20'
            case 'completed': return 'bg-surface-container-high text-on-surface-variant border-outline-variant/20 opacity-40'
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
            default: return 'bg-surface-container-high text-on-surface-variant border-outline-variant/20'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ongoing': return 'verified'
            case 'upcoming': return 'history'
            case 'completed': return 'check_circle'
            case 'cancelled': return 'cancel'
            default: return 'help'
        }
    }

    const filteredEvents = events.filter(e =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const inputClass = "w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
    const labelClass = "font-label-sm text-xs font-semibold text-on-surface-variant opacity-40 ml-4"

    return (
        <div className="space-y-stack-xl pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        Event Management
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Events Overview Grid
                    </h1>
                </div>
                <button
                    onClick={() => {
                        setFormData({ title: '', date: '', location: '', description: '', theme: '', status: 'upcoming' })
                        setBannerFile(null)
                        setIsModalOpen(true)
                    }}
                    className="w-full sm:w-auto h-14 px-stack-xl rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-stack-sm"
                >
                    <span className="material-symbols-rounded">add_circle</span>
                    Create Event
                </button>
            </header>

            {/* Search */}
            <div className="relative group max-w-2xl">
                <span className="material-symbols-rounded absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors">search</span>
                <input
                    type="text"
                    placeholder="Scan grid by title, coordinates, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-[28px] py-5 pl-14 pr-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner placeholder:opacity-20"
                />
            </div>

            {/* Table */}
            <div className="bg-surface-container-low border border-outline-variant/15 rounded-[48px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-20 text-center opacity-40 grayscale flex flex-col items-center gap-stack-md">
                            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="font-label-md font-medium tracking-wide">Syncing Grid Telemetry...</p>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="p-20 text-center opacity-40 grayscale flex flex-col items-center gap-stack-md">
                            <span className="material-symbols-rounded text-[56px]">event_busy</span>
                            <p className="font-label-md font-semibold tracking-wide">{searchTerm ? 'No matching logs found.' : 'No active deployments initialized.'}</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-high/30 font-label-sm text-[10px] tracking-wide text-on-surface-variant/40">
                                    <th className="px-stack-xl py-6">Event Details</th>
                                    <th className="px-stack-xl py-6">Coordinates</th>
                                    <th className="px-stack-xl py-6">Date</th>
                                    <th className="px-stack-xl py-6 text-center">Designation</th>
                                    <th className="px-stack-xl py-6 text-center">Status</th>
                                    <th className="px-stack-xl py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {filteredEvents.map((event) => (
                                    <tr key={event._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-stack-xl py-8">
                                            <div className="flex items-center gap-stack-md">
                                                <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-outline-variant/15 overflow-hidden shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    {event.banner ? (
                                                        <img src={`http://localhost:3000${event.banner}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-rounded text-primary text-[28px]">calendar_today</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-title-md text-title-md tracking-tight text-on-surface group-hover:text-primary transition-colors truncate max-w-[250px]">
                                                        {event.title}
                                                    </div>
                                                    <div className="font-body-sm text-[11px] text-on-surface-variant opacity-40 font-medium truncate max-w-[250px] mt-0.5">
                                                        {event.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-stack-xl py-8">
                                            <div className="font-body-md text-body-md text-on-surface flex items-center gap-unit">
                                                <span className="material-symbols-rounded text-primary text-[16px]">location_on</span> {event.location}
                                            </div>
                                        </td>
                                        <td className="px-stack-xl py-8">
                                            <div className="font-body-md text-body-md text-on-surface flex items-center gap-unit">
                                                <span className="material-symbols-rounded text-primary text-[16px]">event</span>
                                                {event.date ? new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                            </div>
                                        </td>
                                        <td className="px-stack-xl py-8 text-center">
                                            <span className="font-label-sm text-[10px] text-on-surface-variant opacity-60 bg-surface-container-high border border-outline-variant/10 px-3 py-1 rounded-lg font-semibold">
                                                {event.theme || 'Neutral'}
                                            </span>
                                        </td>
                                        <td className="px-stack-xl py-8 text-center">
                                            <span className={clsx("inline-flex items-center gap-stack-sm px-4 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide border shadow-sm", getStatusColor(event.status))}>
                                                <span className="material-symbols-rounded text-[16px]">{getStatusIcon(event.status)}</span>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-stack-xl py-8 text-right">
                                            <div className="flex items-center justify-end gap-stack-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleEditClick(event)}
                                                    className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center justify-center shadow-sm"
                                                    title="Modify Record"
                                                >
                                                    <span className="material-symbols-rounded text-[20px]">edit_note</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(event._id)}
                                                    className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all flex items-center justify-center shadow-sm"
                                                    title="Terminate Node"
                                                >
                                                    <span className="material-symbols-rounded text-[20px]">delete_sweep</span>
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

            {/* Modals */}
            <AnimatePresence>
                {(isModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModals}
                            className="absolute inset-0 bg-surface-dim/95 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter">
                                            {isEditModalOpen ? 'Modify Deployment' : 'Create New Event'}
                                        </h3>
                                        <button
                                            onClick={closeModals}
                                            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center"
                                        >
                                            <span className="material-symbols-rounded">close</span>
                                        </button>
                                    </div>

                                    <form onSubmit={isEditModalOpen ? handleUpdate : handleCreate} className="space-y-8">

                                        {/* Row 1: Title + Theme */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                            <div className="space-y-unit">
                                                <label className={labelClass}>Event Name</label>
                                                <input
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Quantum Summit 2026"
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-unit">
                                                <label className={labelClass}>Industry / Category</label>
                                                <input
                                                    name="theme"
                                                    value={formData.theme}
                                                    onChange={handleChange}
                                                    placeholder="e.g. Advanced Photonics"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Date + Location */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                            <div className="space-y-unit">
                                                {/* ✅ FIXED: Date input added */}
                                                <label className={labelClass}>Event Date</label>
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={handleChange}
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-unit">
                                                <label className={labelClass}>Deployment Coordinates</label>
                                                <input
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
                                                    placeholder="City, Sector Code"
                                                    className={inputClass}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Row 3: Status + Banner */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                            <div className="space-y-unit">
                                                <label className={labelClass}>Operational Status</label>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleChange}
                                                    className={`${inputClass} appearance-none`}
                                                >
                                                    {isEditModalOpen ? (
                                                        <>
                                                            <option value="upcoming">Upcoming</option>
                                                            <option value="ongoing">Ongoing</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </>
                                                    ) : (
                                                        <option value="upcoming">Upcoming</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="space-y-unit">
                                                <label className={labelClass}>Visual Identification (Banner)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface-variant/40 font-body-sm flex items-center justify-between group-hover:border-primary/30 transition-all shadow-inner overflow-hidden">
                                                        <span className="truncate">{bannerFile ? bannerFile.name : 'Upload schematic...'}</span>
                                                        <span className="material-symbols-rounded text-primary">upload_file</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-unit">
                                            <label className={labelClass}>Event Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                className="w-full h-32 bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 px-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner resize-none"
                                                placeholder="Enter details, schedules, and goals for this expo..."
                                                required
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-stack-md pt-stack-md">
                                            <button
                                                type="button"
                                                onClick={closeModals}
                                                className="flex-1 h-16 rounded-2xl bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-all"
                                            >
                                                Cancel Protocol
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={formLoading}
                                                className="flex-1 h-16 rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                            >
                                                {formLoading ? 'Synchronizing...' : isEditModalOpen ? 'Update Protocol' : 'Create New Event'}
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
    )
}