import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function Input({
  label,
  id,
  error,
  className,
  type = "text",
  ...props
}) {
  return (
    <div className={clsx("flex flex-col gap-2 w-full", className)}>
      {label && (
        <label htmlFor={id} className="text-[11px] font-bold tracking-[0.1em] normal-case font-medium text-slate-500 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          id={id}
          type={type}
          className={clsx(
            "w-full px-5 py-4 bg-slate-800/30 backdrop-blur-md border rounded-2xl text-white outline-none transition-all duration-300",
            "placeholder-slate-600 font-medium relative z-10",
            error
              ? "border-red-500/30 focus:border-red-500 focus:bg-red-500/5"
              : "border-white/5 focus:border-accent-blue/50 focus:bg-slate-800/60 hover:border-white/10"
          )}
          {...props}
        />
        {!error && (
          <div className="absolute -inset-0.5 rounded-2xl bg-accent-blue/0 group-focus-within:bg-accent-blue/8 group-focus-within:shadow-[0_0_25px_rgba(96,165,250,0.15)] pointer-events-none transition-all duration-300 z-0 opacity-0 group-focus-within:opacity-100" />
        )}
      </div>
      {error && (
        <motion.span
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold text-red-400 mt-1 ml-1 flex items-center gap-1.5"
        >
          <div className="w-1 h-1 rounded-full bg-red-400" />
          {error}
        </motion.span>
      )}
    </div>
  );
}

