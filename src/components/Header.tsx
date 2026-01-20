import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: 'home', isScroll: true },
    { name: 'Internships', path: '/domains', isScroll: false },
    { name: 'Verify Certificate', path: '/verify', isScroll: false },
    { name: 'Jobs', path: '/jobs', isScroll: false },
    { name: 'Career FastTrack', path: '/career-fasttrack', isScroll: false },
    { name: 'Careers', path: '/careers', isScroll: false }
  ];

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition < 50) {
        setActiveSection('home');
        return;
      }

      const sections = ['home', 'about', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 120 && rect.bottom >= 120;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleNavClick = (item: typeof navItems[0]) => {
    setIsMenuOpen(false);
    if (item.isScroll) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => executeScroll(item.path), 100);
      } else {
        executeScroll(item.path);
      }
    }
  };

  const executeScroll = (id: string) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element?.getBoundingClientRect().top ?? 0;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.03)] z-50 border-b border-gray-50 h-20">
        <nav className="container mx-auto px-6 h-full flex items-center justify-between">
          
          <NavLink 
            to="/" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
            className="flex items-center space-x-3 transition-transform active:scale-95"
          >
            <img src="/swadeshintern.jpg" alt="Logo" className="h-10 w-10 lg:h-11 lg:w-11 rounded-full shadow-sm" />
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 bg-clip-text text-transparent">
              SwadeshIntern
            </span>
          </NavLink>

          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isScroll ? (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className={`relative text-[15px] font-black transition-colors duration-300 py-1 ${
                    activeSection === item.path ? 'text-orange-500' : 'text-[#2d3748] hover:text-orange-500'
                  }`}
                >
                  {item.name}
                  {activeSection === item.path && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
                  )}
                </button>
              ) : (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => 
                    `relative text-[15px] font-black transition-colors duration-300 py-1 ${
                      isActive ? 'text-orange-500' : 'text-[#2d3748] hover:text-orange-500'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.name}
                      {isActive && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />}
                    </>
                  )}
                </NavLink>
              )
            ))}
            
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSdVpRYTEB3hbBzBGGw72zLU_DXJkdf5rBApA8DfiuRuumHEVQ/viewform" 
              target="_blank" 
              className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-[15px] hover:bg-orange-600 shadow-[0_4px_14px_0_rgba(255,115,0,0.39)] transition-all active:scale-95"
            >
              Apply Now
            </a>
          </div>

          <button 
            className="lg:hidden p-2 text-gray-900 transition-transform active:scale-90" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>
      </header>

      <div 
        className={`fixed inset-0 bg-white z-[49] flex flex-col pt-24 pb-6 px-6 transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full pointer-events-none'
        }`}
      >
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {navItems.map((item, index) => (
                item.isScroll ? (
                  <button 
                    key={item.name}
                    onClick={() => handleNavClick(item)} 
                    className={`text-lg font-bold transition-all flex items-center justify-between w-full p-4 rounded-xl ${
                      activeSection === item.path ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {item.name}
                    <ChevronRight size={18} className={`transition-transform ${activeSection === item.path ? 'rotate-90 text-orange-500' : 'text-slate-400'}`}/>
                  </button>
                ) : (
                  <NavLink 
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => 
                      `text-lg font-bold transition-all flex items-center justify-between w-full p-4 rounded-xl ${
                        isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {({ isActive }) => (
                        <>
                        {item.name}
                        <ChevronRight size={18} className={`transition-transform ${isActive ? 'rotate-90 text-orange-500' : 'text-slate-400'}`}/>
                        </>
                    )}
                  </NavLink>
                )
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 mt-4">
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSdVpRYTEB3hbBzBGGw72zLU_DXJkdf5rBApA8DfiuRuumHEVQ/viewform" 
                target="_blank" 
                className="flex items-center justify-center w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
              >
                Apply Now
              </a>
            </div>
          </div>
      </div>
    </>
  );
}