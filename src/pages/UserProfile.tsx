import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function UserProfile() {
  const [apps, setApps] = useState<any[]>([]);
  
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "user_applications"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        setApps(snap.docs.map(d => d.data()));
      }
    });
  }, []);

  return (
    <div className="pt-32 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">My Applications</h1>
      <div className="space-y-4">
        {apps.map((app, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 flex justify-between">
             <div>
               <h3 className="font-bold text-slate-900">{app.jobTitle}</h3>
               <p className="text-sm text-slate-500">{app.company}</p>
             </div>
             <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-black h-fit">Applied</span>
          </div>
        ))}
      </div>
    </div>
  )
}