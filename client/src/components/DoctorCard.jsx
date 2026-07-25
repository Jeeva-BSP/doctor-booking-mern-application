import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { MapPin, Building2, Award, Calendar, Heart, ShieldCheck, DollarSign } from 'lucide-react';
import { favoriteService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DoctorCard({ doctor, initialIsFavorite = false, onFavoriteToggle = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favLoading, setFavLoading] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') return;

    try {
      setFavLoading(true);
      const res = await favoriteService.toggleFavorite(doctor.doctor_id);
      if (res.data.success) {
        setIsFavorite(res.data.isFavorite);
        if (onFavoriteToggle) onFavoriteToggle(doctor.doctor_id, res.data.isFavorite);
      }
    } catch (err) {
      console.error('Favorite error:', err);
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 group-hover:h-2 transition-all"></div>

      <div>
        {/* Header Header */}
        <div className="flex items-start justify-between space-x-4 mb-4 pt-1">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <img
                src={doctor.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
                alt={doctor.doctor_name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
                }}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-500/20 shadow-inner group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-800" title="Verified Doctor">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {doctor.doctor_name}
                </h3>
              </div>

              <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300">
                {doctor.specialization_name}
              </span>
            </div>
          </div>

          {/* Favorite Heart Toggle */}
          {user?.role === 'patient' && (
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/50 dark:border-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500 dark:bg-slate-700/50 dark:border-slate-600'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Doctor Details */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 my-4 bg-slate-50/80 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-200">
              <Award className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="font-semibold">{doctor.qualifications || 'MBBS, MD'}</span>
            </div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
              {doctor.experience} Yrs Exp.
            </span>
          </div>

          <div className="flex items-center space-x-1.5 truncate">
            <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{doctor.hospital || 'Specialty Hospital'}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 truncate max-w-[65%]">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">{doctor.location}, {doctor.state || 'TN'}</span>
            </div>

            <div className="flex items-center font-bold text-slate-900 dark:text-white text-sm">
              <span className="text-emerald-600 dark:text-emerald-400">₹{doctor.consultation_fee}</span>
              <span className="text-[10px] font-normal text-slate-400 ml-1">/ visit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Rating & CTA Buttons */}
      <div>
        <div className="flex items-center justify-between mb-4 pt-1">
          <StarRating rating={doctor.rating || 4.8} size="sm" />
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Available Slots
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to={`/doctors/${doctor.doctor_id}`}
            className="w-full py-2.5 text-center rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            View Profile
          </Link>

          <Link
            to={`/doctors/${doctor.doctor_id}`}
            className="w-full py-2.5 text-center rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 hover:opacity-95 transition-opacity flex items-center justify-center space-x-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
