import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Events() {
    const [searchQuery, setSearchQuery] = useState('')
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [registeredEventIds, setRegisteredEventIds] = useState([])
    const [bookmarkedEventIds, setBookmarkedEventIds] = useState([])
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        try {
            const [eventsRes] = await Promise.all([
                axios.get('http://localhost:3000/event/getall')
            ])

            if (eventsRes.data.status) {
                setEvents(eventsRes.data.data)
            }

            if (user && user.role === 'attendee') {
                fetchUserRegistrations()
                fetchUserBookmarks()
            }
        } catch (error) {
            console.log("Error fetching data:", error)
            toast.error('Failed to fetch events')
        } finally {
            setLoading(false)
        }
    }

    const fetchUserRegistrations = async () => {
        if (!user) return
        try {
            const response = await axios.get('http://localhost:3000/attendee/getall')
            if (response.data.status) {
                const myRegs = response.data.data.filter(r =>
                    r.userId?._id === user._id || r.userId === user._id
                )
                const ids = myRegs.filter(r => r.isRegistered).map(r => r.eventId?._id || r.eventId)
                setRegisteredEventIds(ids)
            }
        } catch (error) {
            console.log("Could not fetch registrations:", error)
        }
    }

    const fetchUserBookmarks = async () => {
        if (!user) return
        try {
            const response = await axios.get(`http://localhost:3000/attendee/bookmarks/${user._id}`, {
                timeout: 2000
            })
            if (response.data.status) {
                setBookmarkedEventIds(response.data.data || [])
            }
        } catch (error) {
            const saved = localStorage.getItem('bookmarks')
            if (saved) {
                setBookmarkedEventIds(JSON.parse(saved))
            }
        }
    }

    const handleBookmark = async (eventId, e) => {
        e.preventDefault()
        e.stopPropagation()

        if (!user) {
            toast.error('Please login to bookmark events')
            navigate('/login')
            return
        }

        if (user.role !== 'attendee') {
            toast.error('Only attendees can bookmark events')
            return
        }

        const isCurrentlyBookmarked = bookmarkedEventIds.includes(eventId)

        try {
            if (isCurrentlyBookmarked) {
                try {
                    await axios.delete(`http://localhost:3000/attendee/bookmarks/${user._id}/${eventId}`)
                } catch (e) {}
                const newBookmarks = bookmarkedEventIds.filter(id => id !== eventId)
                setBookmarkedEventIds(newBookmarks)
                localStorage.setItem('bookmarks', JSON.stringify(newBookmarks))
                toast.success('Bookmark removed')
            } else {
                try {
                    await axios.post('http://localhost:3000/attendee/bookmarks', {
                        userId: user._id,
                        eventId: eventId
                    })
                } catch (e) {}
                const newBookmarks = [...bookmarkedEventIds, eventId]
                setBookmarkedEventIds(newBookmarks)
                localStorage.setItem('bookmarks', JSON.stringify(newBookmarks))
                toast.success('Event bookmarked!')
            }
        } catch (error) {
            console.log(error)
            toast.error('Something went wrong')
        }
    }

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ongoing':
                return { 
                    bg: 'bg-emerald-900/20', 
                    text: 'text-emerald-400', 
                    border: 'border-emerald-500/30', 
                    icon: 'sensors', 
                    label: 'Live Now' 
                }
            case 'upcoming':
                return { 
                    bg: 'bg-primary/10', 
                    text: 'text-primary', 
                    border: 'border-primary/20', 
                    icon: 'schedule', 
                    label: 'Upcoming' 
                }
            case 'completed':
                return { 
                    bg: 'bg-surface-container-high', 
                    text: 'text-on-surface-variant', 
                    border: 'border-outline-variant/30', 
                    icon: 'history', 
                    label: 'Archived' 
                }
            case 'cancelled':
                return { 
                    bg: 'bg-error/10', 
                    text: 'text-error', 
                    border: 'border-error/20', 
                    icon: 'cancel', 
                    label: 'Cancelled' 
                }
            default:
                return { 
                    bg: 'bg-surface-container-high', 
                    text: 'text-on-surface-variant', 
                    border: 'border-outline-variant/30', 
                    icon: 'event', 
                    label: status 
                }
        }
    }

    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.theme?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || event.status === statusFilter

        return matchesSearch && matchesStatus
    })

    return (
        <div className="w-full px-8 md:px-12 lg:px-16 pt-32 pb-24 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-unit px-stack-md py-stack-xs rounded-full bg-primary/10 border border-primary/20 text-primary font-label-sm text-label-sm font-semibold tracking-wide mb-stack-md"
                    >
                        <span className="material-symbols-rounded text-[14px]">explore</span>
                        Discovery Protocol
                    </motion.div>
                    <h1 className="font-display-lg text-display-lg md:text-[80px] text-on-surface mb-stack-md tracking-tight leading-[0.95]">
                        Global <br />
                        <span className="text-primary italic">Event</span> Grid.
                    </h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed opacity-80">
                        Synthesizing the world's most advanced exhibitions. Access the future of 
                        industrial networking and architectural innovation.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-stack-md w-full md:w-auto">
                    <div className="relative flex-grow min-w-[320px]">
                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                        <input
                            type="text"
                            placeholder="Identify target by name, city, or theme..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-2xl py-stack-md pl-12 pr-stack-md text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/50"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-stack-sm mb-stack-xl flex-wrap">
                {['all', 'upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={clsx(
                            "px-stack-lg py-stack-sm rounded-full font-label-md text-label-md font-medium tracking-wide transition-all whitespace-nowrap border shrink-0",
                            statusFilter === status
                                ? "bg-primary/20 text-primary border-primary/30 font-bold"
                                : "text-on-surface-variant border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-high"
                        )}
                    >
                        {status === 'all' ? 'All Events' : status}
                        {status === 'all' && (
                            <span className="ml-2 font-bold opacity-60">
                                {events.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-96 gap-stack-md opacity-40">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-label-md text-label-md font-medium tracking-wide">Scanning Grid...</p>
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 gap-stack-md border border-dashed border-outline-variant/30 rounded-3xl">
                    <span className="material-symbols-rounded text-[48px] text-on-surface-variant opacity-20">inventory_2</span>
                    <p className="font-title-md text-title-md tracking-tight text-on-surface-variant">
                        {searchQuery ? 'No matches identified in current parameters.' : 'No active transmissions available.'}
                    </p>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="font-label-md text-primary font-medium tracking-wide hover:underline"
                        >
                            Reset Search
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter">
                    {filteredEvents.map((event, idx) => {
                        const config = getStatusConfig(event.status)
                        const isRegistered = registeredEventIds.includes(event._id)
                        const isBookmarked = bookmarkedEventIds.includes(event._id)

                        return (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group flex flex-col md:flex-row bg-surface-container-low border border-outline-variant/15 rounded-3xl overflow-hidden hover:border-primary/40 transition-all shadow-xl hover:shadow-2xl"
                            >
                                {/* Media Block */}
                                <div className="md:w-[40%] relative aspect-[16/10] md:aspect-auto overflow-hidden shrink-0">
                                    {event.banner ? (
                                        <img 
                                            src={`http://localhost:3000${event.banner}`} 
                                            alt={event.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                            <span className="font-display-md text-display-md tracking-tight opacity-20">{event.title?.charAt(0)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="absolute top-4 left-4">
                                        <div className={clsx(
                                            "inline-flex items-center gap-unit px-stack-sm py-1 rounded-full border font-label-sm text-xs font-bold tracking-wide backdrop-blur-md",
                                            config.bg, config.text, config.border
                                        )}>
                                            <span className="material-symbols-rounded text-[14px]">{config.icon}</span>
                                            {config.label}
                                        </div>
                                    </div>

                                    {user?.role === 'attendee' && (
                                        <button
                                            onClick={(e) => handleBookmark(event._id, e)}
                                            className={clsx(
                                                "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md",
                                                isBookmarked
                                                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                                                    : 'bg-black/40 text-white/70 hover:text-white hover:bg-black/60'
                                            )}
                                        >
                                            <span className="material-symbols-rounded text-[20px]">{isBookmarked ? 'favorite' : 'favorite_border'}</span>
                                        </button>
                                    )}
                                </div>

                                {/* Content Block */}
                                <div className="flex-1 p-stack-xl flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-stack-md mb-stack-md">
                                            {event.theme && (
                                                <span className="font-label-sm text-xs font-semibold tracking-wide text-primary">
                                                    {event.theme}
                                                </span>
                                            )}
                                            <div className="flex items-center gap-unit text-on-surface-variant font-label-sm text-label-sm">
                                                <span className="material-symbols-rounded text-[16px]">calendar_today</span>
                                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                        </div>

                                        <h3 className="font-title-lg text-title-lg tracking-tight text-on-surface mb-stack-sm group-hover:text-primary transition-colors leading-tight">
                                            {event.title}
                                        </h3>

                                        <p className="font-body-sm text-body-sm text-on-surface-variant opacity-80 mb-stack-lg line-clamp-2 leading-relaxed">
                                            {event.description}
                                        </p>

                                        <div className="flex items-center gap-stack-sm text-on-surface-variant font-body-sm text-body-sm mb-stack-xl">
                                            <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary">
                                                <span className="material-symbols-rounded text-[18px]">location_on</span>
                                            </div>
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-stack-sm">
                                        {isRegistered ? (
                                            <div className="flex-1 px-stack-lg py-stack-sm bg-emerald-900/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-label-md text-label-md font-semibold tracking-wide flex items-center justify-center gap-unit">
                                                <span className="material-symbols-rounded text-[18px]">check_circle</span>
                                                Confirmed
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => navigate(`/events/${event._id}`)}
                                                className={clsx(
                                                    "flex-1 px-stack-lg py-stack-sm rounded-xl font-label-md text-label-md font-semibold tracking-wide transition-all flex items-center justify-center gap-unit shadow-lg",
                                                    event.status === 'completed' || event.status === 'cancelled'
                                                        ? "bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed"
                                                        : "bg-primary text-on-primary hover:scale-[1.02] hover:bg-primary/90"
                                                )}
                                                disabled={event.status === 'completed' || event.status === 'cancelled'}
                                            >
                                                {event.status === 'completed' ? 'Event Ended' : event.status === 'cancelled' ? 'Cancelled' : 'Event Details'}
                                                <span className="material-symbols-rounded text-[18px]">arrow_forward</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate(`/events/${event._id}`)}
                                            className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"
                                            title="View Details"
                                        >
                                            <span className="material-symbols-rounded">info</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}