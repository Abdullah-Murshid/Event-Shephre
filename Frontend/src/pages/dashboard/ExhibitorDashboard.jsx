import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export default function ExhibitorDashboard() {
    const navigate = useNavigate();
    const [exhibitor, setExhibitor] = useState(null)
    const [loading, setLoading] = useState(true)
    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        fetchExhibitorData()
    }, [])

    const fetchExhibitorData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/exhibitor/getall')
            if (response.data.status) {
                const myExhibitor = response.data.data.find(
                    e => e.userId?._id === user?._id || e.userId === user?._id
                )
                setExhibitor(myExhibitor || null)
            }
        } catch (error) {
            toast.error('Synchronization failure: Exhibitor data compromised.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-stack-md opacity-40 grayscale">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-label-md text-label-md font-medium tracking-wide">Syncing Hub...</p>
            </div>
        );
    }

    if (!exhibitor) {
        return (
            <div className="space-y-stack-xl">
                <header>
                    <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                        Exhibitor Hub
                    </div>
                    <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                        Exhibitor Dashboard Panel
                    </h1>
                </header>
                <div className="p-20 text-center bg-surface-container-low border border-outline-variant/30 rounded-[48px] shadow-inner space-y-stack-lg">
                    <span className="material-symbols-rounded text-[56px] text-on-surface-variant/20">storefront</span>
                    <div>
                        <h3 className="font-title-lg text-title-lg tracking-tight text-on-surface opacity-80">No Active Profile</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant opacity-60 mt-unit">Initiate a commercial application to unlock the partner dashboard.</p>
                    </div>
                    <button
                        onClick={() => navigate('/apply-exhibitor')}
                        className="h-12 px-stack-xl rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Apply for Intake
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-stack-xl w-full">
            <header>
                <div className="flex items-center gap-stack-sm text-primary font-bold tracking-wide mb-stack-sm text-2xl md:text-3xl">
                    Exhibitor Hub
                </div>
                <h1 className="font-black text-4xl md:text-6xl text-on-surface tracking-tighter leading-none">
                    Welcome, {user?.name}
                </h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full">
                <div className="md:col-span-2 bg-surface-container-low border border-outline-variant/15 rounded-[40px] overflow-hidden shadow-lg flex flex-col justify-between p-stack-xl">
                    <div>
                        <h4 className="font-title-sm text-title-sm tracking-tight text-on-surface mb-unit font-semibold opacity-60">Company Name</h4>
                        <h3 className="font-display-sm text-display-sm text-on-surface mb-unit leading-tight tracking-tight">{exhibitor.companyName}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant opacity-60 leading-relaxed max-w-2xl mt-4">{exhibitor.description}</p>
                    </div>
                    <div className="pt-6">
                        <button
                            onClick={() => navigate('/dashboard/exhibitor/profile')}
                            className="h-12 px-stack-xl rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold tracking-wide shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-stack-sm"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-stack-md h-full justify-between">
                    <div className="p-stack-xl rounded-[32px] bg-surface-container-low border border-outline-variant/15 shadow-lg group hover:border-primary/30 transition-all flex-1">
                        <span className="material-symbols-rounded text-primary text-[28px] mb-stack-md">inventory_2</span>
                        <h4 className="font-title-sm text-title-sm tracking-tight text-on-surface mb-unit font-semibold opacity-60">Asset List</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{exhibitor.products || 'No commercial assets listed.'}</p>
                    </div>
                    <div className="p-stack-xl rounded-[32px] bg-surface-container-low border border-outline-variant/15 shadow-lg group hover:border-primary/30 transition-all flex-1">
                        <span className="material-symbols-rounded text-primary text-[28px] mb-stack-md">event_available</span>
                        <h4 className="font-title-sm text-title-sm tracking-tight text-on-surface mb-unit font-semibold opacity-60">Event registered</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{exhibitor.eventId?.title || 'No strategic event assigned.'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}