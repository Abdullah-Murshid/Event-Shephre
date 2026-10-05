import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      setErrors({ ...errors, email: 'Email is required' });
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setErrors({ ...errors, email: 'Please enter a valid email' });
      return false;
    }
    return true;
  };

  const validateOTP = () => {
    if (!formData.otp) {
      setErrors({ ...errors, otp: 'OTP is required' });
      return false;
    }
    if (formData.otp.length !== 6) {
      setErrors({ ...errors, otp: 'OTP must be 6 digits' });
      return false;
    }
    if (!/^\d+$/.test(formData.otp)) {
      setErrors({ ...errors, otp: 'OTP must contain only numbers' });
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/forgot-password', {
        email: formData.email
      });

      if (response.data.status) {
        toast.success('Protocol Initiated: OTP dispatched.');
        setStep(2);
      } else {
        toast.error(response.data.message || 'Transmission failed');
      }
    } catch (error) {
      toast.error('System failure during OTP dispatch.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });

      if (response.data.status) {
        toast.success('OTP Validated. Identity confirmed.');
        setStep(3);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Validation failure. Re-verify OTP.');
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });

      if (response.data.status) {
        toast.success('Security Key Updated. Access restored.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        toast.error(response.data.message || 'Reset failed');
      }
    } catch (error) {
      toast.error('System error during key update.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-surface-dim px-6 py-20">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-stack-xl flex flex-col items-center">
          <Link to="/" className="group mb-stack-lg transition-transform hover:scale-110">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-2xl shadow-primary/40 relative">
                <span className="material-symbols-rounded text-[32px]">lock_reset</span>
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
            </div>
          </Link>
          <h1 className="font-display-md text-display-md text-on-surface mb-unit tracking-tight">Key Recovery</h1>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70">Execute account restoration protocol</p>
        </div>

        <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-stack-xl shadow-2xl backdrop-blur-md">
          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-500 border",
                    step === s ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-110" : 
                    step > s ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : 
                    "bg-surface-container-high border-outline-variant/20 text-on-surface-variant opacity-40"
                  )}
                >
                  {step > s ? (
                    <span className="material-symbols-rounded text-[18px]">check</span>
                  ) : (
                    <span className="font-label-md text-label-md">{s}</span>
                  )}
                </div>
                {s < 3 && (
                  <div
                    className={clsx(
                      "w-8 h-[1px] mx-2 transition-all duration-500",
                      step > s ? "bg-emerald-500/30" : "bg-outline-variant/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-stack-lg"
              >
                <div className="space-y-unit">
                  <label className="font-label-md text-label-md normal-case font-medium tracking-[0.15em] text-on-surface-variant font-bold px-1">Access Email</label>
                  <div className="relative group">
                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">alternate_email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="operator@eventsphere.io"
                      value={formData.email}
                      onChange={handleChange}
                      className={clsx(
                        "w-full bg-surface-container-high border rounded-xl py-stack-md pl-12 pr-stack-md text-on-surface font-body-md text-body-md focus:outline-none transition-all placeholder:text-on-surface-variant/30",
                        errors.email ? "border-error/50" : "border-outline-variant/30 focus:border-primary/50"
                      )}
                    />
                  </div>
                  {errors.email && <p className="text-error font-label-sm text-xs font-medium tracking-wide px-2">{errors.email}</p>}
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full h-14 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-medium tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-stack-sm mt-stack-md"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="material-symbols-rounded">send</span>
                      Dispatch OTP
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-stack-lg"
              >
                <div className="text-center mb-6">
                  <p className="font-body-sm text-body-sm text-on-surface-variant opacity-60">
                    A 6-digit synchronization code was sent to<br />
                    <span className="text-on-surface font-bold opacity-100">{formData.email}</span>
                  </p>
                </div>

                <div className="space-y-unit">
                  <label className="font-label-md text-label-md normal-case font-medium tracking-[0.15em] text-on-surface-variant font-bold px-1">Security Code</label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData({ ...formData, otp: val });
                      setErrors({ ...errors, otp: '' });
                    }}
                    maxLength={6}
                    className={clsx(
                      "w-full bg-surface-container-high border rounded-xl py-stack-md text-center text-on-surface font-display-sm text-display-sm tracking-[0.5em] focus:outline-none transition-all placeholder:text-on-surface-variant/20",
                      errors.otp ? "border-error/50" : "border-outline-variant/30 focus:border-primary/50"
                    )}
                  />
                  {errors.otp && <p className="text-error font-label-sm text-xs font-medium tracking-wide px-2">{errors.otp}</p>}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="flex-1 h-14 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-xl font-label-md text-label-md font-medium tracking-wide font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                    Abort
                  </button>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading}
                    className="flex-1 h-14 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-medium tracking-wide font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-rounded">verified</span>
                        Verify
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full text-center font-label-sm text-label-sm text-on-surface-variant font-medium tracking-wide hover:text-primary transition-colors mt-4 opacity-60 hover:opacity-100"
                >
                  Resend Signal
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-stack-lg"
              >
                <div className="space-y-stack-md">
                  <div className="space-y-unit">
                    <label className="font-label-md text-label-md normal-case font-medium tracking-[0.15em] text-on-surface-variant font-bold px-1">New Security Key</label>
                    <div className="relative group">
                      <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        placeholder="••••••••••••"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={clsx(
                          "w-full bg-surface-container-high border rounded-xl py-stack-md pl-12 pr-12 text-on-surface font-body-md text-body-md focus:outline-none transition-all placeholder:text-on-surface-variant/30",
                          errors.newPassword ? "border-error/50" : "border-outline-variant/30 focus:border-primary/50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-rounded text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-error font-label-sm text-xs font-medium tracking-wide px-2">{errors.newPassword}</p>}
                  </div>

                  <div className="space-y-unit">
                    <label className="font-label-md text-label-md normal-case font-medium tracking-[0.15em] text-on-surface-variant font-bold px-1">Confirm Key</label>
                    <div className="relative group">
                      <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">lock_clock</span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="••••••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={clsx(
                          "w-full bg-surface-container-high border rounded-xl py-stack-md pl-12 pr-12 text-on-surface font-body-md text-body-md focus:outline-none transition-all placeholder:text-on-surface-variant/30",
                          errors.confirmPassword ? "border-error/50" : "border-outline-variant/30 focus:border-primary/50"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-rounded text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-error font-label-sm text-xs font-medium tracking-wide px-2">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 h-14 bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-xl font-label-md text-label-md font-medium tracking-wide font-bold hover:bg-surface-container-highest transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded text-[18px]">arrow_back</span>
                    Back
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="flex-1 h-14 bg-primary text-on-primary rounded-xl font-label-md text-label-md font-medium tracking-wide font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-rounded">update</span>
                        Update Key
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-stack-xl pt-stack-xl border-t border-outline-variant/20 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Key identified?{' '}
              <Link to="/login" className="text-on-surface hover:text-primary transition-colors font-bold underline underline-offset-8 decoration-primary/30 hover:decoration-primary">
                Return to Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}