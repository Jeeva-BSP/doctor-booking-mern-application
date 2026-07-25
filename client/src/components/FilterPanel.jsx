import React from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Star, Award, DollarSign, Calendar } from 'lucide-react';

export default function FilterPanel({
  maxFee,
  setMaxFee,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  minExperience,
  setMinExperience,
  minRating,
  setMinRating,
  availableDay,
  setAvailableDay,
  sortBy,
  setSortBy,
  onReset
}) {
  const indianStates = [
    'Tamil Nadu',
    'Maharashtra',
    'Karnataka',
    'Delhi NCR',
    'Telangana',
    'Kerala',
    'West Bengal',
    'Gujarat',
    'Rajasthan',
    'Punjab & Haryana'
  ];

  const tnDistrictsList = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul',
    'Erode', 'Kallakurichi', 'Kancheepuram', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'The Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram',
    'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi',
    'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai',
    'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar', 'Kanniyakumari'
  ];

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Filter & Sort</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All</span>
        </button>
      </div>

      {/* State Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Indian State
        </label>
        <select
          value={selectedState || 'all'}
          onChange={(e) => setSelectedState && setSelectedState(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="all">All States / UTs</option>
          {indianStates.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* District / City Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          District / City (Tamil Nadu Hub)
        </label>
        <select
          value={selectedDistrict || 'all'}
          onChange={(e) => setSelectedDistrict && setSelectedDistrict(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="all">All Districts & Cities</option>
          <optgroup label="Tamil Nadu Districts">
            {tnDistrictsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          Sort Results By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="rating">Highest Rated</option>
          <option value="experience">Most Experienced</option>
          <option value="fee_low">Consultation Fee: Low to High</option>
          <option value="fee_high">Consultation Fee: High to Low</option>
        </select>
      </div>

      {/* Maximum Consultation Fee (₹500 - ₹1000) */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          <span className="uppercase tracking-wider">Max Fee (₹)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">₹{maxFee}</span>
        </div>
        <input
          type="range"
          min="500"
          max="1000"
          step="50"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-bold">
          <span>₹500</span>
          <span>₹1,000</span>
        </div>
      </div>

      {/* Minimum Experience */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Minimum Experience
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 5, 10, 15].map((exp) => (
            <button
              key={exp}
              onClick={() => setMinExperience(exp)}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                minExperience === exp
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {exp === 0 ? 'Any' : `${exp}+ Yrs`}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Minimum Star Rating
        </label>
        <div className="flex items-center space-x-1.5">
          {[0, 4.0, 4.5, 4.8].map((rate) => (
            <button
              key={rate}
              onClick={() => setMinRating(rate)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                minRating === rate
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>{rate === 0 ? 'Any' : `${rate}+`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Working Day Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Available Day
        </label>
        <select
          value={availableDay}
          onChange={(e) => setAvailableDay(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
        >
          <option value="">Any Working Day</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
        </select>
      </div>

    </div>
  );
}
