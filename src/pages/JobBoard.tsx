import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, signOut, sendEmailVerification, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider, User as FirebaseUser
} from 'firebase/auth';
import {
  Briefcase, MapPin, Globe, ExternalLink, Building2, Banknote,
  Loader2, LogOut, CheckCircle2, User, Sparkles, ArrowLeft, Clock, ChevronRight,
  X, Mail, Phone, UploadCloud, AlertTriangle, ShieldAlert, LayoutDashboard, Lock, FileText, Settings, Filter
} from 'lucide-react';

const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;


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

const ensureProtocol = (url: string) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
};

const REGEX = {
  NAME: /^[a-zA-Z\s]+$/,
  PHONE: /^[0-9]{10,15}$/,
  YEAR: /^(19|20)\d{2}$/,
  SAFE_TEXT: /^[a-zA-Z0-9\s.,'()-]+$/
};

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  stipend: string;
  skills: string | string[];
  description: string;
  responsibilities: string;
  website: string;
  applyMethod: 'PLATFORM' | 'EXTERNAL';
  externalLink: string;
  postedAt: string;
}

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  const [userApps, setUserApps] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [viewState, setViewState] = useState<string>('DETAILS');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [showGlobalAuth, setShowGlobalAuth] = useState(false);
  const [formError, setFormError] = useState('');

  const [appForm, setAppForm] = useState({
    fullName: '', email: '', phone: '', linkedin: '',
    college: '', degree: 'B.Tech', stream: '', gradYear: '', skills: ''
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });

  const [profileTab, setProfileTab] = useState<'APPS' | 'SECURITY'>('APPS');

  useEffect(() => {
    document.body.style.overflow = (selectedJob || showGlobalAuth || viewState === 'PROFILE') ? 'hidden' : 'unset';
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
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "external_jobs"), orderBy("postedAt", "desc"));
        const snap = await getDocs(q);
        setJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchJobs();

    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setAppForm(prev => ({ ...prev, fullName: u.displayName || '', email: u.email || '' }));
        fetchUserApplications(u.uid);
      } else {
        setAppliedJobIds(new Set());
        setUserApps([]);
      }
    });
  }, []);

  const fetchUserApplications = async (uid: string) => {
    const q = query(collection(db, "user_applications"), where("userId", "==", uid));
    const snap = await getDocs(q);
    const apps = snap.docs.map(d => d.data());
    setUserApps(apps);
    setAppliedJobIds(new Set(apps.map(a => a.jobId)));
  };

  const openJob = (job: Job) => {
    setSelectedJob(job);
    setFormError('');
    setViewState('DETAILS');
  };

  const closeJob = () => {
    setSelectedJob(null);
    setResumeFile(null);
    setFormError('');
    setViewState('DETAILS');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'LOGIN') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        setShowGlobalAuth(false);
      } else {
        const res = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        await updateProfile(res.user, { displayName: authName });
        await sendEmailVerification(res.user);
        setViewState('VERIFY_PROMPT');
        setShowGlobalAuth(false);
        return;
      }
      if (selectedJob) {
        setViewState(selectedJob.applyMethod === 'EXTERNAL' ? 'DETAILS' : 'FORM');
      }
    } catch (err: any) {
      setAuthError(err.message.replace("Firebase: ", ""));
    }
    setAuthLoading(false);
  };

  const handleApplyClick = () => {
    if (selectedJob?.applyMethod === 'EXTERNAL') {
      window.open(ensureProtocol(selectedJob.externalLink), '_blank');
      return;
    }
    if (!user) {
      setViewState('AUTH');
      return;
    }
    if (!user.emailVerified) {
      setViewState('VERIFY_PROMPT');
      return;
    }
    if (appliedJobIds.has(selectedJob!.id)) {
      setViewState('ALREADY_APPLIED');
      return;
    }
    setViewState('FORM');
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      setFormError("You must be logged in to apply.");
      return;
    }

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

      await addDoc(collection(db, "user_applications"), {
        userId: user!.uid,
        jobId: selectedJob!.id,
        jobTitle: selectedJob!.title,
        company: selectedJob!.companyName,
        applicantName: appForm.fullName,
        applicantEmail: appForm.email,
        applicantPhone: appForm.phone,
        linkedin: appForm.linkedin,
        college: appForm.college,
        degree: appForm.degree,
        stream: appForm.stream,
        gradYear: appForm.gradYear,
        skills: appForm.skills,
        resumeUrl: data.secure_url,
        status: 'Applied',
        appliedAt: new Date().toISOString()
      });

      setAppliedJobIds(prev => new Set(prev).add(selectedJob!.id));
      fetchUserApplications(user!.uid);
      setViewState('SUCCESS');
    } catch (error) {
      console.error(error);
      setFormError("Submission failed. Please check your internet.");
    } finally {
      setIsSubmitting(false);
    }
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

  const resendVerification = async () => {
    if (user) {
      await sendEmailVerification(user);
      alert("Verification email sent! Check your inbox.");
    }
  };

  const renderSkills = (skills: string | string[]) => {
    if (!skills) return null;
    const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
    return skillsArray.map((skill, idx) => {
      const trimmed = skill.trim();
      return trimmed ? <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg border border-slate-200">{trimmed}</span> : null;
    });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">

      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 px-4 md:px-8 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
            <Filter size={16} />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:block">Active Listings</span>
        </div>

        {user ? (
          <button onClick={() => setViewState('PROFILE')} className="flex items-center gap-3 hover:bg-slate-50 py-1.5 px-3 rounded-full transition-all border border-transparent hover:border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-none">{user.displayName || "User"}</p>
              <p className="text-[10px] font-bold text-blue-600 leading-none mt-0.5">My Account</p>
            </div>
            <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-md">
              {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
            </div>
          </button>
        ) : (
          <button
            onClick={() => { setAuthMode('LOGIN'); setShowGlobalAuth(true); }}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-blue-600 transition-all shadow-md active:scale-95"
          >
            <User size={14} />
            <span>Login</span>
          </button>
        )}
      </div>

      <div className="pt-8 px-4 md:px-8 pb-20">
        <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full mb-6 shadow-sm">
            <Globe size={14} className="text-blue-500" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">External Opportunities</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Opportunity <span className="text-blue-600">Hub</span></h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Curated job openings and internships from top companies.</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
              <Briefcase className="text-slate-300 mx-auto mb-4" size={40} />
              <p className="text-slate-400 font-bold">No active listings available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => {
                const isApplied = appliedJobIds.has(job.id);
                return (
                  <div key={job.id} onClick={() => openJob(job)} className="group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600"><Building2 size={24} /></div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-lg">{job.type || "Full Time"}</span>
                        {isApplied && <span className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg"><CheckCircle2 size={12} /> Applied</span>}
                        {job.applyMethod === 'EXTERNAL' && <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"><ExternalLink size={12} /> External</span>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">{job.companyName}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md"><MapPin size={12} className="text-blue-500" /> {job.location}</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md"><Banknote size={12} className="text-green-500" /> {job.stipend || "Not Disclosed"}</span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={12} /> {getRelativeTime(job.postedAt)}</span>
                      <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center transition-colors ${isApplied ? 'bg-green-500' : 'bg-slate-900 group-hover:bg-blue-600'}`}>
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
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-lg">
                      {(user.displayName || "U").charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-slate-900">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <button onClick={() => setProfileTab('APPS')} className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${profileTab === 'APPS' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/50'}`}>
                    <LayoutDashboard size={16} /> Applications
                  </button>
                  <button onClick={() => setProfileTab('SECURITY')} className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-3 transition-colors ${profileTab === 'SECURITY' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:bg-white/50'}`}>
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
                      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><LayoutDashboard size={18} className="text-blue-500" /> Applied Jobs</h3>
                      <div className="space-y-4">
                        {userApps.length === 0 ? (
                          <p className="text-slate-400 text-sm font-bold text-center py-10">You haven't applied to any jobs yet.</p>
                        ) : (
                          userApps.map((app, i) => (
                            <div key={i} className="p-4 rounded-2xl border border-slate-100 flex justify-between items-center bg-white hover:shadow-md transition-all">
                              <div>
                                <h4 className="font-black text-slate-900 text-sm">{app.jobTitle}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase">{app.company}</p>
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
                      <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Lock size={18} className="text-blue-500" /> Change Password</h3>
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

        {viewState === 'VERIFY_PROMPT' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-md p-8 text-center shadow-2xl animate-zoom-in">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldAlert size={32} /></div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Verify Your Email</h2>
              <p className="text-slate-500 font-medium text-sm mb-6">We've sent a verification link to <b>{user?.email}</b>. You must verify your email before applying.</p>
              <div className="flex flex-col gap-3">
                <button onClick={resendVerification} className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">Resend Verification Email</button>
                <button onClick={() => window.location.reload()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">I've Verified, Refresh</button>
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
                  <p className="text-slate-500 text-sm font-medium mt-1">Access Opportunity Hub</p>
                </div>
                <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
                  {authMode === 'SIGNUP' && (
                    <input placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={authName} onChange={e => setAuthName(e.target.value)} required />
                  )}
                  <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                  <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                  {authError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</p>}
                  <button disabled={authLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:bg-blue-600 transition-all active:scale-95">
                    {authLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'LOGIN' ? 'Secure Login' : 'Create Account')}
                  </button>
                </form>
                <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">{authMode === 'LOGIN' ? "New here?" : "Have an account?"}</p>
                  <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-blue-600 font-black hover:text-blue-700 hover:underline transition-all text-sm">
                    {authMode === 'LOGIN' ? 'Create a New Account' : 'Login to Existing Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedJob && viewState !== 'PROFILE' && viewState !== 'VERIFY_PROMPT' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={handleBackdropClick}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl animate-zoom-in relative overflow-hidden" onClick={e => e.stopPropagation()}>

              {viewState === 'DETAILS' && (
                <>
                  <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Building2 size={24} /></div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-none mb-1">{selectedJob.title}</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedJob.companyName}</p>
                      </div>
                    </div>
                    <button onClick={closeJob} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                  </div>

                  <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                        <p className="text-xs font-black text-slate-900 mt-1">{selectedJob.location}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                        <p className="text-xs font-black text-slate-900 mt-1">{selectedJob.type}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Stipend</p>
                        <p className="text-xs font-black text-green-600 mt-1">{selectedJob.stipend || "Not Disclosed"}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Posted</p>
                        <p className="text-xs font-black text-slate-900 mt-1">{getRelativeTime(selectedJob.postedAt)}</p>
                      </div>
                    </div>

                    {selectedJob.website && (
                      <a href={ensureProtocol(selectedJob.website)} target="_blank" className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-6 hover:underline"><Globe size={16} /> Visit Company Website</a>
                    )}

                    <section>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Sparkles size={16} className="text-blue-500" /> Description</h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedJob.description || "No specific description provided."}</p>
                    </section>

                    {selectedJob.responsibilities && (
                      <section className="mt-8">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2"><Briefcase size={16} className="text-blue-500" /> Responsibilities</h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{selectedJob.responsibilities}</p>
                      </section>
                    )}

                    {selectedJob.skills && (
                      <section className="mt-8">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2"><User size={16} className="text-blue-500" /> Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {renderSkills(selectedJob.skills)}
                        </div>
                      </section>
                    )}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4 shrink-0">
                    <button onClick={closeJob} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 text-sm">Close</button>
                    {appliedJobIds.has(selectedJob.id) ? (
                      <button disabled className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-not-allowed"><CheckCircle2 size={18} /> Already Applied</button>
                    ) : (
                      <button onClick={handleApplyClick} className={`flex-1 text-white py-3 rounded-xl font-black uppercase tracking-wider text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${selectedJob.applyMethod === 'EXTERNAL' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-500/50'}`}>
                        {selectedJob.applyMethod === 'EXTERNAL' ? <>Apply<ExternalLink size={16} /></> : 'Apply Now'}
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
                    {authMode === 'SIGNUP' && <input placeholder="Full Name" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={authName} onChange={e => setAuthName(e.target.value)} required />}
                    <input type="email" placeholder="Email Address" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
                    {authError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">{authError}</p>}
                    <button disabled={authLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:bg-blue-600 transition-all active:scale-95">
                      {authLoading ? <Loader2 className="animate-spin mx-auto" /> : (authMode === 'LOGIN' ? 'Secure Login' : 'Create Account')}
                    </button>
                  </form>
                  <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">{authMode === 'LOGIN' ? "New here?" : "Have an account?"}</p>
                    <button onClick={() => setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')} className="text-blue-600 font-black hover:text-blue-700 hover:underline transition-all text-sm">
                      {authMode === 'LOGIN' ? 'Create a New Account' : 'Login to Existing Account'}
                    </button>
                  </div>
                </div>
              )}

              {viewState === 'FORM' && selectedJob?.applyMethod !== 'EXTERNAL' && (
                <div className="flex flex-col h-full animate-fade-in">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <button onClick={() => setViewState('DETAILS')} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 text-xs font-bold"><ArrowLeft size={16} /> Back</button>
                    <h3 className="font-black text-slate-900 text-lg">Application Form</h3>
                    <div className="w-6"></div>
                  </div>
                  <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <form onSubmit={handleApplicationSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest border-b border-slate-100 pb-2">Personal Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                            <input required value={appForm.fullName} onChange={e => setAppForm({ ...appForm, fullName: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                            <input required type="email" value={appForm.email} onChange={e => setAppForm({ ...appForm, email: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">
                              Phone
                            </label>
                            <input
                              required
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              value={appForm.phone}
                              onChange={e => {
                                const value = e.target.value.replace(/\D/g, '');
                                setAppForm({ ...appForm, phone: value });
                              }}
                              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="10 Digits"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn URL</label>
                            <input value={appForm.linkedin} onChange={e => setAppForm({ ...appForm, linkedin: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="linkedin.com/in/..." />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-blue-500 uppercase tracking-widest border-b border-slate-100 pb-2">Education & Skills</h4>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            College / University
                          </label>
                          <input
                            required
                            value={appForm.college}
                            onChange={e => {
                              const value = e.target.value.replace(/[^a-zA-Z\s.,'()-]/g, '');
                              setAppForm({ ...appForm, college: value });
                            }}
                            className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Your college or university"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                            <select required value={appForm.degree} onChange={e => setAppForm({ ...appForm, degree: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500">
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
                              onChange={e => {
                                const value = e.target.value.replace(/[^a-zA-Z .&-]/g, '');
                                setAppForm({ ...appForm, stream: value });
                              }}
                              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. B.Tech CSE / AI"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">
                              Graduation Year
                            </label>
                            <input
                              required
                              type="text"
                              maxLength={4}
                              value={appForm.gradYear}
                              onChange={e => {
                                const value = e.target.value.replace(/\D/g, '');
                                setAppForm({ ...appForm, gradYear: value });
                              }}
                              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="e.g. 2026"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Skills (Comma Separated)</label>
                          <textarea required rows={2} value={appForm.skills} onChange={e => setAppForm({ ...appForm, skills: e.target.value })} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="React, Python..." />
                        </div>
                      </div>
                      <div className="pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Resume (PDF)</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer relative group">
                          <input type="file" required accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="flex flex-col items-center gap-1">
                            {resumeFile ? <span className="font-bold text-green-600 text-sm flex items-center gap-2"><CheckCircle2 size={16} /> {resumeFile.name}</span> : <span className="font-bold text-slate-400 text-sm group-hover:text-blue-600 flex items-center gap-2"><UploadCloud size={16} /> Upload Resume</span>}
                          </div>
                        </div>
                      </div>
                      {formError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2"><AlertTriangle size={16} /> {formError}</div>}
                      <button disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-wider text-sm shadow-lg hover:bg-blue-600 transition-all flex justify-center gap-2 mt-2">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Application"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {viewState === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center h-full p-10 animate-zoom-in text-center bg-white">
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100"><CheckCircle2 size={48} className="animate-bounce" strokeWidth={3} /></div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Application Sent!</h2>
                  <p className="text-slate-500 font-medium max-w-sm mb-8">Your application for <span className="text-slate-900 font-bold">{selectedJob.title}</span> has been submitted successfully.</p>
                  <button onClick={closeJob} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95">Back to Hub</button>
                </div>
              )}

              {viewState === 'ALREADY_APPLIED' && (
                <div className="flex flex-col items-center justify-center h-full p-10 animate-zoom-in text-center bg-white">
                  <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100"><CheckCircle2 size={48} /></div>
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Already Applied</h2>
                  <p className="text-slate-500 font-medium max-w-sm mb-8">You have already applied for this position.</p>
                  <button onClick={closeJob} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95">Back to Hub</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}