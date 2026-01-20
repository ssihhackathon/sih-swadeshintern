import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToHomeSection = (id: string) => {
    if (location.pathname === '/') {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollToId: id } });
    }
  };
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-24 md:pb-16 relative z-40">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/swadeshintern.jpg"
                alt="SwadeshIntern Logo"
                className="h-12 w-12 rounded-full border-2 border-slate-700"
              />
              <span className="text-2xl font-black tracking-tight text-white">
                Swadesh<span className="text-orange-500">Intern</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              Empowering the next generation of tech professionals through quality internship programs. Bridging the gap between learning and industry.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li>
                <button onClick={() => scrollToHomeSection('home')} className="hover:text-orange-500 transition-colors text-left w-full">Home</button>
              </li>
              <li>
                <button onClick={() => scrollToHomeSection('domains')} className="hover:text-orange-500 transition-colors text-left w-full">Internship</button>
              </li>
              <li>
                <Link to="/career-fasttrack" className="hover:text-orange-500 transition-colors block">Career FastTrack</Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-orange-500 transition-colors block">Jobs</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-orange-500 transition-colors flex items-center gap-2">Careers</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Resources</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li>
                <Link to="/verify" className="hover:text-orange-500 transition-colors block">Verify Certificate</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-orange-500 transition-colors block">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-500 transition-colors block">Terms of Service</Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToHomeSection('contact')}
                  className="hover:text-orange-500 transition-colors text-left w-full"
                >
                  Contact Support
                </button>
              </li>
            </ul>
          </div>
          <div className="relative z-50">
            <h4 className="text-lg font-bold mb-6 text-white">Connect With Us</h4>
            <div className="flex gap-4 mb-6">
              <a href="https://www.linkedin.com/company/swadeshintern/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all group relative z-50">
                <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://x.com/swadeshintern" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl hover:bg-black hover:text-white transition-all group relative z-50">
                <Twitter size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.instagram.com/swadeshintern/" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl hover:bg-pink-600 hover:text-white transition-all group relative z-50">
                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-xl hover:bg-blue-800 hover:text-white transition-all group relative z-50">
                <Facebook size={18} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
            <div className="flex flex-col gap-3 text-slate-400 text-sm">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-orange-500 shrink-0" />
                <a href="mailto:swadeshintern@gmail.com" className="hover:text-white transition-colors relative z-50">
                  swadeshintern@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-orange-500 shrink-0" />
                <span>Noida, Uttar Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500 text-sm font-medium">
            &copy; {currentYear} SwadeshIntern. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}