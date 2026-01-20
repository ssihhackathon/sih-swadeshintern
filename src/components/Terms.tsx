import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-20 bg-white min-h-screen"
    >
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8">
          Terms & <span className="text-green-600">Conditions</span>
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-4">Internship Enrollment</h2>
            <p>
              By applying to SwadeshIntern, you agree to provide accurate and truthful information. Any falsification of academic records or identity will lead to immediate disqualification from our programs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-green-500 pl-4">Task Submission & Certification</h2>
            <p>
              Certificates are only issued to interns who successfully complete all assigned tasks within the specified timeline and meet our quality standards. These certificates are MSME recognized and verified.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-orange-500 pl-4">Code of Conduct</h2>
            <p>
              Interns are expected to maintain professional integrity. Plagiarism in project submissions is strictly prohibited and will result in the cancellation of the internship without certification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-green-500 pl-4">Modifications</h2>
            <p>
              SwadeshIntern reserves the right to modify these terms or the structure of the internship domains at any time to align with industry requirements.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}