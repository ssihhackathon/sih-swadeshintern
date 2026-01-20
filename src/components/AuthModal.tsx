import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { validateIndianMobile, validateEmail } from '../utils/validators';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    captchaInput: ''
  });

  const [captchaChallenge] = useState({ num1: Math.floor(Math.random() * 10), num2: Math.floor(Math.random() * 10) });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        
        if (parseInt(formData.captchaInput) !== captchaChallenge.num1 + captchaChallenge.num2) {
          throw new Error("Incorrect Captcha. Please try again.");
        }

        if (!validateIndianMobile(formData.phone)) {
          throw new Error("Invalid Mobile Number. Please enter a valid 10-digit Indian number.");
        }

        const emailCheck = validateEmail(formData.email);
        if (!emailCheck.isValid) throw new Error(emailCheck.error);

        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        await setDoc(doc(db, "users", userCred.user.uid), {
          uid: userCred.user.uid,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'CANDIDATE',
          createdAt: new Date().toISOString()
        });

        await updateProfile(userCred.user, { displayName: formData.name });
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20}/></button>
        
        <div className="p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-500 text-sm font-bold mb-6">
            {isLogin ? 'Login to apply for positions.' : 'Sign up to launch your career.'}
          </p>

          {error && <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input required placeholder="Full Name" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                  onChange={e => setFormData({...formData, name: e.target.value})} />
                
                <input required placeholder="Mobile (+91)" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                  onChange={e => setFormData({...formData, phone: e.target.value})} />
              </>
            )}

            <input required type="email" placeholder="Email Address" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
              onChange={e => setFormData({...formData, email: e.target.value})} />

            <input required type="password" placeholder="Password" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
              onChange={e => setFormData({...formData, password: e.target.value})} />

            {!isLogin && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <span className="font-black text-slate-400 select-none">{captchaChallenge.num1} + {captchaChallenge.num2} = ?</span>
                <input required type="number" className="w-20 p-1 bg-white rounded-lg font-bold text-center border border-slate-200"
                  onChange={e => setFormData({...formData, captchaInput: e.target.value})} />
              </div>
            )}

            <button disabled={loading} className="w-full py-4 bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login & Apply' : 'Sign Up & Apply')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-bold text-slate-400 hover:text-orange-500">
              {isLogin ? "New here? Create an account" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}