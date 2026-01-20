import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Briefcase, X, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function HiringPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  useEffect(() => {
    if (location.pathname !== '/') return;

    const showTimer = setTimeout(() => {
      if (!hasBeenDismissed) setIsVisible(true);
    }, 2000);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname, hasBeenDismissed]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous + 10) {
      setIsVisible(false);
    } else if (latest < previous - 10 && !hasBeenDismissed) {
      if (location.pathname === '/') setIsVisible(true);
    }
  });

  if (location.pathname !== '/') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed z-[40] top-24 left-4 right-4 md:left-auto md:right-6 md:w-auto cursor-pointer"
          onClick={() => navigate('/careers')}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 flex items-center gap-4 relative group hover:border-orange-200 transition-colors max-w-md mx-auto">
            <div className="bg-orange-50 p-3 rounded-xl text-orange-600 shrink-0">
              <Briefcase size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col flex-1 min-w-0 pr-6">
              <h4 className="text-sm font-black text-slate-900 leading-tight mb-0.5">We're Hiring!</h4>
              <p className="text-xs font-medium text-slate-500 leading-relaxed truncate">
                Join our Core Team & build the future.
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                View Openings <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                setHasBeenDismissed(true);
              }} 
              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}