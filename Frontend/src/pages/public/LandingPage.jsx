import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    title: 'Precision Spatial Logic',
    description: 'An architectural floor plan engine designed for effortless booth navigation and spatial strategy.',
    icon: 'map',
  },
  {
    title: 'Quantified Intelligence',
    description: 'Deconstruct event performance with deep-layer analytics that transform raw data into command insights.',
    icon: 'analytics',
  },
  {
    title: 'Hardened Security',
    description: 'Military-grade encryption and protocol management that ensures your data remains under strict command.',
    icon: 'shield',
  },
  {
    title: 'Elite Matchmaking',
    description: 'Smart recursive networking protocols that align high-value stakeholders with surgical precision.',
    icon: 'hub',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [dynamicStats, setDynamicStats] = useState([
    { label: 'Network Nodes', value: '0', icon: 'groups' },
    { label: 'Active Command', value: '0', icon: 'campaign' },
    { label: 'Data Points', value: '0', icon: 'query_stats' },
    { label: 'Feedback Loop', value: '0', icon: 'thumbs_up_down' },
  ]);

  const handleInitializeAccess = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role === 'admin') navigate('/dashboard/admin');
      else if (parsedUser.role === 'exhibitor') navigate('/dashboard/exhibitor');
      else if (parsedUser.role === 'attendee') navigate('/dashboard/attendee');
      else navigate('/');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/event/stats');
      if (response.data.status) {
        const s = response.data.data;
        setDynamicStats([
          { label: 'Elite Exhibitors', value: s.totalExhibitors.toLocaleString(), icon: 'verified' },
          { label: 'Master Events', value: s.totalEvents.toLocaleString(), icon: 'event_available' },
          { label: 'Global Members', value: s.totalUsers.toLocaleString(), icon: 'language' },
          { label: 'Signal Feedback', value: s.totalFeedback.toLocaleString(), icon: 'sensors' },
        ]);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface-dim pt-24 lg:pt-32 relative overflow-x-hidden">
      {/* Top Atmospheric Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-16 pb-24 md:pt-32 md:pb-40">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center w-full relative z-10"
          > 

            
            <h1 className="font-display-lg text-4xl sm:text-5xl md:text-7xl lg:text-[100px] text-on-surface mb-stack-xl leading-tight md:leading-[0.95] tracking-tight">
              Engineering <br />
              <span className="text-primary italic">Absolute</span> Events.
            </h1>
            
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-2xl max-w-2xl mx-auto leading-relaxed opacity-80">
              The premier command infrastructure for high-stakes trade shows and exhibitions. 
              Deploy, manage, and scale your vision with industrial precision.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-stack-md">
              <button 
                onClick={handleInitializeAccess}
                className="w-full sm:w-auto px-stack-xl py-stack-md bg-primary text-on-primary rounded-full font-label-md text-label-md font-medium tracking-wide shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started
              </button>
              <Link to="/events" className="w-full sm:w-auto">
                <button className="w-full px-stack-xl py-stack-md bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-full font-label-md text-label-md font-medium tracking-wide hover:bg-surface-container-highest transition-all">
                  View Events
                </button>
              </Link>
            </div>
          </motion.div>
      </section>

      {/* Analytics & Command Section */}
      <section className="w-full px-8 md:px-12 lg:px-16 py-20 bg-transparent relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 flex flex-col gap-6"
            >
              <div className="space-y-unit">
                <p className="font-label-md text-label-md text-primary font-semibold tracking-wide">System Capabilities</p>
                <h2 className="font-display-md text-3xl md:text-5xl tracking-tight text-on-surface leading-tight md:leading-tight">
                  Forged for <br />
                  <span className="italic">High-Precision</span> Command.
                </h2>
              </div>
              
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                EventSphere integrates deep-stack logistics with an intuitive human interface. 
                From real-time floor monitoring to predictive engagement metrics, every module is designed for performance.
              </p>
              
              <div className="space-y-stack-md">
                {[
                  { icon: 'bolt', text: 'Zero-latency transmission protocols' },
                  { icon: 'target', text: 'Surgical booth allocation logic' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-stack-md text-on-surface group">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-rounded">{item.icon}</span>
                    </div>
                    <span className="font-title-sm text-title-sm tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-stack-lg hover:border-primary/40 transition-all hover:shadow-2xl group"
                >
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-stack-md group-hover:rotate-12 transition-transform">
                    <span className="material-symbols-rounded text-[28px]">{feature.icon}</span>
                  </div>
                  <h3 className="font-title-sm text-title-sm tracking-tight text-on-surface mb-unit group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant opacity-70 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
      </section>

      {/* Metrics Grid */}
      <section className="w-full px-8 md:px-12 lg:px-16 py-section-gap bg-surface-dim border-y border-outline-variant/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-stack-md">
            {dynamicStats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-stack-xl text-center group hover:bg-surface-container-high transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-stack-md group-hover:scale-110 transition-transform">
                    <span className="material-symbols-rounded text-[20px]">{stat.icon}</span>
                </div>
                <div className="font-display-md text-display-md tracking-tight text-on-surface mb-unit">{stat.value}</div>
                <div className="font-label-sm text-label-sm text-on-surface-variant font-medium tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
      </section>

      {/* Final Deployment CTA */}
      <section className="py-40 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(30,58,138,0.1),_transparent_60%)] pointer-events-none" />
          <h2 className="font-display-lg text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-on-surface mb-stack-xl leading-tight tracking-tight">Ready for <br /><span className="italic text-primary">Deployment?</span></h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-2xl max-w-2xl mx-auto leading-relaxed opacity-80">
            Join the elite network of organizers who demand absolute precision and 
            uncompromising quality in every exhibition.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-stack-md">
            <button 
              onClick={handleInitializeAccess}
              className="w-full sm:w-auto px-stack-xl py-stack-md bg-primary text-on-primary rounded-full font-label-md text-label-md font-medium tracking-wide shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >
              Get Started
            </button>
            <Link to="/about" className="w-full sm:w-auto">
                <button className="w-full px-stack-xl py-stack-md bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-full font-label-md text-label-md font-medium tracking-wide hover:bg-surface-container-highest transition-all">
                Protocol Briefing
                </button>
            </Link>
          </div>
      </section>
    </div>
  );
}

