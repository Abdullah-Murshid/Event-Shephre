import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalExhibitors: 0,
        totalAttendees: 0,
        totalUsers: 0,
        totalBooths: 0,
        totalFeedback: 0
    })
    const [recentEvents, setRecentEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        fetchStats()
        fetchEvents()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:3000/event/stats')
            if (response.data.status) setStats(response.data.data)
        } catch (error) {
            toast.error('Telemetry failure: Stats sync interrupted.')
        }
    }

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3000/event/getall')
            if (response.data.status) setRecentEvents(response.data.data.slice(0, 4))
        } catch (error) {
            toast.error('Network failure: Event log inaccessible.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadReport = async () => {
        try {
            const response = await axios.get('http://localhost:3000/event/report', {
                responseType: 'blob',
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'EventSphere_Analytics_Report.csv')
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success('Analytics payload downloaded.')
        } catch (error) {
            toast.error('Protocol failure: Report extraction denied.')
        }
    }

    const getStatusStyle = (status) => {
        if (status === 'ongoing') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        if (status === 'upcoming') return 'bg-primary/10 text-primary border-primary/20'
        if (status === 'completed') return 'bg-surface-container-high text-on-surface-variant border-outline-variant/20 opacity-40'
        return 'bg-surface-container-high text-on-surface-variant border-outline-variant/20'
    }

    const statCards = [
        {
            title: 'Active Events',
            value: stats.totalEvents,
            icon: 'calendar_month',
            trend: 'Live',
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            title: 'Exhibitors',
            value: stats.totalExhibitors,
            icon: 'storefront',
            trend: 'Vetted',
            color: 'text-cyan-400',
            bg: 'bg-cyan-400/10'
        },
        {
            title: 'Total Booths',
            value: stats.totalBooths,
            icon: 'grid_view',
            trend: 'Mapped',
            color: 'text-secondary',
            bg: 'bg-secondary/10'
        },
        {
            title: 'Staff Members',
            value: stats.totalAttendees,
            icon: 'group',
            trend: 'Registered',
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        },
    ]



    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-stack-md opacity-40 grayscale">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-label-md text-label-md font-medium tracking-wide">Syncing Command Grid...</p>
            </div>
        );
    }

    return (
        <div className="space-y-stack-xl">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-gutter">
                <div>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        Dashboard
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Welcome, {user?.name}
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-stack-sm mt-6 md:mt-0 w-full md:w-auto">
                    <button
                        onClick={handleDownloadReport}
                        className="w-full sm:w-auto h-12 px-stack-lg rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface-variant font-label-md text-label-md font-semibold tracking-wide hover:bg-surface-container-highest transition-all flex items-center justify-center gap-stack-sm"
                    >
                        <span className="material-symbols-rounded text-[18px]">description</span>
                        Generate Report
                    </button>

                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="p-stack-xl rounded-[40px] bg-surface-container-low border border-outline-variant/15 shadow-lg group hover:border-primary/40 transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center border border-outline-variant/15 shadow-inner transition-all group-hover:scale-110", stat.bg, stat.color)}>
                                <span className="material-symbols-rounded text-[28px]">{stat.icon}</span>
                            </div>
                            <span className="font-label-sm text-[10px] font-bold text-emerald-400 tracking-wide bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-sm">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="font-label-sm text-[11px] font-semibold tracking-wide text-on-surface-variant opacity-40 mb-unit">{stat.title}</p>
                            <h3 className="font-display-sm text-display-sm text-on-surface tabular-nums tracking-tighter">
                                {stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full">
                {/* Recent Events */}
                <div className="w-full">
                    <div className="bg-surface-container-low border border-outline-variant/15 rounded-[48px] overflow-hidden shadow-lg h-full">
                        <div className="p-stack-xl border-b border-outline-variant/15 flex justify-between items-center bg-surface-container-low/50 backdrop-blur-xl">
                            <div>
                                <h3 className="font-title-lg text-title-lg text-on-surface tracking-tight">Recent Events Log</h3>
                                <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60">Real-time status overview of all registered exhibitions.</p>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/admin/events')}
                                className="flex items-center gap-unit font-label-md text-label-md font-semibold tracking-wide text-primary hover:opacity-70 transition-all"
                            >
                                Management Grid <span className="material-symbols-rounded text-[18px]">chevron_right</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            {recentEvents.length === 0 ? (
                                <div className="p-20 text-center text-on-surface-variant opacity-40 grayscale flex flex-col items-center gap-stack-md">
                                    <span className="material-symbols-rounded text-[48px]">event_busy</span>
                                    <p className="font-label-md font-medium tracking-wide font-bold">No active logs found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-surface-container-high/30 font-label-sm text-[10px] normal-case font-semibold tracking-wide text-on-surface-variant/40">
                                            <th className="px-stack-xl py-6">Event Name</th>
                                            <th className="px-stack-xl py-6">Status</th>
                                            <th className="px-stack-xl py-6">Venue Location</th>
                                            <th className="px-stack-xl py-6">Event Date</th>
                                            <th className="px-stack-xl py-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                        {recentEvents.map((event) => (
                                            <tr key={event._id} className="hover:bg-primary/[0.03] transition-colors group">
                                                <td className="px-stack-xl py-8">
                                                    <div className="font-title-sm text-title-sm tracking-tight text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px]">
                                                        {event.title}
                                                    </div>
                                                </td>
                                                <td className="px-stack-xl py-8 text-xs">
                                                    <span className={clsx("px-4 py-1.5 rounded-xl font-bold tracking-wide text-[10px] border shadow-sm", getStatusStyle(event.status))}>
                                                        {event.status}
                                                    </span>
                                                </td>
                                                <td className="px-stack-xl py-8">
                                                    <div className="font-body-md text-body-md text-on-surface-variant opacity-70 flex items-center gap-stack-sm">
                                                        <span className="material-symbols-rounded text-primary text-[18px]">location_on</span>
                                                        {event.location}
                                                    </div>
                                                </td>
                                                <td className="px-stack-xl py-8 font-body-md text-body-md text-on-surface-variant opacity-50">
                                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-stack-xl py-8 text-right">
                                                    <button
                                                        className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:border-primary transition-all flex items-center justify-center"
                                                        onClick={() => navigate('/dashboard/admin/events')}
                                                    >
                                                        <span className="material-symbols-rounded">settings</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}