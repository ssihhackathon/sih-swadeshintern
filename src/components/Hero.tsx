import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';

const Counter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = `${Math.floor(latest)}${suffix}`;
          }
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value, motionValue, suffix]);

  return <span ref={ref} />;
};

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 pt-20">
      <div className="container mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full mb-6"
            >
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-sm font-semibold">Open Source Internships</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Launch Your{' '}
              <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 bg-clip-text text-transparent">
                Tech Career
              </span>{' '}
              Today
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              Join SwadeshIntern and gain hands-on experience in cutting-edge technologies.
              We connect talented individuals with exciting internship opportunities across multiple domains.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdVpRYTEB3hbBzBGGw72zLU_DXJkdf5rBApA8DfiuRuumHEVQ/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Apply for Internship
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </a>

              <button
                onClick={() => document.getElementById('domains')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gray-700 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-orange-500 hover:text-orange-500 transition-all"
              >
                Explore Domains
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-12 flex flex-wrap gap-12 justify-center lg:justify-start"
            >
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-orange-500 mb-1">
                  <Counter value={500} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">Interns Placed</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-orange-500 mb-1">
                  <Counter value={50} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">Partner Companies</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-bold text-orange-500 mb-1">
                  <Counter value={10} suffix="+" />
                </div>
                <div className="text-gray-600 font-medium">Tech Domains</div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-green-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <img
                src="/swadeshintern.jpg"
                alt="SwadeshIntern"
                className="relative h-64 w-64 lg:h-96 lg:w-96 rounded-full shadow-2xl object-cover ring-8 ring-white"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}