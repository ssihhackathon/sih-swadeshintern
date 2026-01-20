import { motion } from 'framer-motion';
import { 
  Globe, Smartphone, Database, Coffee, Terminal, 
  Code2, Palette, BrainCircuit, Cpu, Rocket, AppWindow, 
  FileJson, CheckCircle2, Award, BookOpen, Briefcase, Zap, Container, ShieldCheck 
} from 'lucide-react';

export const allInternships = [
  { 
    id: 1, 
    title: 'Web Development', 
    icon: Globe, 
    img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600', 
    desc: 'Master modern frontend and backend frameworks through project-based learning.'
  },
  { 
    id: 2, 
    title: 'Android Development', 
    icon: Smartphone, 
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600', 
    desc: 'Build native mobile applications that solve real-world problems using Java/Kotlin.'
  },
  { 
    id: 3, 
    title: 'Data Science', 
    icon: Database, 
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600', 
    desc: 'Deep dive into big data, statistical analysis, and predictive modeling techniques.'
  },
  { 
    id: 4, 
    title: 'Java Programming', 
    icon: Coffee, 
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600', 
    desc: 'Develop robust, scalable enterprise-level applications with Java architecture.'
  },
  { 
    id: 5, 
    title: 'C++ Programming', 
    icon: Terminal, 
    img: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600', 
    desc: 'Master system-level programming and high-performance algorithmic logic.'
  },
  { 
    id: 6, 
    title: 'Python Programming', 
    icon: Code2, 
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600', 
    desc: 'Harness the most versatile language for automation, scripting, and backend systems.'
  },
  { 
    id: 7, 
    title: 'UI/UX Design', 
    icon: Palette, 
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600', 
    desc: 'Design intuitive and aesthetic user interfaces with modern tools and psychology.'
  },
  { 
    id: 8, 
    title: 'Artificial Intelligence', 
    icon: BrainCircuit, 
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600', 
    desc: 'Explore neural networks and machine learning algorithms to build the future.'
  },
  { 
    id: 9, 
    title: 'Machine Learning', 
    icon: Cpu, 
    img: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?q=80&w=600', 
    desc: 'Focus on algorithmic training, model deployment, and automated pattern recognition.'
  },
  { 
    id: 10, 
    title: 'Flutter Developer', 
    icon: Rocket, 
    img: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=600', 
    desc: 'Build high-performance cross-platform apps with a single codebase using Dart.'
  },
  { 
    id: 11, 
    title: 'ReactJS Developer', 
    icon: AppWindow, 
    img: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600', 
    desc: 'Specialize in modern component-based UI development and state management.'
  },
  { 
    id: 12, 
    title: 'DevOps Engineering',
    icon: Container,
    img: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=600',
    desc: 'Master CI/CD pipelines, containerization with Docker/Kubernetes, and cloud infrastructure automation.'
  }
];

export default function DomainsPage() {
  return (
    <div className="pt-28 pb-24 bg-white min-h-screen relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-blue-50/30 rounded-full blur-3xl -translate-x-1/4 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
             <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-6">
                <Briefcase size={14} className="text-orange-600" />
                <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Career Tracks</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Choose Your <span className="text-orange-500">Specialization</span>
            </h1>
            <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              Our internship programs are more than just a certificate. They are rigorous, hands-on journeys designed to make you job-ready.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {[
              { icon: BookOpen, title: "Project-Based", desc: "Build real applications, not just theory.", color: "orange" },
              { icon: Briefcase, title: "Industry Standard", desc: "Use professional tools & Git workflows.", color: "blue" },
              { icon: ShieldCheck, title: "MSME Certified", desc: "Government recognized certification.", color: "green" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] border border-slate-100 hover:border-orange-100 transition-colors">
                <div className={`w-12 h-12 bg-${feature.color}-50 text-${feature.color}-500 rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-24">
          {allInternships.map((domain) => (
            <motion.div 
              key={domain.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-orange-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={domain.img} alt={domain.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              <div className="p-7 flex-grow flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                        <domain.icon size={24} className="text-slate-700 group-hover:text-orange-500" />
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{domain.title}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium line-clamp-3">{domain.desc}</p>
                
                <div className="mt-auto pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 uppercase tracking-wider mb-4">
                    <CheckCircle2 size={14} className="fill-green-100" />
                    <span>Verified Track</span>
                  </div>
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdVpRYTEB3hbBzBGGw72zLU_DXJkdf5rBApA8DfiuRuumHEVQ/viewform" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-orange-500 transition-all shadow-lg shadow-slate-200 group-hover:shadow-orange-200"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 md:p-20 text-center">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-1.5 rounded-full mb-8">
                    <Award size={16} className="text-orange-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Get Certified</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
                    Boost Your Resume with <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">MSME Certification</span>
                </h2>
                
                <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                    Every successful intern receives a unique, verifiable certificate ID recognized by the Government of India. Stand out to recruiters with validated experience.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                     <a href="https://docs.google.com/forms/d/e/1FAIpQLSdVpRYTEB3hbBzBGGw72zLU_DXJkdf5rBApA8DfiuRuumHEVQ/viewform" target="_blank" className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-orange-500 hover:text-white transition-all shadow-xl">
                        Start Your Journey
                     </a>
                     <div className="flex items-center gap-2 text-slate-400 text-sm font-medium px-4">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Lifetime Validity</span>
                     </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}