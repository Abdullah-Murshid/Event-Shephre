import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!/^[A-Za-z\s\-]+$/.test(formData.firstName)) {
      setError('Invalid name format. Only letters, spaces, and hyphens are permitted.');
      toast.error('Invalid name format. Only letters, spaces, and hyphens are permitted.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email address format.');
      toast.error('Invalid email address format.');
      return;
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:3000/auth/signup', {
        name: formData.firstName,
        email: formData.email,
        password: formData.password,
        role: 'attendee'
      })

      if (response.data.status) {
        toast.success('Account protocols established.') 
        setTimeout(() => navigate('/login'), 1500)      
      } else {
        setError(response.data.message)
        toast.error(response.data.message)
      }
    } catch (error) {
      setError('Registration sequence failure. Please retry.')
      toast.error('Registration sequence failure.') 
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-surface-dim px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
        {/* Deep Sapphire/Obsidian Micro Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
            <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 blur-[160px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-secondary/5 blur-[160px] rounded-full" />
        </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Cyber Header Wrapper */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="group mb-4 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-primary shadow-xl relative overflow-hidden group-hover:border-primary/40">
                <span className="material-symbols-rounded text-[26px] relative z-10 transition-transform group-hover:scale-110">person_add</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
          <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.25em] text-primary uppercase font-bold font-mono opacity-80">Access Request</span>
              <h1 className="font-black text-3xl sm:text-4xl text-on-surface tracking-tighter leading-none bg-gradient-to-r from-on-surface via-on-surface to-on-surface-variant/70 bg-clip-text">
                  Create Account 
              </h1>
          </div>
        </div>

        {/* Premium Obsidian Card Container */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          
          {error && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-error/10 border border-error/20 text-error p-4 rounded-xl mb-6 flex items-center gap-3'
            >
              <span className="material-symbols-rounded text-[20px] shrink-0">error</span>
              <span className="font-label-sm text-xs md:text-sm tracking-wide font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Form Field */}
            <div className="space-y-2">
                <label className="font-label-sm text-xs font-semibold tracking-wider text-on-surface-variant opacity-50 ml-1">
                    FULL NAME
                </label>
                <div className="relative group">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[20px]">badge</span>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="John Doe"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-4 text-on-surface font-body-md text-sm sm:text-base focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/20"
                    />
                </div>
            </div>

            {/* Email Form Field */}
            <div className="space-y-2">
                <label className="font-label-sm text-xs font-semibold tracking-wider text-on-surface-variant opacity-50 ml-1">
                     EMAIL ADDRESS
                </label>
                <div className="relative group">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[20px]">alternate_email</span>
                    <input
                        type="email"
                        name="email"
                        placeholder="admin@eventsphere.io"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-4 text-on-surface font-body-md text-sm sm:text-base focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/20"
                    />
                </div>
            </div>

            {/* Password Form Field */}
            <div className="space-y-2">
              <label className="font-label-sm text-xs font-semibold tracking-wider text-on-surface-variant opacity-50 ml-1">
                  CREATE A PASSWORD
              </label>
              <div className="relative group">
                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-[20px]">key</span>
                <input
                    type="password"
                    name="password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-3.5 pl-12 pr-4 text-on-surface font-body-md text-sm sm:text-base focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/20"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                  "w-full h-12 sm:h-14 bg-primary text-on-primary rounded-xl font-label-md text-sm font-bold tracking-wide shadow-xl shadow-primary/10 transition-all flex items-center justify-center gap-2 mt-2",
                  loading ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/95 active:scale-[0.99]"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-rounded text-[20px]">how_to_reg</span>
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Footer Segment */}
          <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant opacity-60">
              Already have an account?{' '}
              <Link to="/login" className="text-on-surface font-bold hover:text-primary transition-colors underline underline-offset-8 decoration-primary/20 hover:decoration-primary">
                 Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}