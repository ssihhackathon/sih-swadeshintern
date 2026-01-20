import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle } from 'lucide-react';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [certId, setCertId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { if (certId) handleVerify(); }, []);

  const handleVerify = async () => {
    if (!certId) return;
    setLoading(true);
    setNotFound(false);
    try {
      const docSnap = await getDoc(doc(db, "certificates", certId));
      if (docSnap.exists()) setResult(docSnap.data());
      else { setResult(null); setNotFound(true); }
    } catch (err) { setNotFound(true); }
    setLoading(false);
  };

  return (
    <div className="pt-32 pb-24 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 max-w-2xl text-center">
        <h1 className="text-5xl font-black text-gray-900 mb-10 tracking-tighter">
          Verify <span className="text-orange-500">Authenticity</span>
        </h1>
        
        <div className="relative mb-12 shadow-2xl rounded-3xl overflow-hidden">
          <input 
            className="w-full p-6 pl-14 bg-white border-none outline-none font-black text-lg" 
            placeholder="Enter Certificate No. (e.g. SI-2026-ABCD)"
            value={certId} 
            onChange={e => setCertId(e.target.value)} 
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <button onClick={handleVerify} className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-orange-600 transition-all">
            {loading ? "Checking..." : "Verify"}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 text-left">
              <div className="bg-green-50 p-6 flex items-center gap-3 border-b border-green-100">
                <CheckCircle className="text-green-600" size={28} />
                <span className="text-green-700 font-black text-xl uppercase tracking-tight">Verified Document</span>
              </div>
              {[
                ["Student Name", result.studentName],
                ["Domain", result.domain],
                ["Duration", result.duration],
                ["Certification No", result.certId],
                ["Starting Date", result.startDate],
                ["Award Date", result.awardDate]
              ].map(([label, value], i) => (
                <div key={label} className={`p-6 flex justify-between items-center ${i % 2 !== 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100 last:border-0`}>
                  <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">{label}</span>
                  <span className="font-black text-gray-900 text-lg">{value}</span>
                </div>
              ))}
            </motion.div>
          )}

          {notFound && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-red-50 rounded-3xl border border-red-100 flex flex-col items-center">
              <XCircle className="text-red-500 mb-4" size={48} />
              <h3 className="text-xl font-black text-red-900">Certificate Not Found</h3>
              <p className="text-red-700 font-bold">Please check the ID and try again.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}