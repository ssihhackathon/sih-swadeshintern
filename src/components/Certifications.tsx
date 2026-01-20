import { CheckCircle2, Award, ShieldCheck } from 'lucide-react';

export default function Certifications() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-50/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 items-center gap-20">
            
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-1.5 rounded-full mb-8">
                <ShieldCheck size={14} className="fill-green-500 text-green-500" />
                <span className="text-xs font-black text-green-700 uppercase tracking-widest">Officially Certified</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                Government <span className="text-orange-600">Recognized</span>
              </h2>
              
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                SwadeshIntern is officially registered as a <span className="text-slate-900 font-bold">Micro, Small & Medium Enterprise (MSME)</span> under the Government of India. This registration confirms the organization’s legal existence and recognition as a registered business entity.
              </p>

              <div className="space-y-4">
                {[
                  "Government Registered Enterprise",
                  "MSME (Udyam) Recognized Organization",
                  "Verifiable for Institutional & Background Checks"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-slate-100 hover:border-orange-100 hover:bg-orange-50/30 transition-all group cursor-default">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="text-green-500" size={20} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm md:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end items-center py-10">
              
              <div className="relative w-full max-w-[500px]">
                <div className="absolute inset-0 bg-slate-100/80 rounded-[3rem] transform translate-x-5 translate-y-5 -z-10"></div>

                <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] border border-slate-100 text-center relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-8 py-3 rounded-bl-3xl shadow-sm">
                    <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={16} fill="currentColor" /> Verified
                    </span>
                  </div>

                  <div className="mb-10 mt-4">
                      <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-sm">
                          <Award size={48} className="text-orange-600" />
                      </div>
                      <img
                        src="/image.png"
                        alt="MSME Certified Logo"
                        width="192" 
                        height="192"
                        loading="lazy"
                        className="h-48 w-auto object-contain mx-auto p-4 hover:scale-105 transition-transform duration-500"
                      />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-wide">MSME Registered</h3>
                    <div className="w-12 h-1 bg-orange-200 mx-auto my-4 rounded-full"></div>
                    <p className="text-sm font-bold text-slate-400 tracking-[0.25em] uppercase">
                      Government of India
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}