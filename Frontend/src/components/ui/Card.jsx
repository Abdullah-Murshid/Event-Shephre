import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({ 
  children, 
  className, 
  hover = true,
  delay = 0,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5 } : {}}
      className={clsx(
        "glass-card p-6 md:p-8 relative overflow-hidden group transition-all duration-500",
        hover && "hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Subtle hover gradient */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-transparent to-accent-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
