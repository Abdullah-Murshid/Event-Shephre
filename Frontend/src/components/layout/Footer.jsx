import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-dim border-t border-outline-variant/10 pt-24 pb-12 relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-20 text-center md:text-left">
          <div className="md:col-span-2 space-y-8 flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-stack-sm group">
              <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <span className="material-symbols-rounded">hexagon</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter text-on-surface">
                  EVENT<span className="text-primary">SPHERE</span>
                </span>
                <span className="text-[11px] font-semibold tracking-wide text-on-surface-variant">Obsidian Elite</span>
              </div>
            </Link>
            <p className="text-on-surface-variant text-body-md leading-relaxed opacity-60 max-w-md font-normal">
              The premier command infrastructure for high-stakes trade shows and exhibitions. 
              Built for operatives who demand absolute precision and unyielding performance.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all group/icon">
                <span className="material-symbols-rounded group-hover/icon:scale-110 transition-transform">public</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all group/icon">
                <span className="material-symbols-rounded group-hover/icon:scale-110 transition-transform">share</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all group/icon">
                <span className="material-symbols-rounded group-hover/icon:scale-110 transition-transform">hub</span>
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-on-surface font-bold text-[10px] tracking-wide mb-8">Grid Discovery</h4>
            <ul className="space-y-4 font-label-md text-label-md text-on-surface-variant font-semibold tracking-wide">
              <li><Link to="/events" className="hover:text-primary transition-colors opacity-60 hover:opacity-100">Live Grid</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors opacity-60 hover:opacity-100">Protocol Briefing</Link></li>
              <li><Link to="/apply-exhibitor" className="hover:text-primary transition-colors opacity-60 hover:opacity-100">Initialize Partner</Link></li>
            </ul>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-on-surface font-bold text-[10px] tracking-wide mb-8">System Access</h4>
            <ul className="space-y-4 font-label-md text-label-md text-on-surface-variant font-semibold tracking-wide">
              <li><Link to="/login" className="hover:text-primary transition-colors opacity-60 hover:opacity-100">Identity Login</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors opacity-60 hover:opacity-100">New Registration</Link></li>
              <li><Link to="/forgot-password" className="hover:text-primary transition-colors opacity-60 hover:opacity-100">Key Recovery</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-outline-variant/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-gutter">
          <p className="text-on-surface-variant text-[10px] font-semibold tracking-wide opacity-40">
            &copy; {new Date().getFullYear()} EVENTSPHERE. Neural Grid Architecture v4.0
          </p>
          <div className="flex items-center gap-10">
            <span className="text-on-surface-variant text-[10px] font-semibold tracking-wide flex items-center gap-3">
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

