import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';
import { Users, Layers, Zap, Award, Info, Target, ArrowRight } from 'lucide-react';

const Counter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration: 2.5,
        ease: "circOut",
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

export default function About() {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">

      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-50/40 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">

          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-8">
              <Target size={14} className="text-orange-600" />
              <span className="text-xs font-black text-orange-600 uppercase tracking-widest">
                Our Mission
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Empowering the <br />
              <span className="text-orange-600">Next Generation</span>
            </h2>

            <div className="space-y-6 text-slate-500 text-lg leading-relaxed font-medium">
              <p>
                SwadeshIntern is more than just a platform; it's a bridge between academic learning and real-world industry experience. Many students graduate with strong theoretical knowledge but lack the <strong className="text-slate-900">practical skills</strong> employers actually look for.
              </p>
              <p>
                Our mission is to change that. Through rigorous, project-based internships across multiple in-demand domains including <span className="text-slate-700 font-semibold">AI, Web Development and Cyber Security</span>. we help students transform into confident, industry-ready professionals.
              </p>
              <p>
                We believe in "Learning by Doing." At SwadeshIntern, interns don’t just watch tutorials they build, deploy, and ship real-world projects that matter.
              </p>
            </div>

            <div className="mt-10">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdVpRYTEB3hbBzBGGw72zLU_DXJkdf5rBApA8DfiuRuumHEVQ/viewform"
                target="_blank"
                rel="noreferrer"
                aria-label="Apply for internship program"
                className="group relative inline-flex items-center justify-center gap-3 h-14 px-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40"
              >
                Apply for Internship
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow group">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors duration-300">
                <Users size={24} className="text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-1">
                <Counter value={500} suffix="+" />
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Learners Upskilled</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow group translate-y-8 md:translate-y-0">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                <Layers size={24} className="text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-1">
                <Counter value={10} suffix="+" />
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tech Domains</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow group">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors duration-300">
                <Zap size={24} className="text-green-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-1">
                <Counter value={24} suffix="/7" />
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mentor Support</p>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:shadow-xl transition-shadow group translate-y-8 md:translate-y-0">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors duration-300">
                <Award size={24} className="text-purple-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-1">
                <Counter value={100} suffix="%" />
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Practical Learning</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}