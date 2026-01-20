import { Quote, Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: "Shikha Yadav",
    role: "UI/UX Design Intern",
    image: "public/shikha.jpg",
    text: "I joined with zero knowledge of Figma. Ideally, I expected just theory, but the mentorship helped me build a complete portfolio project by the end of the month."
  },
  {
    id: 2,
    name: "Aditya Verma",
    role: "Full Stack Developer Intern",
    image: "public/aditya.jpg",
    text: "Building end-to-end solutions taught me the importance of scalable architecture. I moved from writing isolated scripts to architecting robust, production-ready applications that handle real data efficiently."
  },

  {
    id: 3,
    name: "Aryan Maurya",
    role: "Data Science Intern",
    image: "public/aryan.jpg",
    text: "The best part was the project structure. It felt like working in a real company. SwadeshIntern is perfect if you want to test your skills before applying for jobs."
  },
  {
    id: 4,
    name: "Priya Singh",
    role: "App Development Intern",
    image: "public/priya.jpg",
    text: "Supportive community and clear instructions. I built a functional weather app and learned how to deploy it. A genuine learning experience."
  },
  {
    id: 5,
    name: "Kaustubh Sharma",
    role: "DevOps Intern",
    image: "public/kaustubh.jpg",
    text: "Setting up automated CI/CD pipelines and managing cloud infrastructure was a game changer. I moved beyond basic scripts to deploying scalable applications in a real production environment."
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#F8FAFC] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12 text-center">
        
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-6">
          <Star size={14} className="fill-orange-500 text-orange-500" />
          <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Real Feedback</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
          Internship <span className="text-orange-500">Experiences</span>
        </h2>
        
        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
          See what our interns have to say about their skill growth, project work, and overall journey with SwadeshIntern.
        </p>
      </div>

      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none hidden md:block"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none hidden md:block"></div>

        <div className="flex w-max gap-6 animate-scroll hover:pause-animation py-4">
          {[...reviews, ...reviews].map((review, index) => (
            <div 
              key={index}
              className="w-[350px] md:w-[450px] bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] shrink-0 transition-transform hover:scale-[1.02] duration-300"
            >
              <Quote className="text-orange-100 fill-orange-50 mb-6" size={48} />
              <p className="text-slate-600 text-lg leading-relaxed font-medium mb-8">{review.text}</p>
              
              <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                <img 
                  src={review.image} 
                  alt={review.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="font-black text-slate-900 text-base">{review.name}</h4>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mt-1">
                    {review.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}