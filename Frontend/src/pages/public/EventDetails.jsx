import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import clsx from "clsx";

import ExhibitorSearch from "../../components/ExhibitorSearch";
import ChatModal from "../../components/ChatModal";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showExhibitorsModal, setShowExhibitorsModal] = useState(false);
  const [selectedExhibitor, setSelectedExhibitor] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [bookmarkedSessions, setBookmarkedSessions] = useState([]);
  const [attendeeId, setAttendeeId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("general");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchEvent();
    if (window.location.hash === '#exhibitors-section') {
      setTimeout(() => {
        document.getElementById('exhibitors-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 800);
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/event/get/${id}`);
      if (response.data.status) {
        setEvent(response.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch event data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const checkRegistration = async () => {
      try {
        const response = await axios.get('http://localhost:3000/attendee/getall')
        if (response.data.status) {
          const myReg = response.data.data.find(r =>
            (r.userId?._id === user._id || r.userId === user._id) &&
            (r.eventId?._id === id || r.eventId === id) &&
            r.isRegistered
          )
          if (myReg) {
            setIsRegistered(true)
            setAttendeeId(myReg._id)
            setBookmarkedSessions(myReg.bookmarkedSessions || [])
          }
        }
      } catch (error) {
        console.log("Registration audit failed:", error)
      }
    }
    checkRegistration()
  }, [id]);

  const handleRegister = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Identity verification required.");
      navigate("/login");
      return;
    }

    if (user.role !== 'attendee') {
      toast.error("Access restricted to Attendee roles.");
      return;
    }

    setRegistering(true);
    try {
      const response = await axios.post("http://localhost:3000/attendee/register", {
        userId: user._id,
        eventId: id
      });

      if (response.data.status) {
        toast.success("Deployment confirmed.");
        setIsRegistered(true);
      } else {
        toast.error(response.data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("System error during registration.");
    } finally {
      setRegistering(false);
    }
  };

  const handleContactExhibitor = (exhibitor) => {
    setSelectedExhibitor(exhibitor);
    setShowChat(true);
  };

  const handleSessionRegistration = async (sessionTitle) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Authentication required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/attendee/session-bookmark", {
        userId: user._id,
        eventId: id,
        sessionTitle: sessionTitle
      });

      if (response.data.status) {
        setBookmarkedSessions(response.data.data);
        toast.success(response.data.bookmarked ? "Session Locked" : "Session Released");
      }
    } catch (error) {
      toast.error("Update failed.");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !feedback.trim()) return;

    setSubmittingFeedback(true);
    try {
      const response = await axios.post("http://localhost:3000/feedback/create", {
        userId: user._id,
        eventId: id,
        message: feedback,
        type: feedbackType
      });

      if (response.data.status) {
        toast.success("Feedback transmission successful.");
        setFeedback("");
      }
    } catch (error) {
      toast.error("Transmission error.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-dim flex flex-col items-center justify-center gap-stack-md">
        <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-label-md text-label-md font-medium tracking-wide opacity-40">Decrypting Data Grid...</p>
      </div>
    );
  }

  if (!event) return null;

  const availableBooths = event.booths?.filter(b => b.status === 'available').length || 0;
  const isUpcomingOrOngoing = event.status === 'upcoming' || event.status === 'ongoing';

  return (
    <div className="w-full px-8 md:px-12 lg:px-16 pt-40 pb-24 min-h-screen relative z-10">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-[500px] rounded-[40px] overflow-hidden mb-section-gap border border-outline-variant/20 shadow-2xl"
      >
        <img
          src={event.banner ? `http://localhost:3000${event.banner}` : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"}
          className="w-full h-full object-cover brightness-[0.4]"
          alt={event.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-stack-md"
          >
            <div className="inline-flex w-fit px-stack-md py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md text-primary font-label-sm text-label-sm font-medium tracking-wide font-bold">
                {event.theme || "Industrial Protocol"}
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[80px] text-on-surface tracking-tight leading-[0.95]">
                {event.title}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl opacity-80 line-clamp-2">
                {event.description}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Main Intelligence */}
        <div className="lg:col-span-8 space-y-section-gap">
          
          {/* Detailed Specifications */}
          <section className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-stack-xl">
            <h2 className="font-title-lg text-title-lg tracking-tight text-on-surface mb-stack-lg flex items-center gap-stack-sm">
                <span className="material-symbols-rounded text-primary">description</span>
                Mission Overview
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed opacity-80 whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          {/* Exhibitor Grid */}
          <section id="exhibitors-section">
            <div className="flex items-center justify-between mb-stack-lg">
                <h2 className="font-title-lg text-title-lg tracking-tight text-on-surface flex items-center gap-stack-sm">
                    <span className="material-symbols-rounded text-primary">hub</span>
                    Exhibitor Network
                </h2>
                <div className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-stack-md py-1 rounded-full border border-outline-variant/20 font-medium tracking-wide font-bold">
                    {event.exhibitors?.length || 0} Registered Units
                </div>
            </div>
            <ExhibitorSearch
              eventId={id}
              onContactExhibitor={handleContactExhibitor}
            />
          </section>

          {/* Chronological Sequence (Schedule) */}
          {event.schedule && event.schedule.length > 0 && (
            <section className="space-y-stack-lg">
                <h2 className="font-title-lg text-title-lg tracking-tight text-on-surface flex items-center gap-stack-sm mb-stack-lg">
                    <span className="material-symbols-rounded text-primary">event_note</span>
                    Execution Timeline
                </h2>
                <div className="space-y-stack-md">
                    {event.schedule.map((item, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group flex flex-col md:flex-row md:items-center justify-between gap-stack-xl p-stack-xl bg-surface-container-low border border-outline-variant/15 rounded-3xl hover:border-primary/40 transition-all"
                        >
                            <div className="flex-1 space-y-unit">
                                <div className="flex items-center gap-stack-md mb-unit">
                                    <span className="font-label-sm text-[10px] text-primary font-medium tracking-wide">{item.topic}</span>
                                    <div className="h-[1px] flex-1 bg-outline-variant/20" />
                                </div>
                                <h3 className="font-title-md text-title-md tracking-tight text-on-surface group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60">Lead: {item.speaker}</p>
                            </div>

                            <div className="flex flex-col md:items-end gap-unit shrink-0 font-label-sm text-label-sm text-on-surface-variant">
                                <div className="flex items-center gap-unit">
                                    <span className="material-symbols-rounded text-[16px]">location_on</span>
                                    {item.location}
                                </div>
                                <div className="flex items-center gap-unit">
                                    <span className="material-symbols-rounded text-[16px]">schedule</span>
                                    {new Date(item.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(item.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>

                            <button
                                onClick={() => handleSessionRegistration(item.title)}
                                className={clsx(
                                    "px-stack-lg py-stack-sm rounded-xl border font-label-md text-label-md font-medium tracking-wide font-bold transition-all flex items-center gap-stack-sm whitespace-nowrap",
                                    bookmarkedSessions.includes(item.title)
                                        ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-400"
                                        : "bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50"
                                )}
                            >
                                <span className="material-symbols-rounded text-[18px]">
                                    {bookmarkedSessions.includes(item.title) ? "verified" : "add_task"}
                                </span>
                                {bookmarkedSessions.includes(item.title) ? "Assigned" : "Assign"}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>
          )}

          {/* Architectural Layout (Booths) */}
          {event.booths && event.booths.length > 0 && (
            <section className="bg-surface-container-lowest border border-outline-variant/15 rounded-[40px] p-stack-xl shadow-inner">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-xl mb-stack-xl">
                    <div className="flex items-center gap-stack-md">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-rounded text-[28px]">floor_lamp</span>
                        </div>
                        <div>
                            <h2 className="font-title-lg text-title-lg tracking-tight text-on-surface">Spatial Grid</h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Architectural booth mapping & telemetry</p>
                        </div>
                    </div>
                    <div className="flex gap-stack-sm">
                        <div className="flex items-center gap-unit bg-emerald-900/20 text-emerald-400 px-stack-md py-1.5 rounded-xl border border-emerald-500/20 font-label-sm text-xs font-medium tracking-wide font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {availableBooths} Vacant
                        </div>
                        <div className="bg-surface-container-high text-on-surface-variant px-stack-md py-1.5 rounded-xl border border-outline-variant/30 font-label-sm text-xs font-medium tracking-wide font-bold">
                            {event.booths.length} Total Nodes
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10 gap-stack-sm">
                    {event.booths.sort((a,b) => a.boothNumber.localeCompare(b.boothNumber)).map((booth, idx) => (
                        <div
                            key={idx}
                            className={clsx(
                                "aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all duration-500 group relative cursor-help",
                                booth.status === 'available'
                                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                                    : 'bg-surface-container-high border-outline-variant/20 text-on-surface-variant opacity-40 grayscale'
                            )}
                        >
                            <span className="font-title-sm text-title-sm tracking-tight font-bold">{booth.boothNumber}</span>
                            <span className="font-label-sm text-[8px] normal-case font-semibold opacity-40">{booth.size?.charAt(0)}</span>

                            {/* Telemetry Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-stack-md px-stack-lg py-stack-md bg-surface-container-highest border border-outline-variant/30 text-on-surface rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-50 shadow-2xl flex flex-col items-center gap-stack-sm">
                                <span className="font-label-sm text-label-sm font-medium tracking-wide">{booth.status === 'available' ? 'Not Available' : `Locked: ${booth.assignedTo?.companyName || 'Unknown Entity'}`}</span>
                                {booth.status !== 'available' && booth.assignedTo && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleContactExhibitor(booth.assignedTo);
                                        }}
                                        className="pointer-events-auto w-full bg-primary text-on-primary py-1.5 rounded-lg font-label-sm text-label-sm font-medium tracking-wide font-bold flex items-center justify-center gap-unit hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-rounded text-[14px]">send</span> Establish Link
                                    </button>
                                )}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-surface-container-highest" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          )}

          {/* Signal Feedback */}
          {isRegistered && (
            <section className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-stack-xl">
                <div className="flex items-center gap-stack-md mb-stack-lg">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-rounded">sensors</span>
                    </div>
                    <h2 className="font-title-lg text-title-lg tracking-tight text-on-surface">Feedback</h2>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="space-y-stack-lg">
                    <div className="space-y-unit">
                        <label className="font-label-md text-label-md font-medium tracking-wide text-on-surface-variant font-bold px-1"> Type</label>
                        <div className="flex flex-wrap gap-stack-sm">
                            {["general", "suggestion", "issue"].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFeedbackType(type)}
                                    className={clsx(
                                        "px-stack-lg py-2 rounded-xl font-label-sm text-label-sm font-medium tracking-wide font-bold transition-all border",
                                        feedbackType === type
                                            ? "bg-primary/20 border-primary/30 text-primary"
                                            : "bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:border-primary/40"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-unit">
                        <label className="font-label-md text-label-md font-medium tracking-wide text-on-surface-variant font-bold px-1">Discription</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Identify findings or required adjustments..."
                            rows="4"
                            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl p-stack-md text-on-surface font-body-md text-body-md focus:outline-none focus:border-primary/50 transition-all placeholder:text-on-surface-variant/30 resize-none shadow-inner"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submittingFeedback}
                            className="px-stack-xl h-14 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-medium tracking-wide flex items-center gap-stack-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
                        >
                            {submittingFeedback ? (
                                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Submit
                                    <span className="material-symbols-rounded">send</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>
          )}
        </div>

        {/* Tactical Intel (Sidebar) */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-stack-lg">
            <section className="bg-surface-container-low border border-outline-variant/30 rounded-[32px] p-stack-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[40px] rounded-full -mr-12 -mt-12" />
                
                <h3 className="font-title-md text-title-md tracking-tight text-on-surface mb-stack-xl flex items-center justify-between">
                    Protocol Summary
                    <span className="material-symbols-rounded text-primary opacity-50">data_exploration</span>
                </h3>

                <div className="space-y-stack-lg mb-stack-xl">
                    {[
                        { icon: 'calendar_today', label: 'Activation', value: new Date(event.date).toDateString(), color: 'text-primary' },
                        { icon: 'settings_input_antenna', label: 'Status', value: event.status, color: 'text-emerald-400' },
                        { icon: 'location_on', label: 'Coordinates', value: event.location, color: 'text-primary' },
                        { icon: 'groups', label: 'Force Size', value: `${event.exhibitors?.length || 0} Registered`, color: 'text-primary' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-stack-md group">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center transition-transform group-hover:scale-110">
                                <span className={clsx("material-symbols-rounded text-[20px]", item.color)}>{item.icon}</span>
                            </div>
                            <div>
                                <h4 className="font-label-sm text-[10px] text-on-surface-variant font-medium tracking-wide">{item.label}</h4>
                                <p className="font-title-sm text-title-sm tracking-tight text-on-surface leading-tight capitalize">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {isUpcomingOrOngoing ? (
                    isRegistered ? (
                        <div className="space-y-stack-sm">
                            <div className="w-full h-14 bg-emerald-900/10 border border-emerald-500/20 text-emerald-400 rounded-2xl font-label-md text-label-md font-medium tracking-wide flex items-center justify-center gap-unit">
                                <span className="material-symbols-rounded text-[24px]">verified</span>
                                Verified
                            </div>
                            <button
                                onClick={() => document.getElementById('exhibitors-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full h-14 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-2xl font-label-md text-label-md font-medium tracking-wide flex items-center justify-center gap-unit hover:bg-surface-container-highest transition-all group/msg"
                            >
                                <span className="material-symbols-rounded group-hover/msg:rotate-12 transition-transform">alternate_email</span>
                                Submit FeedBack
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleRegister}
                            disabled={registering}
                            className="w-full h-14 bg-primary text-on-primary rounded-2xl font-label-md text-label-md font-medium tracking-wide flex items-center justify-center gap-unit shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {registering ? (
                                <div className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span className="material-symbols-rounded">login</span>
                                    Register
                                </>
                            )}
                        </button>
                    )
                ) : (
                    <div className="w-full h-14 bg-surface-container-high border border-outline-variant/20 text-on-surface-variant rounded-2xl font-label-md text-label-md font-medium tracking-wide flex items-center justify-center gap-unit opacity-50 grayscale">
                        <span className="material-symbols-rounded">lock_clock</span>
                        {event.status === 'completed' ? 'Event Ended' : 'Event cancelled'}
                    </div>
                )}
            </section>
          </div>
        </div>
      </div>

      {/* Exhibitors Signal Intercept (Modal) */}
      <AnimatePresence>
        {showExhibitorsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExhibitorsModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-[40px] max-w-md w-full p-stack-xl pointer-events-auto shadow-2xl">
                <div className="flex items-center justify-between mb-stack-xl">
                  <h3 className="font-title-lg text-title-lg tracking-tight text-on-surface">Unit Inventory</h3>
                  <button
                    onClick={() => setShowExhibitorsModal(false)}
                    className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>

                <div className="text-center py-12 space-y-stack-lg">
                  <div className="w-20 h-20 bg-surface-container-high rounded-[32px] flex items-center justify-center mx-auto text-on-surface-variant/30">
                    <span className="material-symbols-rounded text-[48px]">inventory_2</span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-title-md tracking-tight text-on-surface">No Signals Identified</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60 max-w-[240px] mx-auto">
                      Exhibitor registrations will appear here once tactical protocols are established.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowExhibitorsModal(false)}
                  className="w-full h-12 rounded-xl border border-outline-variant/30 text-on-surface font-label-md text-label-md font-medium tracking-wide font-bold hover:bg-surface-container-high transition-all"
                >
                  Return to Grid
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ChatModal
        isOpen={showChat}
        onClose={() => {
          setShowChat(false);
          setSelectedExhibitor(null);
        }}
        partnerExhibitor={selectedExhibitor}
        eventId={id}
      />
    </div>
  );
}
