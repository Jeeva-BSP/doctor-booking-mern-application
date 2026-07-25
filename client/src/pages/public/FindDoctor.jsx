import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { doctorService, favoriteService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Frown } from 'lucide-react';

export default function FindDoctor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  // Filter States
  const [maxFee, setMaxFee] = useState(1000);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [minExperience, setMinExperience] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [availableDay, setAvailableDay] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch Specializations & Favorites on mount
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const specRes = await doctorService.getSpecializations();
        if (specRes.data.success) setSpecializations(specRes.data.specializations);

        if (user && user.role === 'patient') {
          const favRes = await favoriteService.getFavorites();
          if (favRes.data.success) {
            setFavoriteIds(new Set(favRes.data.favorites.map(f => f.doctor_id)));
          }
        }
      } catch (err) {
        console.error('Fetch specs/favs error:', err);
      }
    };
    fetchInit();
  }, [user]);

  // Fetch Doctors with API Search & Filter parameters
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        specialization: specialization,
        location: selectedDistrict !== 'all' ? selectedDistrict : location,
        state: selectedState !== 'all' ? selectedState : undefined,
        maxFee: maxFee < 1000 ? maxFee : undefined,
        minExperience: minExperience > 0 ? minExperience : undefined,
        minRating: minRating > 0 ? minRating : undefined,
        day: availableDay || undefined,
        sortBy: sortBy
      };

      const res = await doctorService.getDoctors(params);
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      console.error('Fetch doctors error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization, selectedState, selectedDistrict, maxFee, minExperience, minRating, availableDay, sortBy]);

  const handleSearchSubmit = () => {
    fetchDoctors();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSpecialization('all');
    setLocation('');
    setSelectedState('all');
    setSelectedDistrict('all');
    setMaxFee(1000);
    setMinExperience(0);
    setMinRating(0);
    setAvailableDay('');
    setSortBy('rating');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Find & Book a Doctor</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Search from top verified doctors, check live availability, and schedule your appointment.
        </p>
      </div>

      {/* Main Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        specialization={specialization}
        setSpecialization={setSpecialization}
        location={location}
        setLocation={setLocation}
        specializations={specializations}
        onSearch={handleSearchSubmit}
      />

      {/* Content Layout: Filter Sidebar + Doctor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Filter Panel Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-24">
          <FilterPanel
            maxFee={maxFee}
            setMaxFee={setMaxFee}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            minExperience={minExperience}
            setMinExperience={setMinExperience}
            minRating={minRating}
            setMinRating={setMinRating}
            availableDay={availableDay}
            setAvailableDay={setAvailableDay}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onReset={handleResetFilters}
          />
        </div>

        {/* Doctor Results List */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Showing <span className="text-sky-600 dark:text-sky-400">{doctors.length}</span> Verified Doctors
            </span>
            <span className="text-xs text-slate-500">Sorted by {sortBy.replace('_', ' ')}</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Searching SQL database for doctors..." />
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc.doctor_id}
                  doctor={doc}
                  initialIsFavorite={favoriteIds.has(doc.doctor_id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Frown className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Doctors Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No doctors matched your exact search or filter criteria. Try adjusting your search filters or fee limits.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
