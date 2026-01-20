import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 bg-white min-h-screen"
    >
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8">
          Privacy <span className="text-orange-500">Policy</span>
        </h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-8 leading-relaxed">
          <section>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Last Updated: January 2026</p>
            <p>
              At SwadeshIntern, we prioritize the privacy of our applicants and interns. This Privacy Policy document contains types of information that is collected and recorded by SwadeshIntern and how we use it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-green-500 pl-4">Information Collection</h2>
            <p>
              When you apply for an internship via our application forms, we collect personal details such as your full name, email address, contact number, and academic qualifications to process your selection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-4">Use of Data</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process your internship application and verify credentials.</li>
              <li>Communicate with you regarding task submissions and evaluations.</li>
              <li>Issue MSME-certified completion certificates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-green-500 pl-4">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}