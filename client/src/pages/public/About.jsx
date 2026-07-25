import React from 'react';
import { Stethoscope, ShieldCheck, Award, Heart, Users, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-xs">
          <Stethoscope className="w-4 h-4" />
          <span>About Book A Doctor</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Empowering Healthcare Through Technology
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
          Book A Doctor is a modern online healthcare ecosystem designed to seamlessly connect patients with certified medical specialists, streamline appointment scheduling, and deliver transparent healthcare experiences.
        </p>
      </div>

      {/* Core Features / Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Admin-Verified Doctors</h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            Every medical practitioner on our platform undergoes strict credentials review before public listing.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Atomic Slot Protection</h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            Our SQL database layer prevents double bookings and guarantees live calendar availability.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Verified Patient Reviews</h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
            Only patients with confirmed completed appointments can leave rating reviews, ensuring true quality feedback.
          </p>
        </div>
      </div>

    </div>
  );
}
