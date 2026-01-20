import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CheckCircle2, ShieldAlert, Award, 
  Calendar, Hash, UserCircle, Briefcase, 
  ShieldCheck, FileCheck, Info
} from 'lucide-react';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [certId, setCertId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => { if (certId) handleVerify(); }, []);

  const handleVerify = async () => {
    if (!certId) return;
    setLoading(true);
    setStatus('idle');
    try {
      const docSnap = await getDoc(doc(db, "certificates", certId.trim().toUpperCase()));
      if (docSnap.exists()) {
        setResult(docSnap.data());
        setStatus('success');
      } else {
        setResult(null);
        setStatus('error');
      }
    } catch (err) { 
      setStatus('error'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <header className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-8 shadow-sm"
          >
            <ShieldCheck size={16} className="text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Official Verification Portal</span>
          </motion.div>
          
          <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">
            Validate <span className="text-orange-500">Credentials.</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Verify the authenticity of internship completion certificates issued by 
            <span className="font-bold text-slate-900"> SwadeshIntern</span> via our encrypted database.
          </p>
        </header>
        
        <div className="relative mb-20 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-[3rem] blur opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
          <div className="relative flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <input 
                className="w-full p-6 pl-16 bg-white border border-slate-200 rounded-[2.5rem] outline-none font-bold text-lg shadow-xl shadow-slate-200/50 focus:border-orange-500 transition-all" 
                placeholder="Enter Certificate Serial (e.g. SI-2026-XXXXX)"
                value={certId} 
                onChange={e => setCertId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>
            <button 
              onClick={handleVerify} 
              disabled={loading}
              className="bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black hover:bg-orange-600 transition-all active:scale-95 shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? "AUTHENTICATING..." : "VERIFY RECORD"}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' && result && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100"
            >
              <div className="bg-slate-900 p-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 rotate-3">
                     <FileCheck size={32} />
                   </div>
                   <div className="text-center md:text-left">
                     <h3 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">Record Authenticated</h3>
                     <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Database Match Found</p>
                     </div>
                   </div>
                </div>
                <img src="/swadeshintern.jpg" className="w-16 h-16 rounded-2xl border-2 border-slate-800 shadow-xl" alt="SwadeshIntern Logo" />
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: "Full Name of Intern", value: result.studentName, icon: <UserCircle className="text-orange-500" />, primary: true },
                  { label: "Internship Domain", value: result.domain, icon: <Briefcase className="text-slate-400" /> },
                  { label: "Duration", value: result.duration, icon: <Calendar className="text-slate-400" /> },
                  { label: "Certificate ID", value: result.certId, icon: <Hash className="text-slate-400" /> },
                  { label: "Program Start", value: result.startDate, icon: <Calendar className="text-slate-400" /> },
                  { label: "Date of Issuance", value: result.awardDate, icon: <Calendar className="text-slate-400" /> }
                ].map((item, i) => (
                  <div key={item.label} className={`group`}>
                    <div className="flex items-center gap-2 mb-2">
                      {item.icon}
                      <span className="font-black text-slate-400 uppercase text-[9px] tracking-widest">{item.label}</span>
                    </div>
                    <div className={`text-xl font-black tracking-tight ${item.primary ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mx-10 mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                   <ShieldCheck size={24} className="text-orange-500" />
                </div>
                <p className="text-slate-400 text-[11px] font-bold leading-relaxed">
                  This document is an electronically generated record. Integrity is maintained via MSME-Udyam Verification Standards. 
                  Any alteration to this digital record is a violation of SwadeshIntern Terms of Service.
                </p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="p-16 bg-white rounded-[3.5rem] border border-red-50 shadow-2xl shadow-red-100/50 text-center"
            >
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12">
                <ShieldAlert size={48} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Record Not Found</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                The serial number <span className="text-red-500 font-bold">{certId}</span> does not match our verified issuance logs. 
                Please ensure there are no typos.
              </p>
              <button 
                onClick={() => setCertId('')}
                className="mt-8 text-orange-500 font-black text-sm uppercase tracking-widest hover:underline"
              >
                Clear and Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-12 text-center">
           <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
              <Info size={14} />
              <span className="text-xs font-bold uppercase tracking-widest">Need Assistance?</span>
           </div>
           <p className="text-slate-400 text-sm">
             Contact our Registrar at <a href="mailto:hr@swadeshintern.com" className="text-orange-500 font-bold">hr@swadeshintern.com</a>
           </p>
        </div>
      </div>
    </div>
  );
}