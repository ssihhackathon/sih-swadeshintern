import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, signOut, sendEmailVerification, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider, User as FirebaseUser
} from 'firebase/auth';
import {
  Briefcase, MapPin, UploadCloud, CheckCircle2, Loader2,
  Banknote, ChevronRight, X, Code2, PenTool, LineChart,
  LayoutDashboard, Megaphone, Globe, Users, Sparkles, Clock, ArrowLeft, LogOut, User, Linkedin, Phone, Mail, AlertTriangle, Lock, Settings
} from 'lucide-react';

const REGEX = {
  NAME: /^[a-zA-Z\s]+$/,
  PHONE: /^[0-9]{10,15}$/,
  YEAR: /^(19|20)\d{2}$/,
  SAFE_TEXT: /^[a-zA-Z0-9\s.,'()-]+$/
};

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  skills: string[];
  summary: string;
  responsibilities: string;
  benefits: string;
  postedAt: string;
}

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

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [userApps, setUserApps] = useState<any[]>([]);
  const [checkingApplications, setCheckingApplications] = useState(false);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewState, setViewState] = useState<'DETAILS' | 'AUTH' | 'FORM' | 'SUCCESS' | 'ALREADY_APPLIED' | 'PROFILE'>('DETAILS');

  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [showGlobalAuth, setShowGlobalAuth] = useState(false);
  const [formError, setFormError] = useState('');

  const [profileTab, setProfileTab] = useState<'APPS' | 'SECURITY'>('APPS');

  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  const [appForm, setAppForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    college: '',
    degree: 'B.Tech',
    stream: '',
    gradYear: '',
    skills: ''
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (selectedJob || showGlobalAuth || viewState === 'PROFILE') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedJob, showGlobalAuth, viewState]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeJob();
      setShowGlobalAuth(false);
      if (viewState === 'PROFILE') setViewState('DETAILS');
    }
  };

  useEffect(() => {
    if (user) {
      setAppForm(prev => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || ''
      }));
      setShowGlobalAuth(false);
      fetchUserApplications(user.uid);
    } else {
      setAppliedJobIds(new Set());
      setUserApps([]);
      setCheckingApplications(false);
    }
  }, [user]);

  const fetchUserApplications = async (uid: string) => {
    setCheckingApplications(true);
    try {
      const q = query(collection(db, "applications"), where("applicantId", "==", uid));
      const snap = await getDocs(q);
      const apps = snap.docs.map(doc => doc.data());
      setUserApps(apps);
      setAppliedJobIds(new Set(apps.map(a => a.jobId)));
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setCheckingApplications(false);
    }
  };

  const getRoleIcon = (title: string = "") => {
    const t = title.toLowerCase();
    if (t.includes('design') || t.includes('ui')) return <PenTool size={24} className="text-pink-500" />;
    if (t.includes('marketing')) return <Megaphone size={24} className="text-orange-500" />;
    if (t.includes('data')) return <LineChart size={24} className="text-blue-500" />;
    if (t.includes('manager')) return <LayoutDashboard size={24} className="text-purple-500" />;
    return <Code2 size={24} className="text-green-500" />;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "hiring"), orderBy("postedAt", "desc"));
        const snap = await getDocs(q);
        setJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchJobs();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const openJob = (job: Job) => {
    setSelectedJob(job);
    setFormError('');
    if (user && appliedJobIds.has(job.id)) {
      setViewState('ALREADY_APPLIED');
    } else {
      setViewState('DETAILS');
    }
  };

  const closeJob = () => {
    setSelectedJob(null);
    setResumeFile(null);
    setFormError('');
    setViewState('DETAILS');
  };

  const handleApplyClick = () => {
    if (user && appliedJobIds.has(selectedJob!.id)) {
      setViewState('ALREADY_APPLIED');
      return;
    }

    if (user) {
      setViewState('FORM');
    } else {
      setViewState('AUTH');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'LOGIN') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(res.user, { displayName: authName });
      }
      if (selectedJob) setViewState('FORM');

    } catch (err: any) {
      setAuthError(err.message.replace("Firebase: ", ""));
    }
    setAuthLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return setPassMsg({ type: 'error', text: "Passwords do not match." });

    setAuthLoading(true);
    try {
      if (!user || !user.email) throw new Error("User not found");
      const cred = EmailAuthProvider.credential(user.email, passData.old);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, passData.new);
      setPassMsg({ type: 'success', text: "Password updated successfully!" });
      setPassData({ old: '', new: '', confirm: '' });
    } catch (err: any) {
      setPassMsg({ type: 'error', text: "Incorrect current password." });
    }
    setAuthLoading(false);
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!REGEX.NAME.test(appForm.fullName)) return setFormError("Name must contain only alphabets.");
    if (!REGEX.PHONE.test(appForm.phone)) return setFormError("Phone number must be 10-15 digits.");
    if (!REGEX.YEAR.test(appForm.gradYear)) return setFormError("Graduation Year must be a valid 4-digit year.");
    if (!REGEX.SAFE_TEXT.test(appForm.college)) return setFormError("College name contains invalid characters.");
    if (!resumeFile) return setFormError("Please upload your resume (PDF).");

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: formData });
      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload Failed");

      await addDoc(collection(db, "applications"), {
        jobId: selectedJob!.id,
        jobTitle: selectedJob!.title,
        department: selectedJob!.department || "Core Team",
        applicantId: user.uid,
        applicantName: appForm.fullName,
        applicantEmail: appForm.email,
        applicantPhone: appForm.phone,
        linkedinProfile: appForm.linkedin || "N/A",
        college: appForm.college,
        degree: appForm.degree,
        stream: appForm.stream,
        gradYear: appForm.gradYear,
        skills: appForm.skills,
        resumeUrl: data.secure_url,
        status: 'pending',
        appliedAt: new Date().toISOString()
      });

      setAppliedJobIds(prev => new Set(prev).add(selectedJob!.id));
      fetchUserApplications(user.uid);
      setViewState('SUCCESS');

    } catch (error) {
      console.error(error);
      setFormError("Error submitting application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 px-4 md:px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-orange-50 p-1.5 rounded-lg text-orange-600">
            <Sparkles size={16} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:block">We Are Hiring</span>
        </div>

        {user ? (
          <button onClick={() => setViewState('PROFILE')} className="flex items-center gap-3 hover:bg-slate-50 py-1.5 px-3 rounded-full transition-all border border-transparent hover:border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-none">{user.displayName || "User"}</p>
              <p className="text-[10px] font-bold text-orange-600 leading-none mt-0.5">My Account</p>
            </div>
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
              {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
            </div>
          </button>
        ) : (
          <button
            onClick={() => { setAuthMode('LOGIN'); setShowGlobalAuth(true); }}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-orange-600 transition-all shadow-md active:scale-95"
          >
            <User size={14} />
            <span>Login</span>
          </button>
        )}
      </div>

      <div className="pt-8 px-4 md:px-8 pb-20">

        <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full mb-6 shadow-sm">
            <Sparkles size={14} className="text-orange-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">We Are Hiring</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Join the <span className="text-orange-500">Core Team</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Help us build the future of internships. We're looking for passionate individuals to lead, create, and innovate.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={40} /></div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <Users className="text-slate-300 mx-auto mb-4" size={40} />
              <p className="text-slate-400 font-bold">No positions currently open.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => {
                const isApplied = appliedJobIds.has(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => openJob(job)}
                    className="group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-orange-50 transition-colors">
                        {getRoleIcon(job.title)}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {job.type || "Full Time"}
                        </span>
                        {isApplied && (
                          <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            <CheckCircle2 size={12} /> Applied
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-1">{job.title}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">{job.department || "Core Team"}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                          <MapPin size={12} className="text-orange-500" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                          <Banknote size={12} className="text-green-500" /> {job.salary || "Competitive"}
                        </span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={12} /> Posted recently</span>
                      <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors ${isApplied ? 'bg-green-500' : 'bg-slate-900 group-hover:bg-orange-500'}`}>
                        {isApplied ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {viewState === 'PROFILE' && user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in" onClick={handleBackdropClick}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl animate-zoom-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <h2 className="text-2xl font-black text-slate-900">My Account</h2>
                <button onClick={() => setViewState('DETAILS')} className="p-2 hover:bg-slate-50 rounded-full"><X size={20} /></button>
              </div>
              <div className="flex flex-col md:flex-row h-full overflow-hidden">
                <div className="w-full md:w-64 bg-slate-50 p-6 flex flex-col gap-2 border-r border-slate-100 shrink-0">
                  <div className="mb-6 text-center">
                    <div className="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-lg">
                      {(user.displayName || "U").charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-slate-900">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <button onClick={() => setProfileTab('APPS')} className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${profileTab === 'APPS' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:bg-white/50'}`}>
                    <Briefcase size={16} /> Applications
                  </button>
                  <button onClick={() => setProfileTab('SECURITY')} className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${profileTab === 'SECURITY' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:bg-white/50'}`}>
                    <Lock size={16} /> Security
                  </button>
                  <div className="flex-1"></div>
                  <button onClick={() => { signOut(auth); setViewState('DETAILS'); }} className="p-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                  {profileTab === 'APPS' && (
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><LayoutDashboard size={18} className="text-orange-500" /> Core Team Applications</h3>
                      <div className="space-y-4">
                        {userApps.length === 0 ? (
                          <p className="text-slate-400 text-sm font-bold text-center py-10">You haven't applied to any core positions yet.</p>
                        ) : (
                          userApps.map((app, i) => (
                            <div key={i} className="p-4 rounded-2xl border border-slate-100 flex justify-between items-center bg-white hover:shadow-md transition-all">
                              <div>
                                <h4 className="font-black text-slate-900 text-sm">{app.jobTitle}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase">{app.department}</p>
                              </div>
                              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg border border-green-100">Applied</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {profileTab === 'SECURITY' && (
                    <div>
                      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Lock size={18} className="text-orange-500" /> Change Password</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Current Password</label>
                          <input type="password" required className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none" onChange={e => setPassData({ ...passData, old: e.target.value })} value={passData.old} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">New Password</label>
                          <input type="password" required className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none" onChange={e => setPassData({ ...passData, new: e.target.value })} value={passData.new} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Confirm Password</label>
                          <input type="password" required className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none" onChange={e => setPassData({ ...passData, confirm: e.target.value })} value={passData.confirm} />
                        </div>
                        {passMsg.text && <p className={`text-xs font-bold ${passMsg.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{passMsg.text}</p>}
                        <button disabled={authLoading} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                          {authLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showGlobalAuth && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in" onClick={handleBackdropClick}>
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl animate-zoom-in relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowGlobalAuth(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X size={24} /></button>
              <div className="p-10 flex flex-col items-center justify-center h-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900">{authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Access your dashboard</p>
                </div>
                <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
                  {authMode === 'SIGNUP' && (
                    <input placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={authName} onChange={e => setAuthName(e.target.value)} required />
                  )}
                  <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                  <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                  {authError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</p>}
                  <button disabled={authLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:bg-orange-600 transition-all active:scale-95">
                    {authLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'LOGIN' ? 'Secure Login' : 'Create Account')}
                  </button>
                </form>
                <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">{authMode === 'LOGIN' ? "New here?" : "Have an account?"}</p>
                  <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-orange-600 font-black hover:text-orange-700 hover:underline transition-all text-sm">
                    {authMode === 'LOGIN' ? 'Create a New Account' : 'Login to Existing Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedJob && viewState !== 'PROFILE' && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
          >
            <div
              className="bg-white rounded-[2.5rem] w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-zoom-in relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {viewState === 'DETAILS' && (
                <>
                  <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">{getRoleIcon(selectedJob.title)}</div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-none mb-1">{selectedJob.title}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedJob.department} • {selectedJob.location}</p>
                      </div>
                    </div>
                    <button onClick={closeJob} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <section>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Globe size={16} className="text-orange-500" /> Overview</h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedJob.summary}</p>
                    </section>
                    {selectedJob.responsibilities && (
                      <section className="mt-8">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2"><LayoutDashboard size={16} className="text-orange-500" /> Responsibilities</h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedJob.responsibilities}</p>
                      </section>
                    )}
                    {(selectedJob.skills?.length > 0) && (
                      <section className="mt-8">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Code2 size={16} className="text-orange-500" /> Skills</h3>
                        <div className="flex flex-wrap gap-2">{(selectedJob.skills || []).map((skill, idx) => <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">{skill}</span>)}</div>
                      </section>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4 shrink-0">
                    <button onClick={closeJob} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 text-sm">Close</button>

                    {(appliedJobIds.has(selectedJob.id)) ? (
                      <button disabled className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                        <CheckCircle2 size={18} /> Already Applied
                      </button>
                    ) : (
                      <button onClick={handleApplyClick} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:shadow-orange-500/50 transition-all">
                        Apply Now
                      </button>
                    )}
                  </div>
                </>
              )}
              {viewState === 'AUTH' && (
                <div className="p-10 flex flex-col items-center justify-center h-full animate-fade-in">
                  <button onClick={() => setViewState('DETAILS')} className="absolute top-6 left-6 text-slate-400 hover:text-slate-900 flex items-center gap-1 text-xs font-bold"><ArrowLeft size={16} /> Back</button>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900">{authMode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">Apply for {selectedJob.title}</p>
                  </div>
                  <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
                    {authMode === 'SIGNUP' && (
                      <input placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={authName} onChange={e => setAuthName(e.target.value)} required />
                    )}
                    <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                    {authError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</p>}
                    <button disabled={authLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:bg-orange-600 transition-all active:scale-95">
                      {authLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'LOGIN' ? 'Secure Login' : 'Create Account')}
                    </button>
                  </form>
                  <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">{authMode === 'LOGIN' ? "New here?" : "Have an account?"}</p>
                    <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-orange-600 font-black hover:text-orange-700 hover:underline transition-all text-sm">
                      {authMode === 'LOGIN' ? 'Create a New Account' : 'Login to Existing Account'}
                    </button>
                  </div>
                </div>
              )}
              {viewState === 'FORM' && (
                <div className="flex flex-col h-full animate-fade-in">
                  {checkingApplications ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
                      <p className="font-bold text-slate-400">Verifying profile...</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                        <button onClick={() => setViewState('DETAILS')} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 text-xs font-bold"><ArrowLeft size={16} /> Back</button>
                        <h3 className="font-black text-slate-900 text-lg">Application Form</h3>
                        <div className="w-6"></div>
                      </div>

                      <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                        <form onSubmit={handleApplicationSubmit} className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest border-b border-slate-100 pb-2">Personal Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                                <input
                                  required
                                  value={appForm.fullName}
                                  onChange={e => setAppForm({ ...appForm, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="John Doe"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                                <input required type="email" value={appForm.email} onChange={e => setAppForm({ ...appForm, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone</label>
                                <input
                                  required
                                  type="tel"
                                  maxLength={15}
                                  value={appForm.phone}
                                  onChange={e => setAppForm({ ...appForm, phone: e.target.value.replace(/[^0-9]/g, '') })}
                                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="10 Digits"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn URL</label>
                                <input value={appForm.linkedin} onChange={e => setAppForm({ ...appForm, linkedin: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="linkedin.com/in/..." />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest border-b border-slate-100 pb-2">Education & Skills</h4>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">College / University</label>
                              <input
                                required
                                value={appForm.college}
                                onChange={e => setAppForm({ ...appForm, college: e.target.value.replace(/[^a-zA-Z\s.,'()-]/g, '') })}
                                className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Your college or university" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                                <select required value={appForm.degree} onChange={e => setAppForm({ ...appForm, degree: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500">
                                  <option value="B.Tech">B.Tech</option>
                                  <option value="B.E">B.E</option>
                                  <option value="B.Sc">B.Sc</option>
                                  <option value="BCA">BCA</option>
                                  <option value="MCA">MCA</option>
                                  <option value="M.Tech">M.Tech</option>
                                  <option value="MBA">MBA</option>
                                  <option value="BBA">BBA</option>
                                  <option value="Diploma">Diploma</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                  Stream
                                </label>

                                <input
                                  required
                                  value={appForm.stream}
                                  onChange={e =>
                                    setAppForm({
                                      ...appForm,
                                      stream: e.target.value.replace(/[^a-zA-Z0-9\s\-,]/g, ''),
                                    })
                                  }
                                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="e.g. CSE, ECE"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Graduation Year</label>
                                <input
                                  required
                                  type="text"
                                  maxLength={4}
                                  value={appForm.gradYear}
                                  onChange={e => setAppForm({ ...appForm, gradYear: e.target.value.replace(/[^0-9]/g, '') })}
                                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="e.g. 2026"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Skills (Comma Separated)</label>
                              <textarea required rows={2} value={appForm.skills} onChange={e => setAppForm({ ...appForm, skills: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="React, Python..." />
                            </div>
                          </div>

                          <div className="pt-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Resume (PDF)</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer relative group">
                              <input type="file" required accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                              <div className="flex flex-col items-center gap-1">
                                {resumeFile ? <span className="font-bold text-green-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} /> {resumeFile.name}</span> : <span className="font-bold text-slate-400 text-sm group-hover:text-orange-600 flex items-center gap-2"><UploadCloud size={16} /> Upload Resume</span>}
                              </div>
                            </div>
                          </div>

                          {formError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2"><AlertTriangle size={16} /> {formError}</div>}

                          <button disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:bg-green-600 transition-all flex justify-center gap-2 mt-2">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Application"}
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              )}
              {viewState === 'ALREADY_APPLIED' && (
                <div className="flex flex-col items-center justify-center h-full p-10 animate-zoom-in text-center bg-white">
                  <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-orange-100">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Application Received</h2>
                  <p className="text-slate-500 font-medium max-w-sm mb-8">
                    You have already applied for <span className="text-slate-900 font-bold">{selectedJob.title}</span>. Check your email for updates.
                  </p>
                  <button onClick={closeJob} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                    Back to Jobs
                  </button>
                </div>
              )}
              {viewState === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center h-full p-10 animate-zoom-in text-center bg-white">
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
                    <CheckCircle2 size={48} className="animate-bounce" strokeWidth={3} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Application Sent!</h2>
                  <p className="text-slate-500 font-medium max-w-sm mb-8">
                    We've received your application for <span className="text-slate-900 font-bold">{selectedJob.title}</span>. Our team will review your profile and get back to you soon.
                  </p>
                  <button onClick={closeJob} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                    Continue Exploring
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}