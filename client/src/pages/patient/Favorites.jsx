import React, { useState, useEffect } from 'react';
import { favoriteService } from '../../services/api';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Heart } from 'lucide-react';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteService.getFavorites();
      if (res.data.success) {
        setFavorites(res.data.favorites);
      }
    } catch (err) {
      console.error('Fetch favorites error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (doctorId, isFav) => {
    if (!isFav) {
      setFavorites(favorites.filter(f => f.doctor_id !== doctorId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <span>My Favorite Doctors</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Quick access to your saved medical specialists</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching favorite doctors..." />
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((doc) => (
            <DoctorCard
              key={doc.doctor_id}
              doctor={doc}
              initialIsFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Favorite Doctors Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Click the heart icon on any doctor card to save them to your favorites list.</p>
        </div>
      )}
    </div>
  );
}
