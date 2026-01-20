import { useNavigate } from 'react-router-dom';
import { allInternships } from '../components/DomainsPage';
import { Layers, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function Domains() {
  const navigate = useNavigate();
  const homeDomains = allInternships ? allInternships.slice(0, 8) : [];

  return (
    <section id="domains" className="py-24 bg-white relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-orange-50/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-6">
            <Layers size={14} className="text-orange-600" />
            <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Specialized Tracks</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Explore Our <span className="text-orange-500">Internship Domains</span>
          </h2>
          
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Kickstart your career by working on industry-level projects. Choose a domain that matches your passion and start building real-world skills today.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {homeDomains.map((domain, i) => (
            <div 
              key={i} 
              className="group relative h-[22rem] rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 cursor-default"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                style={{backgroundImage: `url(${domain.img})`}} 
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
              
              <div className="relative h-full p-8 flex flex-col justify-between text-left text-white">
                
                <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors duration-300">
                  <domain.icon size={22} className="text-white" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-2 leading-tight">{domain.title}</h3>
                  <p className="text-sm text-slate-300 mb-6 line-clamp-2 font-medium">{domain.desc}</p>
                  
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSdVpRYTEB3hbBzBGGw72zLU_DXJkdf5rBApA8DfiuRuumHEVQ/viewform" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-md group-hover:shadow-orange-500/25"
                  >
                    Apply Now <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => navigate('/domains')}
            className="group inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-slate-200 hover:bg-orange-500 hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300"
          >
            Explore All Internship Tracks
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
}