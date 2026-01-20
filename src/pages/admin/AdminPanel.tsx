import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, firebaseConfig } from '../../firebase'; 
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, 
  createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, 
  EmailAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, query, orderBy, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { 
  LogOut, ShieldCheck, Database, Briefcase, Users, Loader2, UserPlus, 
  Settings, Lock, Ban, CheckCircle, Mail, FileText, 
  UploadCloud, X, AlertTriangle, Download, Power, ChevronRight, 
  Trash2, LayoutDashboard, Calendar, GraduationCap, Link as LinkIcon, Search, MapPin, DollarSign,
  PlusCircle, FileCheck, ExternalLink, Zap, Globe, Info, Eye
} from 'lucide-react';

const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; 
const SUPER_ADMINS: string[] = [];

const getRelativeTime = (dateString: string) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(); 
};

const REGEX = {
  NAME: /^[a-zA-Z\s]+$/, 
  SAFE_TEXT: /^[a-zA-Z0-9\s.,'()-]+$/, 
  PHONE: /^[0-9]{10,15}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};


const Toast = ({ msg, onClose }: { msg: { type: string, text: string, duration?: number } | null, onClose: () => void }) => {
  useEffect(() => { 
    if (msg) {
      const t = setTimeout(onClose, msg.duration || 4000); 
      return () => clearTimeout(t); 
    }
  }, [msg, onClose]);
  if (!msg) return <div />;
  return (
    <div className={`fixed top-6 right-6 z-[100] w-[90%] md:w-auto px-6 py-4 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex items-center gap-4 font-bold border animate-in slide-in-from-top-5 duration-300 ${msg.type === 'success' ? 'bg-white border-green-100 text-slate-800' : 'bg-white border-red-100 text-slate-800'}`}>
      <div className={`p-2 rounded-full ${msg.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {msg.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      </div>
      <span className="text-sm md:text-base">{msg.text}</span>
    </div>
  );
};

const Modal = ({ title, children, onClose, maxWidth = "max-w-4xl" }: { title: string, children: React.ReactNode, onClose: () => void, maxWidth?: string }) => (
  <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
    <div className={`bg-white rounded-[2.5rem] w-full ${maxWidth} max-h-[85vh] relative flex flex-col shadow-2xl animate-in zoom-in-95 duration-200`} onClick={e => e.stopPropagation()}>
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-[2.5rem]">
        <h3 className="font-black text-slate-900 text-xl">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: { isOpen: boolean, title: string, message: string, onConfirm: () => void, onCancel: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onCancel}>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24}/></div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 font-bold mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};

const DocViewerModal = ({ url, onClose }: { url: string, onClose: () => void }) => {
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-[2rem] w-full max-w-6xl h-[85vh] relative flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg"><Eye className="text-orange-500" size={20}/> Document Preview</h3>
          <div className="flex gap-2">
             <button onClick={() => window.open(url, '_blank')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors">Open Original</button>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
          </div>
        </div>
        <div className="flex-1 bg-slate-100 relative">
          <iframe src={viewerUrl} className="w-full h-full" title="Document" frameBorder="0" />
        </div>
      </div>
    </div>
  );
};

export default function AdminPanel() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ name: 'Admin', photo: '' });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [activeView, setActiveView] = useState(() => localStorage.getItem('adminView') || 'DASHBOARD');
  const [subView, setSubView] = useState<'LISTINGS' | 'APPLICANTS'>('LISTINGS');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: string, text: string, duration?: number } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({ coreApps: 0, extApps: 0, coreJobs: 0, extJobs: 0, users: 0, certs: 0 });

  const [certData, setCertData] = useState({ studentName: '', domain: 'Web Development', duration: '1 Month', startDate: '', awardDate: '' });
  const [generatedID, setGeneratedID] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  
  const [jobForm, setJobForm] = useState({
    title: '', companyName: '', location: 'Remote', type: 'Full Time',
    stipend: '', skills: '', website: '', description: '', companyOverview: '',
    responsibilities: '', applyMethod: 'PLATFORM', externalLink: ''
  });

  const [applicants, setApplicants] = useState<any[]>([]);
  const [activeJobsList, setActiveJobsList] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [viewDocUrl, setViewDocUrl] = useState<string | null>(null);
  
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean, title: string, msg: string, action: () => void }>({ isOpen: false, title: '', msg: '', action: () => {} });

  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [passChange, setPassChange] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => { localStorage.setItem('adminView', activeView); setSearchTerm(''); setSelectedApp(null); setSelectedJob(null); setSubView('LISTINGS'); }, [activeView]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docSnap = await getDoc(doc(db, "admins", currentUser.uid));
        if (docSnap.exists()) {
          setUser(currentUser);
          setIsAdmin(true);
          const data = docSnap.data();
          setAdminProfile({ name: data.name || "Admin", photo: data.photo || "" });
          setIsSuperAdmin(SUPER_ADMINS.includes(currentUser.email || "") || data.role === 'SUPER_ADMIN');
          const settingsSnap = await getDoc(doc(db, "settings", "system"));
          if (settingsSnap.exists()) setMaintenance(settingsSnap.data().maintenanceMode);
        } else {
          await signOut(auth);
          setLoginError("Access Denied.");
          setUser(null); setIsAdmin(false);
        }
      } else { 
        setUser(null); setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const showToast = (type: 'success' | 'error', text: string, duration?: number) => setToast({ type, text, duration });

  useEffect(() => {
    if (!user || !isAdmin) return;

    if (activeView === 'INTERNAL') {
      const unsubApp = onSnapshot(query(collection(db, "applications"), orderBy("appliedAt", "desc")), (snap) => {
        setApplicants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubJobs = onSnapshot(query(collection(db, "hiring"), orderBy("postedAt", "desc")), (snap) => {
        setActiveJobsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => { unsubApp(); unsubJobs(); };
    }

    if (activeView === 'EXTERNAL') {
      const unsubJobs = onSnapshot(query(collection(db, "external_jobs"), orderBy("postedAt", "desc")), (snap) => {
        setActiveJobsList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      const unsubApp = onSnapshot(query(collection(db, "user_applications"), orderBy("appliedAt", "desc")), (snap) => {
        setApplicants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => { unsubJobs(); unsubApp(); };
    }

    if (activeView === 'USERS' && isSuperAdmin) fetchAdmins();

    if (activeView === 'DASHBOARD') {
      const fetchStats = async () => {
        const appsSnap = await getDocs(collection(db, "applications"));
        const extAppsSnap = await getDocs(collection(db, "user_applications"));
        const jobsSnap = await getDocs(collection(db, "hiring"));
        const extSnap = await getDocs(collection(db, "external_jobs"));
        const adminsSnap = await getDocs(collection(db, "admins"));
        const certsSnap = await getDocs(collection(db, "certificates"));
        
        setStats({
          coreApps: appsSnap.size,
          extApps: extAppsSnap.size,
          coreJobs: jobsSnap.size,
          extJobs: extSnap.size,
          users: adminsSnap.size,
          certs: certsSnap.size
        });
      };
      fetchStats();
    }
  }, [activeView, user, isSuperAdmin, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setLoginError('');
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch { setLoginError("Invalid email or password."); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth); localStorage.removeItem('adminView'); navigate('/'); 
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!REGEX.NAME.test(certData.studentName)) {
      return showToast('error', "Invalid Name: Alphabets only (No symbols/numbers)");
    }
    const yearShort = new Date().getFullYear().toString().slice(-2);
    const newID = `SI-${yearShort}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    setGeneratedID(newID);
    try {
      await setDoc(doc(db, "certificates", newID), { ...certData, certId: newID, verified: true, issuedBy: user.email, createdAt: new Date().toISOString() });
      showToast('success', `Certificate Generated: ${newID}`, 1000); 
    } catch { showToast('error', "Error saving certificate."); }
  };

  const exportCertData = async () => {
    showToast('success', "Downloading CSV...");
    try {
      const snap = await getDocs(collection(db, "certificates"));
      const csvRows = [["ID", "Name", "Domain", "Start", "End"]];
      snap.forEach(doc => { const d = doc.data(); csvRows.push([d.certId, d.studentName, d.domain, d.startDate, d.awardDate]); });
      const link = document.createElement("a");
      link.href = encodeURI("data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n"));
      link.download = `Swadesh_Interns.csv`;
      document.body.appendChild(link); link.click();
    } catch { showToast('error', "Export failed."); }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!REGEX.SAFE_TEXT.test(jobForm.title)) return showToast('error', "Job Title contains invalid characters.");
    if (!REGEX.SAFE_TEXT.test(jobForm.location)) return showToast('error', "Location contains invalid characters.");
    if (activeView === 'EXTERNAL' && !REGEX.SAFE_TEXT.test(jobForm.companyName)) return showToast('error', "Company Name contains invalid characters.");

    setLoading(true);
    const collectionName = activeView === 'EXTERNAL' ? 'external_jobs' : 'hiring';
    try {
      const skillArray = jobForm.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      await addDoc(collection(db, collectionName), {
        ...jobForm, 
        companyName: activeView === 'INTERNAL' ? 'SwadeshIntern' : jobForm.companyName,
        skills: skillArray,
        postedBy: user.email, 
        postedAt: new Date().toISOString(), 
        isExternal: activeView === 'EXTERNAL'
      });
      showToast('success', "Opportunity Published!");
      setJobForm({
        title: '', companyName: '', location: 'Remote', type: 'Full Time',
        stipend: '', skills: '', website: '', description: '', companyOverview: '',
        responsibilities: '', applyMethod: 'PLATFORM', externalLink: ''
      });
    } catch { showToast('error', "Failed to post."); }
    setLoading(false);
  };

  const triggerDeleteJob = (id: string) => {
    setConfirmData({
      isOpen: true,
      title: "Delete Job?",
      msg: "This action cannot be undone. The listing will be removed immediately.",
      action: () => deleteJob(id)
    });
  };

  const deleteJob = async (id: string) => {
    const collectionName = activeView === 'EXTERNAL' ? 'external_jobs' : 'hiring';
    try {
      await deleteDoc(doc(db, collectionName, id));
      showToast('success', "Job deleted.");
      if (selectedJob?.id === id) setSelectedJob(null);
    } catch { showToast('error', "Failed to delete."); }
    setConfirmData({ ...confirmData, isOpen: false });
  }

  const handleDownloadResume = (url: string) => {
    if (!url) return showToast('error', "No resume URL found.");
    window.open(url, '_blank');
  };

  const createAdminWithoutLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!REGEX.NAME.test(newAdmin.name)) return showToast('error', "Name must be alphabets only.");
    
    setLoading(true);
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);
    try {
      const cred = await createUserWithEmailAndPassword(secondaryAuth, newAdmin.email, newAdmin.password);
      await setDoc(doc(db, "admins", cred.user.uid), { 
        name: newAdmin.name, 
        email: newAdmin.email, 
        role: 'ADMIN', 
        isActive: true, 
        createdBy: user.email 
      });
      showToast('success', `Admin Created Successfully!`);
      setNewAdmin({ name: '', email: '', password: '' });
      fetchAdmins();
    } catch (err: any) { showToast('error', err.message); }
    setLoading(false);
  };

  const triggerDeleteAdmin = (id: string) => {
    setConfirmData({
      isOpen: true,
      title: "Remove Admin?",
      msg: "This user will lose all access immediately.",
      action: () => deleteAdmin(id)
    });
  };

  const deleteAdmin = async (adminId: string) => {
    try { await deleteDoc(doc(db, "admins", adminId)); fetchAdmins(); showToast('success', "Admin deleted."); } 
    catch { showToast('error', "Deletion failed."); }
    setConfirmData({ ...confirmData, isOpen: false });
  };

  const toggleMaintenance = async () => {
    try {
      await setDoc(doc(db, "settings", "system"), { maintenanceMode: !maintenance }, { merge: true });
      setMaintenance(!maintenance);
      showToast('success', `Maintenance ${!maintenance ? 'Enabled' : 'Disabled'}`);
    } catch { showToast('error', "Failed to update settings."); }
  };

  const fetchAdmins = async () => { const snap = await getDocs(collection(db, "admins")); setAdminsList(snap.docs.map(d => ({ id: d.id, ...d.data() }))); };

  const handleProfileUpdate = async (file: File) => {
    setLoading(true);
    const formData = new FormData(); formData.append("file", file); formData.append("upload_preset", CLOUDINARY_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
      const data = await res.json();
      await updateDoc(doc(db, "admins", user.uid), { photo: data.secure_url });
      setAdminProfile({ ...adminProfile, photo: data.secure_url });
      showToast('success', "Profile Photo Updated!");
    } catch { showToast('error', "Upload failed."); }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passChange.new !== passChange.confirm) return showToast('error', "Passwords do not match!");
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, passChange.old);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, passChange.new);
      showToast('success', "Password Changed!");
      setPassChange({ old: '', new: '', confirm: '' });
    } catch { showToast('error', "Incorrect Old Password."); }
    setLoading(false);
  };

  const filteredApplicants = applicants.filter(app => 
    (app.applicantName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (app.jobTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredJobs = activeJobsList.filter(job => 
    (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (!user || !isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-5xl overflow-hidden grid md:grid-cols-5 min-h-[600px]">
        <div className="md:col-span-2 bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-12 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
             <img src="/swadeshinternn.png" alt="Logo" className="w-24 h-24 object-contain mb-6 drop-shadow-lg" />
             <h2 className="text-3xl font-black tracking-tight mb-2">SwadeshIntern</h2>
             <p className="text-slate-300 font-medium text-xs uppercase tracking-[0.2em]">ControlHub Access</p>
          </div>
        </div>
        <div className="md:col-span-3 p-10 md:p-16 flex flex-col justify-center bg-white relative">
           <div className="max-w-md mx-auto w-full">
               <div className="mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h3>
                  <p className="text-slate-500 mt-2 font-medium">Please enter your credentials.</p>
               </div>
               {loginError && <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold animate-pulse"><AlertTriangle size={18} /> {loginError}</div>}
               <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-100 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-slate-900" placeholder="admin@email.com"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-orange-100 focus:bg-white focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-slate-900" placeholder="••••••••"/>
                  </div>
                  <button disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/10 active:scale-95 flex justify-center items-center gap-2 text-sm">{loading ? <Loader2 className="animate-spin" /> : "Secure Login"}</button>
               </form>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Toast msg={toast} onClose={() => setToast(null)} />
      
      <ConfirmModal isOpen={confirmData.isOpen} title={confirmData.title} message={confirmData.msg} onConfirm={confirmData.action} onCancel={() => setConfirmData({ ...confirmData, isOpen: false })} />
      
      {viewDocUrl && <DocViewerModal url={viewDocUrl} onClose={() => setViewDocUrl(null)} />}

      {selectedJob && (
        <Modal title="Job Details" onClose={() => setSelectedJob(null)}>
           <div className="space-y-6">
              <div className="flex justify-between items-start">
                 <div>
                   <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{selectedJob.type}</span>
                   <h2 className="text-3xl font-black text-slate-900 mt-3 break-words">{selectedJob.title}</h2>
                   <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wide">{selectedJob.companyName} • {getRelativeTime(selectedJob.postedAt)}</p>
                 </div>
                 {selectedJob.applyMethod === 'EXTERNAL' && selectedJob.externalLink && (
                   <a href={selectedJob.externalLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-500 transition-colors">
                     External Link <LinkIcon size={12}/>
                   </a>
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm"><MapPin size={20}/></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Location</p><p className="font-bold text-slate-900 break-words">{selectedJob.location}</p></div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-500 shadow-sm"><DollarSign size={20}/></div>
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">Stipend / Salary</p><p className="font-bold text-slate-900 break-words">{selectedJob.stipend || 'Unpaid / Not Disclosed'}</p></div>
                 </div>
              </div>

              {selectedJob.companyOverview && (
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                   <h4 className="font-black text-blue-900 mb-2 text-sm flex items-center gap-2"><Info size={16}/> Company Overview</h4>
                   <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap break-words">{selectedJob.companyOverview}</p>
                   {selectedJob.website && (
                     <a href={selectedJob.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                       <Globe size={12}/> Visit Website
                     </a>
                   )}
                </div>
              )}

              <div>
                 <h4 className="font-black text-slate-900 mb-2 text-sm">Description</h4>
                 <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words bg-white border border-slate-100 p-4 rounded-2xl">{selectedJob.description}</p>
              </div>

              <div>
                 <h4 className="font-black text-slate-900 mb-2 text-sm">Key Responsibilities</h4>
                 <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words bg-white border border-slate-100 p-4 rounded-2xl">{selectedJob.responsibilities || "Not specified."}</p>
              </div>
              
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                 <div>
                   <h4 className="font-black text-slate-900 mb-2 text-sm">Skills Required</h4>
                   <div className="flex flex-wrap gap-2">
                     {selectedJob.skills.map((s: string, i: number) => <span key={i} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">{s}</span>)}
                   </div>
                 </div>
              )}
           </div>
        </Modal>
      )}

      {selectedApp && (
        <Modal title="Applicant Profile" onClose={() => setSelectedApp(null)}>
           <div className="space-y-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl">{(selectedApp.applicantName || "C").charAt(0)}</div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedApp.applicantName || "Unknown"}</h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Role: <span className="text-orange-600">{selectedApp.jobTitle}</span></p>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button 
                   onClick={() => setViewDocUrl(selectedApp.resumeUrl)} 
                   className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
                 >
                   <Eye size={16}/> View Resume
                 </button>
                 <button 
                   onClick={() => handleDownloadResume(selectedApp.resumeUrl)} 
                   className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 hover:shadow-lg transition-all"
                 >
                   <Download size={16}/> Download
                 </button>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Mail size={14}/> Contact Details</p>
                 <p className="font-bold text-slate-900 text-lg mb-1">{selectedApp.applicantEmail}</p>
                 <p className="font-medium text-slate-500">{selectedApp.applicantPhone}</p>
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">
                 <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><GraduationCap size={16}/> Education</p>
                 <p className="font-bold text-slate-900 text-lg">{selectedApp.degree} • {selectedApp.stream}</p>
                 <p className="font-medium text-slate-500 mt-1">{selectedApp.college} ({selectedApp.gradYear})</p>
               </div>
             </div>

             <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">Professional Profile</p>
                  {selectedApp.linkedinProfile && (
                    <a href={selectedApp.linkedinProfile} target="_blank" rel="noreferrer" className="bg-[#0077b5] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all">
                      <LinkIcon size={12} className="stroke-white"/> LinkedIn Profile
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedApp.skills ? selectedApp.skills.split(',').map((s: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200">{s.trim()}</span>
                    )) : <span className="text-sm text-slate-400 italic">No specific skills listed.</span>}
                </div>
             </div>
           </div>
        </Modal>
      )}

      <div className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-slate-200/60 py-4 px-4 md:px-8 mb-8 transition-all">
        <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-orange-500 font-black uppercase text-[10px] tracking-[0.3em]">
              <ShieldCheck size={14} /> {isSuperAdmin ? 'Super Admin' : 'Administrator'}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
               {activeView === 'DASHBOARD' ? 'Overview' : activeView === 'CERTIFICATES' ? 'Credential Manager' : activeView === 'INTERNAL' ? 'Talent Manager' : activeView === 'EXTERNAL' ? 'Job Board' : activeView === 'USERS' ? 'Admin Access' : 'My Account'}
            </h1>
          </div>
          
          <div className="w-full xl:w-auto flex gap-3 items-center overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              {[
                { id: 'DASHBOARD', label: 'Home', icon: LayoutDashboard },
                { id: 'CERTIFICATES', label: 'Certs', icon: Database },
                { id: 'INTERNAL', label: 'Core', icon: Briefcase },
                { id: 'EXTERNAL', label: 'Jobs', icon: Users },
                ...(isSuperAdmin ? [{ id: 'USERS', label: 'Admins', icon: UserPlus }] : []),
                { id: 'SETTINGS', label: 'Account', icon: Settings }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveView(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all whitespace-nowrap ${activeView === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                  <tab.icon size={14} className="hidden md:block"/> {tab.label}
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="bg-white border-2 border-red-50 text-red-500 p-3.5 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm shrink-0" title="Logout">
              <LogOut size={20}/>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-[1920px] mx-auto">
        
        {activeView === 'DASHBOARD' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
              <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Job Board Applications</p><h3 className="text-4xl font-black text-slate-900 mt-2">{stats.extApps}</h3></div>
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={32}/></div>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
              <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Job Posts</p><h3 className="text-4xl font-black text-slate-900 mt-2">{stats.extJobs + stats.coreJobs}</h3></div>
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Briefcase size={32}/></div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
               <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Core Team Applications</p><h3 className="text-4xl font-black text-slate-900 mt-2">{stats.coreApps}</h3></div>
               <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Users size={32}/></div>
            </div>
          </div>
        )}

        {activeView === 'CERTIFICATES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Issue Credential</h3>
                    <button onClick={exportCertData} className="text-xs font-bold bg-slate-50 text-slate-600 px-5 py-3 rounded-xl hover:bg-slate-100 hover:text-slate-900 flex gap-2 items-center transition-colors"><Download size={14}/> Export CSV</button>
                  </div>
                  <form onSubmit={handleIssueCertificate} className="space-y-5">
                    <input required placeholder="Student Name" className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400" onChange={e => setCertData({...certData, studentName: e.target.value})} />
                    <select className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer" onChange={e => setCertData({...certData, domain: e.target.value})}>
                      <option value="">Select Domain</option>
                      {["Web Development", "App Development", "Data Science", "Flutter Developer", "Java Programming", "C++ Programming", "Python Programming", "Machine Learning", "AI", "Cyber Security", "UI/UX Design", "Digital Marketing", "DevOps Engineering"].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <input type="date" required className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20" onChange={e => {
                        const d = new Date(e.target.value); const end = new Date(d); end.setMonth(d.getMonth()+1);
                        setCertData({...certData, startDate: e.target.value, awardDate: end.toISOString().split('T')[0]})
                      }} />
                      <input readOnly value={certData.awardDate} className="w-full p-5 bg-slate-50/50 rounded-2xl font-bold text-slate-400 outline-none cursor-not-allowed" />
                    </div>
                    <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all text-sm uppercase tracking-widest mt-2">Generate Certificate</button>
                  </form>
                </div>
             </div>
             {generatedID && (
               <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-center h-fit flex flex-col items-center justify-center text-white relative overflow-hidden animate-in zoom-in duration-300">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <div className="relative z-10 w-full">
                   <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4">Verification Ready</p>
                   <div className="text-4xl font-mono font-black text-white mb-8 tracking-tighter">{generatedID}</div>
                   <div ref={qrRef} className="bg-white p-6 inline-block rounded-3xl shadow-2xl"><QRCode value={`https://swadeshintern.me/verify?id=${generatedID}`} size={180} /></div>
                   <button onClick={() => qrRef.current && toPng(qrRef.current).then(url => { const a = document.createElement('a'); a.download = 'QR.png'; a.href = url; a.click(); })} className="w-full mt-10 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-orange-500 hover:text-white transition-all flex justify-center gap-3 items-center">
                     <Download size={20} /> Save QR Code
                   </button>
                 </div>
               </div>
             )}
          </div>
        )}

        {(activeView === 'INTERNAL' || activeView === 'EXTERNAL') && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            
            <div className="sticky top-24 z-20 bg-[#F8FAFC]/90 backdrop-blur-md pb-4 pt-2 mb-4 border-b border-slate-200/50 flex gap-4 items-center justify-center md:justify-start">
               <button onClick={() => setSubView('LISTINGS')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${subView === 'LISTINGS' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                 Manage Listings
               </button>
               <button onClick={() => setSubView('APPLICANTS')} className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${subView === 'APPLICANTS' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                 Talent Pipeline
               </button>
            </div>

            {subView === 'LISTINGS' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                       <PlusCircle size={20} className="text-orange-500"/> Post New Opportunity
                    </h3>
                    <form onSubmit={handlePostJob} className="space-y-6">
                       
                       <div className="space-y-4">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Job Details</p>
                         <input required placeholder="Role Title (e.g. React Developer)" value={jobForm.title} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                         <div className="grid grid-cols-2 gap-4">
                            <select value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none cursor-pointer">
                              <option>Full Time</option><option>Part Time</option><option>Contract</option><option>Internship</option>
                            </select>
                            <input placeholder="Location" value={jobForm.location} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none" onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                         </div>
                         <input placeholder="Salary / Stipend" value={jobForm.stipend} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" onChange={e => setJobForm({...jobForm, stipend: e.target.value})} />
                       </div>

                       {activeView === 'EXTERNAL' && (
                         <div className="space-y-4 pt-2 border-t border-slate-100">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-2">Company Info</p>
                           <input required placeholder="Company Name" value={jobForm.companyName} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" onChange={e => setJobForm({...jobForm, companyName: e.target.value})} />
                           <input placeholder="Website URL (e.g. https://company.com)" value={jobForm.website} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all" onChange={e => setJobForm({...jobForm, website: e.target.value})} />
                           <textarea placeholder="Company Overview (Brief description)..." rows={3} value={jobForm.companyOverview} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500/20 transition-all" onChange={e => setJobForm({...jobForm, companyOverview: e.target.value})} />
                           
                           <div className="flex gap-2">
                             <label className="flex items-center gap-2 font-bold text-xs cursor-pointer bg-slate-50 p-3 rounded-lg flex-1 justify-center hover:bg-slate-100"><input type="radio" checked={jobForm.applyMethod === 'PLATFORM'} onChange={() => setJobForm({...jobForm, applyMethod: 'PLATFORM'})} className="accent-orange-500"/> Apply on Platform</label>
                             <label className="flex items-center gap-2 font-bold text-xs cursor-pointer bg-slate-50 p-3 rounded-lg flex-1 justify-center hover:bg-slate-100"><input type="radio" checked={jobForm.applyMethod === 'EXTERNAL'} onChange={() => setJobForm({...jobForm, applyMethod: 'EXTERNAL'})} className="accent-orange-500"/> External Link</label>
                           </div>
                           {jobForm.applyMethod === 'EXTERNAL' && <input placeholder="External Application URL" value={jobForm.externalLink} className="w-full p-4 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm outline-none" onChange={e => setJobForm({...jobForm, externalLink: e.target.value})} />}
                         </div>
                       )}

                       <div className="space-y-4 pt-2 border-t border-slate-100">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-2">Requirements</p>
                         <textarea placeholder="Required Skills (comma separated)" rows={2} value={jobForm.skills} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none resize-none" onChange={e => setJobForm({...jobForm, skills: e.target.value})} />
                         <textarea required placeholder="Job Description (Detailed)..." rows={6} value={jobForm.description} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500/20 transition-all" onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                         <textarea placeholder="Key Responsibilities (Detailed list)..." rows={6} value={jobForm.responsibilities} className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none resize-none focus:ring-2 focus:ring-orange-500/20 transition-all" onChange={e => setJobForm({...jobForm, responsibilities: e.target.value})} />
                       </div>
                       
                       <button disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-orange-500 hover:shadow-lg transition-all text-sm">{loading ? <Loader2 className="animate-spin mx-auto" /> : "Publish Opportunity"}</button>
                    </form>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[800px]">
                     <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><FileCheck size={20} className="text-green-500"/> Active Listings</h3>
                     <div className="relative mb-4">
                        <Search size={16} className="absolute left-4 top-4 text-slate-400"/>
                        <input placeholder="Search listings..." className="w-full pl-10 p-3.5 bg-slate-50 rounded-xl text-sm font-bold outline-none" onChange={e => setSearchTerm(e.target.value)}/>
                     </div>
                     <div className="overflow-y-auto custom-scrollbar flex-1 space-y-4 pr-2">
                        {filteredJobs.length === 0 ? (
                          <div className="text-center py-20 text-slate-400 font-bold">No active jobs found.</div>
                        ) : (
                          filteredJobs.map(job => (
                            <div key={job.id} onClick={() => setSelectedJob(job)} className="p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group relative cursor-pointer">
                               <div className="flex justify-between items-start">
                                  <div className="pr-8">
                                    <h4 className="font-black text-slate-900 text-lg leading-tight mb-1">{job.title}</h4>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{activeView === 'INTERNAL' ? 'Core Team' : job.companyName}</p>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); triggerDeleteJob(job.id); }} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                               </div>
                               <div className="mt-4 flex flex-wrap gap-2">
                                  <span className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">{job.type}</span>
                                  <span className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">{getRelativeTime(job.postedAt)}</span>
                                  {job.isExternal && job.applyMethod === 'EXTERNAL' && <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center gap-1"><ExternalLink size={10}/> External</span>}
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
               </div>
            )}

            {subView === 'APPLICANTS' && (
               <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[80vh] flex flex-col">
                   <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
                     <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                       <div>
                         <h3 className="text-3xl font-black text-slate-900">Talent Pipeline</h3>
                         <p className="text-slate-500 font-bold mt-1">Manage applications for {activeView === 'INTERNAL' ? 'Core Team' : 'Job Board'}</p>
                       </div>
                       <div className="relative w-full md:w-auto">
                         <Search size={18} className="absolute left-4 top-3.5 text-slate-400"/>
                         <input placeholder="Search applicants..." className="pl-12 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-orange-200 transition-colors w-full md:w-72" onChange={e => setSearchTerm(e.target.value)}/>
                       </div>
                     </div>
                     <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                       {filteredApplicants.length === 0 ? (
                         <div className="text-center py-20 text-slate-300 font-bold text-lg">No applications found matching your criteria.</div>
                       ) : (
                         filteredApplicants.map(app => (
                           <div key={app.id} onClick={() => setSelectedApp(app)} className="p-6 border border-slate-100 bg-white rounded-3xl flex items-center justify-between cursor-pointer hover:border-orange-200 hover:shadow-xl hover:scale-[1.01] transition-all group">
                             <div className="flex items-center gap-6 min-w-0">
                               <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors text-xl">{(app.applicantName || "C").charAt(0)}</div>
                               <div className="min-w-0">
                                 <p className="font-black text-slate-900 text-lg truncate">{app.applicantName || "Unknown"}</p>
                                 <p className="text-xs font-bold text-slate-400 truncate mt-1">Applied for: {app.jobTitle}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="hidden md:block text-xs font-bold text-slate-300 bg-slate-50 px-3 py-1 rounded-lg">{getRelativeTime(app.appliedAt)}</span>
                                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                                  <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500"/>
                                </div>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   </div>
               </div>
            )}
          </div>
        )}

        {activeView === 'USERS' && isSuperAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 h-fit">
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><UserPlus size={20}/></div> Add Admin
              </h3>
              <form onSubmit={createAdminWithoutLogout} className="space-y-4">
                <input required placeholder="Name" value={newAdmin.name} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-orange-100 focus:bg-orange-50/20 transition-all" onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} />
                <input required type="email" placeholder="Email" value={newAdmin.email} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-orange-100 focus:bg-orange-50/20 transition-all" onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} />
                <input required type="password" placeholder="Password" value={newAdmin.password} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-orange-100 focus:bg-orange-50/20 transition-all" onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} />
                <button disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg">Create Account</button>
              </form>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Active Admins</h3>
              <div className="space-y-3">
                {adminsList.filter(adm => adm.email !== SUPER_ADMINS[0]).map(adm => (
                    <div key={adm.id} className="p-5 border border-slate-100 bg-slate-50/50 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white hover:shadow-lg transition-all group">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">{(adm.name || "A").charAt(0)}</div>
                        <div className="text-left"><p className="font-black text-slate-900">{adm.name || "Unknown"}</p><p className="text-xs font-bold text-slate-400">{adm.email}</p></div>
                      </div>
                      <button onClick={() => triggerDeleteAdmin(adm.id)} className="p-3 bg-white text-slate-400 border border-slate-200 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"><Ban size={18}/></button>
                    </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeView === 'SETTINGS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500 items-stretch">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center relative overflow-hidden h-full flex flex-col items-center">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-slate-900 to-slate-800"></div>
               <div className="relative inline-block group mb-4 mt-12">
                  <img src={adminProfile.photo || `https://ui-avatars.com/api/?name=${adminProfile.name}&background=0f172a&color=fff`} className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl object-cover" alt="Profile"/>
                  <label className="absolute -bottom-2 -right-2 bg-orange-500 text-white p-3 rounded-2xl cursor-pointer hover:bg-orange-600 transition-colors shadow-lg hover:scale-110">
                    <UploadCloud size={18} />
                    <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleProfileUpdate(e.target.files[0])} />
                  </label>
               </div>
               <h2 className="text-3xl font-black text-slate-900 mt-2">{adminProfile.name}</h2>
               <p className="text-slate-400 font-bold text-sm mb-8">{user.email}</p>
               
               {isSuperAdmin && (
                 <div className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-colors mt-auto ${maintenance ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                   <div className="text-left">
                     <h4 className={`font-black uppercase text-xs tracking-widest ${maintenance ? 'text-red-600' : 'text-green-600'}`}>System Status</h4>
                     <p className={`font-bold text-lg ${maintenance ? 'text-red-800' : 'text-green-800'}`}>{maintenance ? 'MAINTENANCE MODE' : 'LIVE'}</p>
                   </div>
                   <button onClick={toggleMaintenance} className={`p-4 rounded-2xl text-white shadow-lg transition-transform active:scale-95 ${maintenance ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                     <Power size={24} />
                   </button>
                 </div>
               )}
            </div>
            
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 h-full flex flex-col">
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600"><Lock size={20}/></div> Security
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4 flex-1 flex flex-col justify-center">
                <input required type="password" placeholder="Current Password" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-slate-200 transition-all" onChange={e => setPassChange({...passChange, old: e.target.value})} />
                <input required type="password" placeholder="New Password" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-slate-200 transition-all" onChange={e => setPassChange({...passChange, new: e.target.value})} />
                <input required type="password" placeholder="Confirm New Password" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-sm border-2 border-transparent focus:border-slate-200 transition-all" onChange={e => setPassChange({...passChange, confirm: e.target.value})} />
                <button disabled={loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all mt-4">{loading ? <Loader2 className="animate-spin mx-auto"/> : "Update Password"}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}