import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  id,
  error,
  className,
  options = [],
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
        <select
          id={id}
          className={clsx(
            "w-full px-5 py-4 bg-slate-800/30 backdrop-blur-md border rounded-2xl text-white outline-none transition-all duration-300",
            "appearance-none font-medium relative z-10 cursor-pointer",
            error
              ? "border-red-500/30 focus:border-red-500 focus:bg-red-500/5"
              : "border-white/5 focus:border-accent-blue/50 focus:bg-slate-800/60 hover:border-white/10"
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-white py-4">
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-slate-500 group-hover:text-accent-blue transition-colors">
          <ChevronDown size={18} />
        </div>

        {!error && (
          <div className="absolute -inset-0.5 rounded-2xl bg-accent-blue/0 group-focus-within:bg-accent-blue/8 group-focus-within:shadow-[0_0_25px_rgba(96,165,250,0.15)] pointer-events-none transition-all duration-300 z-0 opacity-0 group-focus-within:opacity-100" />
        )}
      </div>
      {error && (
        <div className="text-[11px] font-semibold text-red-400 mt-1 ml-1 flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-red-400" />
          {error}
        </div>
      )}
    </div>
  );
}
