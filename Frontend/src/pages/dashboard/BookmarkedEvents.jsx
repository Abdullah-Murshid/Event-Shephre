import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function BookmarkedEvents() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/attendee/bookmarks/${user._id}`);
            if (response.data.status) {
                setBookmarks(response.data.data || []);
            }
        } catch (error) {
            toast.error("Telemetry failure: Neural bookmarks offline.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (eventId, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const response = await axios.delete(`http://localhost:3000/attendee/bookmarks/${user._id}/${eventId}`);
            if (response.data.status) {
                setBookmarks(prev => prev.filter(event => event._id !== eventId));
                const saved = localStorage.getItem('bookmarks');
                if (saved) {
                    const filtered = JSON.parse(saved).filter(id => id !== eventId);
                    localStorage.setItem('bookmarks', JSON.stringify(filtered));
                }
                toast.success("Protocol updated: Connection severed.");
            }
        } catch (error) {
            toast.error("Execution failure: Connection remains.");
        }
    };

    const filteredBookmarks = bookmarks.filter(event => 
        event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-stack-xl pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        Bookmark
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">Save Your Favorite Event</h1>
                </div>
                
                <div className="relative w-full md:w-[400px] group">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:opacity-100 group-focus-within:text-primary transition-all">search</span>
                    <input
                        type="text"
                        placeholder="Search bookmarks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl py-4 pl-14 pr-6 text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-96 gap-6 grayscale opacity-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-label-md text-label-md font-semibold tracking-wide"> Archives...</p>
                </div>
            ) : filteredBookmarks.length === 0 ? (
                <div className="p-24 text-center bg-surface-container-low border border-dashed border-outline-variant/30 rounded-[48px] opacity-40 grayscale flex flex-col items-center gap-stack-md shadow-inner">
                    <span className="material-symbols-rounded text-[64px]">bookmark_remove</span>
                    <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter">Archive</h3>
                    <p className="font-label-md font-semibold tracking-wide max-w-md mx-auto">
                        {searchQuery ? "No signatures match your current scan parameters." : "There is no Bookmarked Events."}
                    </p>
                    {!searchQuery && (
                        <button 
                            onClick={() => navigate('/events')} 
                            className="mt-6 h-14 px-stack-xl rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            Explore Events
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    <AnimatePresence mode="popLayout">
                        {filteredBookmarks.map((event, idx) => (
                            <motion.div
                                key={event._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="group relative"
                            >
                                <div className="bg-surface-container-low border border-outline-variant/30 rounded-[40px] overflow-hidden shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 h-full flex flex-col group/card">
                                    <div className="relative h-56 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent z-10" />
                                        <img 
                                            src={event.banner ? `http://localhost:3000${event.banner}` : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"} 
                                            alt={event.title}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000"
                                        />
                                        <button
                                            onClick={(e) => handleRemoveBookmark(event._id, e)}
                                            className="absolute top-6 right-6 z-20 w-12 h-12 rounded-2xl bg-surface-container-high/40 text-on-surface hover:bg-red-500/20 hover:text-red-400 transition-all backdrop-blur-xl border border-outline-variant/10 flex items-center justify-center group/btn shadow-2xl"
                                            title="Purge Connection"
                                        >
                                            <span className="material-symbols-rounded text-[22px] group-hover/btn:scale-110 transition-transform">heart_broken</span>
                                        </button>
                                    </div>
                                    
                                    <div className="p-8 flex-grow flex flex-col relative z-10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-semibold tracking-wide border border-primary/20">
                                                {event.theme || 'Neural Event'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="font-display-sm text-display-sm text-on-surface tracking-tighter mb-6 group-hover/card:text-primary transition-colors line-clamp-2">
                                            {event.title}
                                        </h3>
                                        
                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-4 text-on-surface-variant opacity-60">
                                                <span className="material-symbols-rounded text-[20px] text-primary">calendar_today</span>
                                                <span className="font-label-md text-label-md font-semibold tracking-wide">
                                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-on-surface-variant opacity-60">
                                                <span className="material-symbols-rounded text-[20px] text-secondary">location_on</span>
                                                <span className="font-label-md text-label-md font-semibold tracking-wide truncate">
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-auto">
                                            <Link 
                                                to={`/events/${event._id}`}
                                                className="w-full h-14 rounded-2xl bg-surface-container-high border border-outline-variant/20 text-on-surface font-label-md text-label-md font-semibold tracking-wide flex items-center justify-center gap-4 hover:bg-primary hover:text-on-primary hover:border-primary transition-all group/link shadow-sm"
                                            >
                                                Initialize Mission
                                                <span className="material-symbols-rounded text-[20px] group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
