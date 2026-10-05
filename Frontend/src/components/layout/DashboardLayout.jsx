import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getSocket } from "../../services/socketService";
import NotificationDropdown from '../NotificationDropdown';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            toast.error('Please login first')
            navigate('/login')
            return
        }
        setUser(JSON.parse(storedUser))
        setLoading(false)
    }, [navigate])

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const fetchNotifications = async () => {
        if (!user?._id) return;
        try {
            const response = await axios.get(`http://localhost:3000/notifications/${user._id}`);
            if (response.data.status) {
                setNotifications(response.data.data);
                setNotificationCount(response.data.data.length);
            }
        } catch (error) {
            console.log("Failed to fetch notifications inside DashboardLayout:", error);
        }
    };

    useEffect(() => {
        if (!user?._id) return;
        fetchNotifications();
    }, [user?._id]);

    useEffect(() => {
        if (!user?._id) return;

        const s = getSocket();
        if (!s) return;

        const handleNewNotification = (data) => {
            setNotifications(prev => [data, ...prev]);
            setNotificationCount(prev => prev + 1);
            toast.info(`Notification: ${data.title}`);
        };

        s.on('newNotification', handleNewNotification);

        return () => {
            s.off('newNotification', handleNewNotification);
        };
    }, [user?._id]);

    const handleLogout = () => {
        localStorage.removeItem('user')
        setNotifications([])
        setNotificationCount(0)
        toast.success('Logged out successfully!')
        navigate('/')
    }

    const navItems = {
        admin: [
            { name: 'Dashboard', path: '/dashboard/admin', icon: 'dashboard' },
            { name: 'Manage Events', path: '/dashboard/admin/events', icon: 'calendar_today' },
            { name: 'Manage Booths', path: '/dashboard/admin/booths', icon: 'store' },
            { name: 'Schedules', path: '/dashboard/admin/schedules', icon: 'schedule' },
            { name: 'Manage Users', path: '/dashboard/admin/users', icon: 'group' },
            { name: 'Feedback', path: '/dashboard/admin/feedback', icon: 'rate_review' },
        ],
        exhibitor: [
            { name: 'Dashboard', path: '/dashboard/exhibitor', icon: 'dashboard' },
            { name: 'My Booth', path: '/dashboard/exhibitor/booth', icon: 'storefront' },
            { name: 'My Profile', path: '/dashboard/exhibitor/profile', icon: 'person' },
            { name: 'Messages', path: '/dashboard/messages', icon: 'chat' },
        ],
        attendee: [
            { name: 'My Events', path: '/dashboard/attendee', icon: 'event_available' },
            { name: 'Bookmarks', path: '/dashboard/attendee/bookmarks', icon: 'bookmark' },
            { name: 'Browse Events', path: '/events', icon: 'search' },
            { name: 'Messages', path: '/dashboard/messages', icon: 'chat' },
        ]
    }

    const role = user?.role || 'admin'
    const currentNav = navItems[role] || navItems.admin

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full bg-background text-on-background selection:bg-primary/30 selection:text-white overflow-hidden">

            {/* mobile sidebar overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* sidebar */}
            <aside className={clsx(
                "fixed lg:static top-0 left-0 h-screen w-[280px] border-r border-outline-variant/20 bg-surface-container-low flex flex-col py-8 shrink-0 z-[70] transition-transform duration-500 ease-in-out lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="px-4 md:px-8 mb-10 flex items-center justify-between shrink-0">
                    <Link to="/" className="flex items-center group">
                        <div className="flex flex-col leading-none">
                            <span className="text-xl md:text-2xl font-black tracking-tighter text-on-surface">
                                EVENT<span className="text-primary">SPHERE</span>
                            </span>
                        </div>
                    </Link>
                    <button className="lg:hidden w-10 h-10 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setSidebarOpen(false)}>
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {currentNav.map((item, idx) => {
                        const isActive = location.pathname === item.path
                        return (
                            <NavLink
                                key={idx}
                                to={item.path}
                                end={item.path === `/dashboard/${role}`}
                                className={() => clsx(
                                    "flex items-center gap-4 px-4 py-3 mx-4 md:mx-6 rounded-xl font-label-md text-label-md font-semibold tracking-wide transition-all group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                                )}
                            >
                                <span className="material-symbols-rounded text-[22px]" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "''" }}>
                                    {item.icon}
                                </span>
                                <span>{item.name}</span>
                            </NavLink>
                        )
                    })}
                </nav>

                <div className="px-4 md:px-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-label-md text-label-md font-semibold tracking-wide text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-all border border-transparent hover:border-red-400/20"
                    >
                        <span className="material-symbols-rounded">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 md:h-20 shrink-0 border-b border-outline-variant/20 bg-surface-container-low/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-40 sticky top-0">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="lg:hidden w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-surface-container-high border border-outline-variant/20 text-on-surface hover:text-primary transition-all shadow-sm" onClick={() => setSidebarOpen(true)}>
                            <span className="material-symbols-rounded text-[20px] md:text-[22px]">menu</span>
                        </button>
                        <div className="hidden md:flex relative items-center group">
                            <span className="material-symbols-rounded absolute left-4 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Execute System Search..."
                                className="bg-surface-container-high border border-outline-variant/10 rounded-full py-2.5 pl-12 pr-6 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 w-80 transition-all placeholder:text-on-surface-variant/40"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all bg-surface-container rounded-xl border border-outline-variant/20 hover:border-primary/30 group"
                            >
                                <span className="material-symbols-rounded">notifications</span>
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shadow-lg pointer-events-none">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </button>
                            <NotificationDropdown
                                isOpen={showNotifications}
                                onClose={() => setShowNotifications(false)}
                                user={user}
                                notifications={notifications}
                                count={notificationCount}
                                setNotificationCount={setNotificationCount}
                                setNotifications={setNotifications}
                            />
                        </div>

                        <div className="h-8 w-px bg-outline-variant/20 mx-2" />

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-on-surface leading-none tracking-wide">{user.name}</p>
                                <p className="text-[9px] font-semibold text-on-surface-variant tracking-wide mt-1">{user.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center text-primary font-black shadow-lg">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* page content */}
                <main className="flex-1 overflow-y-auto h-full p-8 relative scroll-smooth custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    )
}