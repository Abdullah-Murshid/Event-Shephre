import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import axios from 'axios';
import { connectSocket, getSocket } from "../../services/socketService";
import NotificationDropdown from '../NotificationDropdown';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [notificationCount, setNotificationCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
      }
    }

    checkUser()
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('userLoggedIn', checkUser)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('userLoggedIn', checkUser)
    }
  }, [])

  useEffect(() => {
    if (!user?._id) return;
    connectSocket(user._id);
    fetchUnreadCount();
    fetchNotifications();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const s = getSocket();
    if (!s) return;

    const handleNewMessage = () => {
      fetchUnreadCount();
    };

    const handleNewNotification = (data) => {
      setNotifications(prev => [data, ...prev]);
      setNotificationCount(prev => prev + 1);
      toast.info(`Notification: ${data.title}`);
    };

    s.on('newMessage', handleNewMessage);
    s.on('newNotification', handleNewNotification);

    return () => {
      s.off('newMessage', handleNewMessage);
      s.off('newNotification', handleNewNotification);
    };
  }, [user?._id]);

  const fetchUnreadCount = async () => {
    if (!user) return
    try {
      const response = await axios.get(`http://localhost:3000/message/unread/${user._id}`)
      if (response.data.status) {
        setUnreadCount(response.data.data.count)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchNotifications = async () => {
    if (!user?._id) return
    try {
      const response = await axios.get(`http://localhost:3000/notifications/${user._id}`)
      if (response.data.status) {
        setNotifications(response.data.data)
        setNotificationCount(response.data.data.length)
      }
    } catch (error) {
      console.log("Failed to fetch notification history:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setUnreadCount(0)
    setNotifications([])
    setNotificationCount(0)
    window.dispatchEvent(new Event('userLoggedIn'))
    toast.success('Logged out successfully!')
    navigate('/')
  }

  const mainLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'About', path: '/about' },
  ]

  const getDropdownLinks = () => {
    if (!user) return []
    const links = []
    
    if (user.role === 'admin') links.push({ name: 'Command Center', path: '/dashboard/admin' })
    else if (user.role === 'exhibitor') links.push({ name: 'Exhibitor Portal', path: '/dashboard/exhibitor' })
    else if (user.role === 'attendee') links.push({ name: 'My Dashboard', path: '/dashboard/attendee' })

    if (user.role !== 'admin') {
      links.push({ name: 'Apply as Exhibitor', path: '/apply-exhibitor' })
    }

    return links
  }

  const dropdownLinks = getDropdownLinks()

  return (
    <header
      className={clsx(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled ? "bg-surface-dim/80 backdrop-blur-md h-16 shadow-xl" : "bg-transparent h-24"
      )}
    >
      <div className="w-full h-full flex items-center justify-between px-10">

        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter text-on-surface">
              EVENT<span className="text-primary">SPHERE</span>
            </span>

          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {mainLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={clsx(
                "font-label-md text-label-md font-medium tracking-wide transition-all duration-300 hover:text-primary relative group/link py-2",
                location.pathname === link.path ? "text-primary" : "text-on-surface-variant"
              )}
            >
              {link.name}
              <span className={clsx(
                "absolute -bottom-0.5 left-0 h-0.5 bg-primary transition-all duration-300",
                location.pathname === link.path ? "w-full" : "w-0 group-hover/link:w-full"
              )} />
            </Link>
          ))}

          {/* User Portal Dropdown */}
          {user && dropdownLinks.length > 0 && (
            <div className="relative group/dropdown py-2">
              <button className="flex items-center gap-2 font-label-md text-label-md font-medium tracking-wide text-on-surface-variant hover:text-primary transition-all duration-300">
                Access
                <span className="material-symbols-rounded text-[18px] group-hover/dropdown:rotate-180 transition-transform">expand_more</span>
              </button>
              
              <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/dropdown:opacity-100 group-hover/dropdown:translate-y-0 group-hover/dropdown:pointer-events-auto transition-all duration-300 min-w-[220px]">
                <div className="bg-surface-container-high border border-outline-variant/30 rounded-xl p-2 shadow-2xl">
                  {dropdownLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="flex items-center px-4 py-3 rounded-lg text-label-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all tracking-wide"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-stack-lg">
          {user ? (
            <div className="flex items-center gap-stack-md">
              {/* Messages Icon */}
              {(user.role === 'attendee' || user.role === 'exhibitor') && (
                <div className="relative">
                  <Link
                    to="/dashboard/messages"
                    className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <span className="material-symbols-rounded">chat</span>
                  </Link>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shadow-lg">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              )}

              {/* Notification Bell */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <span className="material-symbols-rounded">notifications</span>
                  </button>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shadow-lg pointer-events-none">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
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
              )}

              <div className="h-8 w-px bg-outline-variant/30 mx-2" />

              <div className="flex items-center gap-stack-md">
                <div className="text-right hidden sm:block">
                  <p className="font-label-md text-label-md text-on-surface font-semibold leading-none">{user.name}</p>
                  <p className="text-[10px] font-semibold text-primary tracking-wide">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-lg bg-error/10 border border-error/20 flex items-center justify-center text-error hover:bg-error hover:text-on-error transition-all duration-300"
                >
                  <span className="material-symbols-rounded">logout</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="font-label-md text-label-md font-medium tracking-wide text-on-surface hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link to="/events">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-stack-xl py-stack-sm bg-primary rounded-full text-on-primary font-label-md text-label-md font-medium tracking-wide shadow-lg shadow-primary/20"
                >
                  Discovery
                </motion.button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface"
        >
          <span className="material-symbols-rounded">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-surface-dim border-b border-outline-variant/30 py-stack-xl lg:hidden z-50 backdrop-blur-xl"
          >
            <div className="container mx-auto px-6 flex flex-col gap-stack-lg">
              {mainLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-title-md tracking-tight font-semibold text-on-surface"
                >
                  {link.name}
                </Link>
              ))}
              
              {dropdownLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-title-md tracking-tight font-semibold text-primary"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-outline-variant/30 my-stack-sm" />
              {user ? (
                <>
                  {(user.role === 'attendee' || user.role === 'exhibitor') && (
                    <Link to="/dashboard/messages" onClick={() => setIsOpen(false)} className="text-title-md tracking-tight font-semibold text-on-surface flex items-center gap-stack-md">
                      <span className="material-symbols-rounded">chat</span> Messages {unreadCount > 0 && `(${unreadCount})`}
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="text-title-md tracking-tight font-semibold text-error flex items-center gap-stack-md"
                  >
                    <span className="material-symbols-rounded">logout</span> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-title-md tracking-tight font-semibold text-on-surface">
                    Sign In
                  </Link>
                  <Link to="/events" onClick={() => setIsOpen(false)} className="text-primary font-semibold text-title-md tracking-tight">
                    Discovery
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}