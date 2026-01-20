import { useState } from "react";
import { Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/cepinew277@ixospace.com",
        {
          method: "POST",
          body: data,
        }
      );

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">
              Get In <span className="text-orange-500">Touch</span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Have questions about our internship disciplines? Send us a message
              and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                  <MapPin />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Location
                  </p>
                  <p className="font-black">Noida, Uttar Pradesh</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="bg-green-100 p-3 rounded-lg text-green-600">
                  <Mail />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">
                    Email
                  </p>
                  <p className="font-black">swadeshintern@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="bg-white p-8 lg:p-12 rounded-[40px] shadow-2xl border border-gray-100 min-h-[500px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* FORM SUBMIT CONFIG */}
                  <input
                    type="hidden"
                    name="_subject"
                    value="New Contact Message - SwadeshIntern"
                  />
                  <input type="hidden" name="_template" value="table" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input
                    type="hidden"
                    name="_from"
                    value="SwadeshIntern Contact Form"
                  />
                  <input
                    type="text"
                    name="_honey"
                    style={{ display: "none" }}
                  />

                  {/* NAME */}
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                      placeholder="Your Name"
                    />
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold"
                      placeholder="Email"
                    />
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none font-bold"
                      placeholder="Your message..."
                    />
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                    <Send size={20} />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="thank-you"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4">
                    Message Sent!
                  </h3>
                  <p className="text-gray-500 font-bold mb-8">
                    Thank you for reaching out. Our team will respond shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-orange-500 font-black hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
