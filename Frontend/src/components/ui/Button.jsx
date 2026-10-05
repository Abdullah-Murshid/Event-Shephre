import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Button({ 
  children, 
  variant = 'primary', 
  className, 
  fullWidth, 
  icon: Icon,
  ...props 
}) {
  const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-slate-50 text-slate-900 hover:bg-white shadow-[0_4px_12px_rgba(255,255,255,0.1)]",
    secondary: "bg-slate-800/50 text-slate-100 hover:bg-slate-800 border border-white/5 hover:border-white/10 backdrop-blur-sm",
    accent: "bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)] transition-all",
    outline: "border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(
        baseStyles,
        variants[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {Icon && <Icon size={18} />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
