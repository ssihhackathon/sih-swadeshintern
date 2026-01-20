import { motion } from 'framer-motion';
import { Users, FileText, Presentation, Video, CheckCircle2 } from 'lucide-react';

const features = [
  { icon: Users, title: "1:1 Mentorship", desc: "Direct guidance from IIT graduates and industry veterans." },
  { icon: FileText, title: "Resume Review", desc: "Get your resume shortlisted with expert ATS optimization." },
  { icon: Presentation, title: "Mock Interviews", desc: "Real-world interview simulations with Google & Microsoft employees." },
  { icon: Video, title: "Career Guidance", desc: "Personalized roadmap to help you land your dream tech job." }
];

export default function CareerFastTrack() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-32 pb-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
            Career <span className="text-orange-500">FastTrack</span> Program
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Don't just learn—evolve. Get mentored by the top 1% of the tech industry. 
            Our mentors come from IITs and global tech giants like Google and Microsoft.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {features.map((f, i) => (
            <div key={i} className="flex gap-6 p-8 bg-gray-50 rounded-[32px] border border-gray-100 hover:bg-white hover:shadow-2xl transition-all group">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all">
                <f.icon size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[40px] p-10 lg:p-20 text-white text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-8">Ready to level up your career?</h2>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {["IIT Mentors", "Big Tech Mock Interviews", "ATS Resume Help"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 px-6 py-2 rounded-full border border-white/20">
                <CheckCircle2 size={18} className="text-green-400" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
          <a href="https://formgoole.com/" target="_blank" className="bg-orange-500 px-12 py-5 rounded-full font-bold text-xl hover:bg-orange-600 transition-all inline-block">
            Join the FastTrack Program
          </a>
        </div>
      </div>
    </motion.div>
  );
}