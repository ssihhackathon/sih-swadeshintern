import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 
import { auth, db } from './firebase';
import Header from './components/Header';
import Hero from './components/Hero';
import Domains from './components/Domains';
import Certifications from './components/Certifications';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import Terms from './components/Terms';
import Verify from './pages/Verify';
import CareerFastTrack from './components/CareerFastTrack';
import DomainsPage from './components/DomainsPage';
import AdminPanel from './pages/admin/AdminPanel';
import HiringPopup from './components/HiringPopup';
import Careers from './pages/Careers';
import JobBoard from './pages/JobBoard';      
import UserProfile from './pages/UserProfile'; 
import ChatbotButton from "./components/chatbot/ChatbotButton";
import Testimonials from './components/Testimonials';
// import { pageview } from "./analytics";

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if ((window as any).gtag) {
      (window as any).gtag('config', 'G-H17Z6W4ZLP', {
        page_path: location.pathname,
      });
    }
  }, [location.pathname]);

  return null;
}
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const RouteWrapper = ({ children }: { children: React.ReactNode }) => (
  <PageWrapper>{children}</PageWrapper>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function LayoutManager({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const isAdminPage = location.pathname.startsWith('/controlhub');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}

      <main className="flex-grow">
        {children}
      </main>
      
      {!isAdminPage && (
        <>
          <HiringPopup />
          <Footer />
          <ChatbotButton />
        </>
      )}
    </div>
  );
}

function MaintenanceScreen() {
  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <img src="/swadeshintern.jpg" className="w-24 h-24 mb-6 rounded-full shadow-2xl" alt="Logo" />
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter">We'll be right back!</h1>
      <p className="text-slate-500 font-bold text-lg max-w-md mx-auto leading-relaxed">
        SwadeshIntern is currently undergoing scheduled maintenance to improve your experience. 
        <br/><span className="text-orange-500">Please check back soon.</span>
      </p>
    </div>
  );
}

function LandingPage() {
  const location = useLocation();
  useEffect(() => {
    const id = (location.state as any)?.scrollToId;
    if (id) {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  return (
    <PageWrapper>
      <Hero />
      <Domains />
      <Certifications />
      <Testimonials />
      <About />
      <Contact id="contact" />
    </PageWrapper>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const docSnap = await getDoc(doc(db, "settings", "system"));
        if (docSnap.exists() && docSnap.data().maintenanceMode) {
          setMaintenance(true);
        }
      } catch (e) { 
        console.error("Config Error", e); 
      }
    };
    checkStatus();

    const timer = setTimeout(() => setLoading(false), 1200); 
    const unsubscribe = onAuthStateChanged(auth, () => setAuthChecking(false));

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const isControlHub = window.location.pathname.includes('controlhub');
  if (maintenance && !isControlHub) {
    return <MaintenanceScreen />;
  }

  return (
    <Router>
      <AnalyticsTracker />
      <ScrollToTop />
      
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src="/swadeshintern.jpg" 
              className="w-20 h-20 rounded-full mb-6 shadow-xl" 
            />
            <div className="h-[2px] w-40 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="h-full bg-orange-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
        <LayoutManager>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy-policy" element={<RouteWrapper><PrivacyPolicy /></RouteWrapper>} />
                <Route path="/terms" element={<RouteWrapper><Terms /></RouteWrapper>} />
                <Route path="/verify" element={<RouteWrapper><Verify /></RouteWrapper>} />
                <Route path="/career-fasttrack" element={<RouteWrapper><CareerFastTrack /></RouteWrapper>} />
                <Route path="/domains" element={<RouteWrapper><DomainsPage /></RouteWrapper>} />
                
                <Route path="/careers" element={<RouteWrapper><Careers /></RouteWrapper>} />
                <Route path="/jobs" element={<RouteWrapper><JobBoard /></RouteWrapper>} />
                
                <Route path="/profile" element={<RouteWrapper><UserProfile /></RouteWrapper>} />

                <Route 
                  path="/controlhub" 
                  element={!authChecking ? <AdminPanel /> : null} 
                />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
        </LayoutManager>
      )}
    </Router>
  );
}

export default App;