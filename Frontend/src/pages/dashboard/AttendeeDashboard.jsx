import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";

export default function AttendeeDashboard() {
    const [registrations, setRegistrations] = useState([]);
    const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const response = await axios.get("http://localhost:3000/attendee/getall");
            if (response.data.status) {
                const myRegs = response.data.data.filter(r => 
                    (r.userId?._id === user?._id || r.userId === user?._id) && 
                    r.isRegistered
                );
                setRegistrations(myRegs);
                
                const allBookmarks = [];
                myRegs.forEach(reg => {
                    if (reg.bookmarkedSessions && reg.eventId && reg.eventId.schedule) {
                        reg.bookmarkedSessions.forEach(sessionTitle => {
                            const sessionInfo = reg.eventId.schedule.find(s => s.title === sessionTitle);
                            if (sessionInfo) {
                                allBookmarks.push({
                                    ...sessionInfo,
                                    eventTitle: reg.eventId.title,
                                    eventId: reg.eventId._id
                                });
                            }
                        });
                    }
                });
                setBookmarkedSessions(allBookmarks);
            }
        } catch (error) {
            toast.error("Synchronization failure: Registration data lost.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-stack-md opacity-40 grayscale">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-label-md text-label-md font-medium tracking-wide">Syncing Portal...</p>
            </div>
        );
    }

    return (
        <div className="space-y-stack-xl">
            <header className="relative">
                <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                    
                    Attendee Dashboard
                </div>
                <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">My Registered Events</h1>
            </header>

            {registrations.length === 0 ? (
                <div className="p-20 text-center bg-surface-container-low border border-outline-variant/30 rounded-[48px] shadow-inner space-y-stack-lg">
                    <div className="w-20 h-20 rounded-[24px] bg-surface-container-high flex items-center justify-center mx-auto text-on-surface-variant/20 border border-outline-variant/20">
                        <span className="material-symbols-rounded text-[40px]">calendar_today</span>
                    </div>
                    <div>
                        <h3 className="font-title-lg text-title-lg tracking-tight text-on-surface opacity-80">No Active Events</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant opacity-60 mt-unit">Register for upcoming events .</p>
                    </div>
                    <Link to="/events" className="inline-block">
                        <button className="h-12 px-stack-xl rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide hover:scale-105 active:scale-95 transition-all">
                            Explore Events
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    {registrations.map((reg) => (
                        <div key={reg._id} className="bg-surface-container-low border border-outline-variant/15 rounded-[40px] overflow-hidden group shadow-lg hover:border-primary/40 transition-all flex flex-col">
                            <div className="h-32 bg-surface-container-high relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                                <div className="absolute bottom-4 left-6 flex items-center gap-stack-sm">
                                    <span className="font-label-sm text-[10px] text-primary font-semibold tracking-wide bg-surface-container-low/80 backdrop-blur-md px-3 py-1 rounded-lg border border-primary/20">
                                        Confirmed
                                    </span>
                                    <span className="font-label-sm text-[10px] text-on-surface-variant font-semibold tracking-wide bg-surface-container-low/80 backdrop-blur-md px-3 py-1 rounded-lg border border-outline-variant/20">
                                        Active
                                    </span>
                                </div>
                            </div>
                            <div className="p-stack-xl flex-1 flex flex-col">
                                <h3 className="font-title-lg text-title-lg tracking-tight text-on-surface mb-stack-md group-hover:text-primary transition-colors truncate">
                                    {reg.eventId?.title}
                                </h3>
                                <div className="space-y-stack-sm mb-stack-xl flex-1">
                                    <div className="flex items-center gap-stack-sm text-body-sm font-body-sm text-on-surface-variant opacity-70">
                                        <span className="material-symbols-rounded text-primary text-[18px]">calendar_month</span>
                                        {new Date(reg.eventId?.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-stack-sm text-body-sm font-body-sm text-on-surface-variant opacity-70">
                                        <span className="material-symbols-rounded text-primary text-[18px]">location_on</span>
                                        {reg.eventId?.location}
                                    </div>
                                </div>
                                <div className="flex gap-stack-sm mt-auto">
                                    <Link to={`/events/${reg.eventId?._id}#exhibitors-section`} className="flex-1">
                                        <button className="w-full h-12 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md font-semibold tracking-wide hover:bg-primary hover:text-on-primary hover:border-primary transition-all flex items-center justify-center gap-stack-sm">
                                            Exhibitors
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}