import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Contact & Support</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Have questions or need assistance? Reach out to our healthcare support team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        <div className="md:col-span-5 bg-gradient-to-br from-sky-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl space-y-6">
          <h3 className="font-bold text-xl">Get in Touch</h3>
          <p className="text-sky-100 text-xs leading-relaxed">
            Our medical helpdesk operates 24/7 for technical assistance, appointment inquiries, and platform feedback.
          </p>

          <div className="space-y-4 pt-4 text-xs">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-sky-300" />
              <span>100 Health Plaza, Medical District, New York, NY 10001</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-sky-300" />
              <span>+1 (800) 555-DOCTOR</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-sky-300" />
              <span>support@bookadoctor.com</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">Message Sent!</h3>
              <p className="text-xs text-slate-500">Thank you for reaching out. A healthcare representative will respond within 2 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Send Us a Message</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <textarea
                required
                rows="4"
                placeholder="How can we assist you?"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              ></textarea>
              <button
                type="submit"
                className="w-full py-3 bg-sky-600 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-700 transition-colors flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
