import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ApplyExhibitor() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(false)
    const [booths, setBooths] = useState([])
    const [logoFile, setLogoFile] = useState(null)
    const [formData, setFormData] = useState({
        companyName: '',
        description: '',
        products: '',
        contactInfo: '',
        eventId: '',
        requestedBooth: ''
    })
    const [existingApplications, setExistingApplications] = useState([])

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
            toast.error('Protocol error: Authentication required.')
            navigate('/login')
            return
        }
        const userObj = JSON.parse(storedUser)
        if (userObj.role === 'admin') {
            toast.error('Admins are restricted from exhibitor status.')
            navigate('/')
            return
        }
        setUser(userObj)
        fetchEvents()
    }, [])

    useEffect(() => {
        if (formData.eventId) {
            fetchEventBooths(formData.eventId)
        } else {
            setBooths([])
        }
    }, [formData.eventId])

    const fetchEventBooths = async (eventId) => {
        try {
            const response = await axios.get(`http://localhost:3000/event/get/${eventId}`)
            if (response.data.status) {
                const availableBooths = response.data.data.booths.filter(b => b.status === 'available')
                setBooths(availableBooths)
            }
        } catch (error) {
            console.log("Telemetry failure:", error)
        }
    }

    const fetchEvents = async () => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) return;
        const userObj = JSON.parse(storedUser);

        try {
            const eventsRes = await axios.get('http://localhost:3000/event/getall')
            const appsRes = await axios.get('http://localhost:3000/exhibitor/getall')
            
            if (eventsRes.data.status && appsRes.data.status) {
                const myApps = appsRes.data.data.filter(app => 
                    (app.userId?._id === userObj._id || app.userId === userObj._id)
                )
                setExistingApplications(myApps)

                if (myApps.length > 0) {
                    const latest = myApps[myApps.length - 1]
                    setFormData(prev => ({
                        ...prev,
                        companyName: latest.companyName || '',
                        description: latest.description || '',
                        products: latest.products || '',
                        contactInfo: latest.contactInfo || ''
                    }))
                }

                const appliedEventIds = myApps.map(app => app.eventId?._id || app.eventId)
                const availableEvents = eventsRes.data.data.filter(e =>
                    (e.status === 'upcoming' || e.status === 'ongoing') &&
                    !appliedEventIds.includes(e._id)
                )
                setEvents(availableEvents)
            }
        } catch (error) {
            toast.error('Synchronization failure.')
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e) => {
        setLogoFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = new FormData()
            data.append('userId', user._id)
            data.append('eventId', formData.eventId)
            data.append('companyName', formData.companyName)
            data.append('description', formData.description)
            data.append('products', formData.products)
            data.append('contactInfo', formData.contactInfo)
            data.append('requestedBooth', formData.requestedBooth)
            if (logoFile) {
                data.append('logo', logoFile)
            }

            const response = await axios.post('http://localhost:3000/exhibitor/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data.status) {
                toast.success('Application uploaded. Awaiting administrative review.')
                navigate('/')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error('Application transmission failed.')
        }
        setLoading(false)
    }

    const benefits = [
        { icon: "public", title: "Global Grid", desc: "Broadcast your innovations to a decentralized industrial network." },
        { icon: "analytics", title: "Neural Leads", desc: "Capture high-fidelity engagement through spatial telemetry." },
        { icon: "cell_tower", title: "Instant Link", desc: "Establish secure channels with operatives and partners." },
        { icon: "security", title: "Encrypted Data", desc: "Enterprise-grade isolation for your commercial assets." }
    ]

    return (
        <div className="w-full px-8 md:px-12 lg:px-16 pt-48 pb-32 min-h-screen relative bg-surface-dim overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-primary/10 blur-[200px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full" />
            </div>

            <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                    
                    {/* Tactical Briefing */}
                    <div className="lg:col-span-5 space-y-stack-xl">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex items-center gap-stack-sm text-primary font-label-sm text-label-sm font-semibold tracking-wide mb-stack-lg">
                                <span className="material-symbols-rounded text-[18px]">hub</span>
                                Partner Directive
                            </div>
                            <h1 className="font-display-lg text-display-lg md:text-[88px] text-on-surface tracking-tighter leading-[0.9] mb-stack-xl">
                                Scale your <br />
                                <span className="text-primary opacity-90">Commercial Power.</span>
                            </h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant opacity-70 leading-relaxed max-w-lg">
                                Join our high-performance exhibitor network. Showcase industrial breakthroughs to a global operative base. Your stage is prepped.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
                            {benefits.map((benefit, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                    className="p-stack-xl rounded-[32px] bg-surface-container-low border border-outline-variant/15 hover:border-primary/40 transition-all group shadow-lg"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-stack-lg group-hover:scale-110 transition-transform shadow-inner">
                                        <span className="material-symbols-rounded text-[24px]">{benefit.icon}</span>
                                    </div>
                                    <h3 className="font-title-md text-title-md tracking-tight text-on-surface mb-unit">{benefit.title}</h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60 leading-relaxed">{benefit.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Operative Stats */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="pt-stack-xl border-t border-outline-variant/15 flex items-center gap-stack-md"
                        >
                            <div className="flex -space-x-stack-sm">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-xl border-4 border-surface-dim bg-surface-container-high overflow-hidden shadow-xl">
                                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="operative" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="font-label-sm text-label-sm text-on-surface-variant">
                                <span className="text-on-surface font-semibold">2.5k+</span>
                                <span className="opacity-60 ml-1 font-medium tracking-wide">Units active in network</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Application Interface */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="bg-surface-container-low border border-outline-variant/30 rounded-[48px] p-stack-xl md:p-16 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                                
                                <div className="relative z-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-stack-md mb-12">
                                        <div>
                                            <h2 className="font-display-sm text-display-sm tracking-tight text-on-surface mb-unit">Exhibitor Uplink</h2>
                                            <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60">Synchronize your commercial identity with our grid.</p>
                                        </div>
                                        <div className="flex items-center gap-stack-sm px-4 py-2 rounded-xl bg-primary/5 border border-primary/20 shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="font-label-sm text-[10px] text-primary font-semibold tracking-wide">Live Intake</span>
                                        </div>
                                    </div>

                                    {/* Operative Context */}
                                    {user && (
                                        <div className="mb-10 p-stack-lg rounded-[24px] bg-surface-container-high border border-outline-variant/20 flex items-center gap-stack-md shadow-inner">
                                            <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display-sm text-display-sm tracking-tight shadow-lg shadow-primary/20">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-title-md text-title-md text-on-surface tracking-tight">{user.name}</p>
                                                <p className="font-label-sm text-[10px] text-on-surface-variant font-medium tracking-wide opacity-60">ID: {user.role} operative</p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-stack-xl">
                                        <div className="space-y-stack-lg">
                                            {/* Tactical Parameters */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                                                 <div className="space-y-unit">
                                                     <label className="font-label-sm text-xs font-medium tracking-wide text-on-surface-variant opacity-60 ml-2">Exhibition Node</label>
                                                     <select
                                                         name="eventId"
                                                         value={formData.eventId}
                                                         onChange={handleChange}
                                                         required
                                                         className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-2xl px-stack-md text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner appearance-none cursor-pointer"
                                                     >
                                                         <option value="">Select Expo...</option>
                                                         {events.map(e => (
                                                             <option key={e._id} value={e._id}>{e.title}</option>
                                                         ))}
                                                     </select>
                                                 </div>

                                                 <div className="space-y-unit">
                                                     <label className="font-label-sm text-xs font-medium tracking-wide text-on-surface-variant opacity-60 ml-2">Node Preference</label>
                                                     <select
                                                         name="requestedBooth"
                                                         value={formData.requestedBooth}
                                                         onChange={handleChange}
                                                         disabled={!formData.eventId || booths.length === 0}
                                                         className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-2xl px-stack-md text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner appearance-none disabled:opacity-40 cursor-pointer"
                                                     >
                                                         <option value="">Choose Node...</option>
                                                         {booths.map(b => (
                                                             <option key={b.boothNumber} value={b.boothNumber}>Node {b.boothNumber} ({b.size})</option>
                                                         ))}
                                                     </select>
                                                 </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                                                <div className="space-y-unit">
                                                    <label className="font-label-sm text-xs font-medium tracking-wide text-on-surface-variant opacity-60 ml-2">Corporate Entity</label>
                                                    <input
                                                        type="text"
                                                        name="companyName"
                                                        placeholder="Legal business ID"
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-2xl px-stack-md text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner placeholder:opacity-20"
                                                    />
                                                </div>
                                                <div className="space-y-unit">
                                                    <label className="font-label-sm text-xs font-medium tracking-wide text-on-surface-variant opacity-60 ml-2">Uplink Contact</label>
                                                    <input
                                                        type="text"
                                                        name="contactInfo"
                                                        placeholder="Secure email / signal"
                                                        value={formData.contactInfo}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-2xl px-stack-md text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner placeholder:opacity-20"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                                                <div className="space-y-unit">
                                                    <label className="font-label-sm text-xs font-medium tracking-wide text-on-surface-variant opacity-60 ml-2">Specializations</label>
                                                    <input
                                                        type="text"
                                                        name="products"
                                                        placeholder="e.g. AI, Neural Mesh"
                                                        value={formData.products}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-2xl px-stack-md text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner placeholder:opacity-20"
                                                    />
                                                </div>
                                                <div className="space-y-unit">
                                                    <label className="font-label-sm text-xs font-medium tracking-wide text-on-surface-variant opacity-60 ml-2">Corporate Asset (Logo)</label>
                                                    <div className="relative h-14">
                                                        <input
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            accept="image/*"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                        />
                                                        <div className="absolute inset-0 w-full h-full bg-surface-container-high border border-outline-variant/30 rounded-2xl px-stack-md flex items-center gap-stack-sm pointer-events-none shadow-inner overflow-hidden">
                                                            <span className="material-symbols-rounded text-primary text-[20px]">upload_file</span>
                                                            <span className="font-body-md text-body-md text-on-surface-variant opacity-40 truncate">
                                                                {logoFile ? logoFile.name : "Upload Identification"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-unit">
                                                <label className="font-label-sm text-xs font-medium tracking-wide text-on-surface-variant opacity-60 ml-2">Strategic Vision</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                    required
                                                    rows={4}
                                                    placeholder="Define your industrial story and deployment objectives..."
                                                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-[24px] p-stack-lg text-on-surface font-body-md focus:outline-none focus:border-primary/50 transition-all shadow-inner resize-none placeholder:opacity-20 leading-relaxed"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-stack-md space-y-stack-lg">
                                            <div className="flex items-start gap-stack-sm p-stack-md rounded-[20px] bg-surface-container-high border border-outline-variant/15">
                                                <span className="material-symbols-rounded text-primary text-[18px] shrink-0 mt-0.5">security</span>
                                                <p className="font-label-sm text-[10px] text-on-surface-variant leading-relaxed opacity-60 font-semibold tracking-wide">
                                                    Directive: Application parameters will undergo validation. Approved exhibitors agree to global platform protocols and data isolation standards.
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading || events.length === 0}
                                                className="w-full h-16 rounded-2xl bg-primary text-on-primary font-label-md text-label-md font-semibold tracking-wide hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-stack-md active:scale-[0.98]"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                                                        Processing Payload...
                                                    </>
                                                ) : (
                                                    <>
                                                        Initialize Application
                                                        <span className="material-symbols-rounded">rocket_launch</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-12 pt-8 border-t border-outline-variant/15 text-center">
                                        <p className="font-body-sm text-body-sm text-on-surface-variant opacity-40">
                                            Telemetry Error? <Link to="/contact" className="text-primary font-semibold hover:underline underline-offset-4 opacity-100">Contact Tactical Support</Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}