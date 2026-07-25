import React from 'react';
import { Search, MapPin, Stethoscope, ArrowRight } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  specialization,
  setSpecialization,
  location,
  setLocation,
  specializations = [],
  onSearch
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-2xl p-2.5 shadow-xl border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center transition-all"
    >
      {/* Doctor Name Search */}
      <div className="md:col-span-4 relative flex items-center">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search doctor name or clinic..."
          className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
        />
      </div>

      {/* Specialization Dropdown */}
      <div className="md:col-span-4 relative flex items-center">
        <Stethoscope className="w-5 h-5 text-slate-400 absolute left-3.5" />
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="w-full pl-11 pr-8 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:outline-none appearance-none transition-all cursor-pointer"
        >
          <option value="all">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec.specialization_id} value={spec.specialization_name}>
              {spec.specialization_name} ({spec.doctor_count || 0})
            </option>
          ))}
        </select>
      </div>

      {/* Location Input */}
      <div className="md:col-span-3 relative flex items-center">
        <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="District, city, or state (e.g. Chennai, Salem)..."
          className="w-full pl-11 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
        />
      </div>

      {/* Submit Search Button */}
      <div className="md:col-span-1">
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center shadow-lg shadow-sky-500/25 hover:opacity-95 transition-opacity"
          title="Search Doctors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
