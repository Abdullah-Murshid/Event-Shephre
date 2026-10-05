import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import clsx from 'clsx';

export default function About() {
  const [dynamicStats, setDynamicStats] = useState({
    events: 0,
    exhibitors: 0,
    attendees: 0,
    security: 100
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/event/stats');
        if (response.data.status) {
          setDynamicStats({
            events: response.data.data.totalEvents,
            exhibitors: response.data.data.totalExhibitors,
            attendees: response.data.data.totalAttendees,
            security: 100
          });
        }
      } catch (error) {
        console.error("Stats synchronization failure:", error);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Active Deployments', value: dynamicStats.events, icon: 'analytics', color: 'text-primary' },
    { label: 'Tactical Exhibitors', value: dynamicStats.exhibitors, icon: 'groups_3', color: 'text-primary' },
    { label: 'Verified Operatives', value: dynamicStats.attendees, icon: 'verified_user', color: 'text-emerald-400' },
    { label: 'Data Protocol', value: `${dynamicStats.security}%`, icon: 'security', color: 'text-primary' },
  ];

  const values = [
    {
      title: "Tactical UI/UX",
      desc: "Interface architecture designed for elite operatives. Minimal latency, maximum impact.",
      icon: "architecture",
      color: "bg-primary/10 border-primary/20 text-primary"
    },
    {
      title: "Neural Innovation",
      desc: "Setting industrial standards through constant iteration and technological dominance.",
      icon: "neurology",
      color: "bg-primary/10 border-primary/20 text-primary"
    },
    {
      title: "Fortress Security",
      desc: "Absolute data integrity and system uptime. Our infrastructure is a black site for errors.",
      icon: "shield_lock",
      color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      title: "Global Mesh",
      desc: "Intercontinental connectivity bridging the distance between strategy and execution.",
      icon: "public",
      color: "bg-primary/10 border-primary/20 text-primary"
    }
  ];

  return (
    <div className="w-full px-8 md:px-12 lg:px-16 pt-48 pb-32 relative bg-surface-dim overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[180px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full" />
      </div>

        {/* Core Philosophy Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-section-gap"
        >
          <div className="flex items-center gap-stack-sm text-primary font-label-sm text-label-sm font-semibold tracking-wide mb-stack-lg">
            <span className="material-symbols-rounded text-[16px]">terminal</span>
            Mission Protocol
          </div>
          <h1 className="font-display-lg text-display-lg md:text-[96px] text-on-surface tracking-tighter leading-[0.9] mb-stack-xl">
            Engineering the <br />
            <span className="text-primary opacity-90">Future of Interaction.</span>
          </h1>
          
          <div className="max-w-4xl">
            <p className="font-body-lg text-body-lg md:text-2xl text-on-surface-variant leading-relaxed opacity-70 font-medium italic">
              "EventSphere exists to dismantle the friction of human coordination. We architect environments where elite execution meets effortless connection."
            </p>
          </div>
        </motion.div>

        {/* Telemetry Stream (Stats) */}
        <div className="py-20 border-y border-outline-variant/15 mb-section-gap">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col group">
                <div className="flex items-center gap-stack-sm mb-unit">
                    <span className={clsx("material-symbols-rounded text-[20px] opacity-40", stat.color)}>{stat.icon}</span>
                    <div className="text-on-surface-variant font-label-sm text-[10px] tracking-wide normal-case font-semibold opacity-60">
                        {stat.label}
                    </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="font-display-md text-display-md md:text-[64px] text-on-surface tracking-tighter group-hover:text-primary transition-colors duration-500"
                >
                  {stat.value}
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Objectives */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-section-gap items-center">
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="lg:col-span-7 space-y-stack-xl"
          >
            <h2 className="font-display-md text-display-md text-on-surface tracking-tight leading-tight">
              Why we deployed <br />
              <span className="text-primary">EventSphere Alpha</span>
            </h2>
            <div className="space-y-stack-lg font-body-lg text-body-lg text-on-surface-variant opacity-70 leading-relaxed max-w-2xl">
              <p>
                The legacy landscape of event coordination was compromised by fragmentation and archaic UX. We engineered a unified ecosystem that integrates organizers, exhibitors, and attendees into a singular, high-performance grid.
              </p>
              <p>
                From real-time spatial telemetry to neural messaging protocols, our platform ensures every mission parameter is met with visual excellence and technical precision.
              </p>
            </div>
            <div className="flex flex-wrap gap-stack-md pt-stack-md">
              <div className="flex items-center gap-stack-sm px-6 py-stack-md rounded-2xl bg-surface-container-high border border-outline-variant/30 text-on-surface shadow-lg">
                <span className="material-symbols-rounded text-primary">military_tech</span>
                <span className="font-label-md text-label-md font-semibold tracking-wide opacity-80">Industrial Award 2026</span>
              </div>
              <div className="flex items-center gap-stack-sm px-6 py-stack-md rounded-2xl bg-surface-container-high border border-outline-variant/30 text-on-surface shadow-lg">
                <span className="material-symbols-rounded text-primary">target</span>
                <span className="font-label-md text-label-md font-semibold tracking-wide opacity-80">99.9% Logic Uptime</span>
              </div>
            </div>
          </motion.div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="p-stack-xl rounded-[32px] bg-surface-container-low border border-outline-variant/15 hover:border-primary/40 transition-all h-full group shadow-lg">
                  <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-stack-lg transition-transform group-hover:scale-110 duration-500 border shadow-inner", val.color)}>
                    <span className="material-symbols-rounded text-[28px]">{val.icon}</span>
                  </div>
                  <h4 className="font-title-md text-title-md tracking-tight text-on-surface mb-unit">{val.title}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60 leading-relaxed">{val.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Operative Network */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-24 border-t border-outline-variant/15"
        >
          <div className="flex -space-x-stack-sm justify-center mb-stack-xl">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -8, scale: 1.1, zIndex: 10 }}
                className="w-20 h-20 rounded-2xl border-4 border-surface-dim bg-surface-container-high overflow-hidden shadow-2xl transition-all cursor-pointer group"
              >
                <img src={`https://i.pravatar.cc/150?u=${i + 40}`} alt="Operative" className="w-full h-full object-cover filter group-hover:grayscale-0 grayscale transition-all duration-500" />
              </motion.div>
            ))}
          </div>
          <h3 className="font-display-sm text-display-sm text-on-surface mb-stack-md tracking-tight">Built by a Global Network of Visionaries.</h3>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-60 max-w-2xl mx-auto leading-relaxed">
            From industrial hubs to digital frontiers, our team of architects, engineers, and strategists are dedicated to a singular directive: making your deployment absolute.
          </p>
        </motion.div>
    </div>
  );
}


