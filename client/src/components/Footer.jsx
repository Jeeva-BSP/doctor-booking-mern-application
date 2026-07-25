import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Heart, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Book A <span className="text-sky-400">Doctor</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting patients with trusted medical specialists nationwide. Book instantly, manage health appointments, and consult verified doctors.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Medical Professionals</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-sky-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/find-doctors" className="hover:text-sky-400 transition-colors">Find a Doctor</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sky-400 transition-colors">About Our Platform</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-400 transition-colors">Emergency & Contact</Link>
              </li>
              <li>
                <Link to="/register?role=doctor" className="hover:text-sky-400 transition-colors text-sky-400 font-medium">Join as a Doctor</Link>
              </li>
            </ul>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">Popular Specialties</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Cardiology & Heart Care</li>
              <li>Dermatology & Skin</li>
              <li>Neurology & Brain Health</li>
              <li>Pediatrics & Child Care</li>
              <li>Orthopedics & Joint Care</li>
              <li>General Internal Medicine</li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="font-bold text-white text-base mb-4">Need Assistance?</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <span>100 Health Plaza, Medical District, NY 10001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-sky-400 shrink-0" />
                <span>+1 (800) 555-DOCTOR</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-sky-400 shrink-0" />
                <span>support@bookadoctor.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Book A Doctor Inc. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for healthcare excellence.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
