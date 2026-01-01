import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  AlertTriangle,
  Home,
  Ghost,
  Compass,
  ArrowLeft,
  ShieldAlert,
  Search
} from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "Neural Link Failure: User attempted to access non-existent coordinate:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full px-8 text-center animate-in fade-in zoom-in-95 duration-700">
        {/* Error Icon */}
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-primary group overflow-hidden">
            <Compass size={48} className="animate-spin-slow group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-50" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-2">
            <ShieldAlert size={12} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Protocol Error 404</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Neural Link Severed</h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
            The coordinates <code className="text-primary bg-primary/5 px-2 py-0.5 rounded-md">{location.pathname}</code> do not exist within our current architecture.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="w-full py-4 bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Home size={16} /> Re-establish Home Link
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft size={16} /> Return to Last Node
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-center gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <Search size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest italic">Scanning for new routes...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
