import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';
import { doctorService } from '../../services/api';
import {
  Stethoscope,
  Heart,
  Sparkles,
  Activity,
  Baby,
  Bone,
  Brain,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('all');
  const [location, setLocation] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [specsRes, docsRes] = await Promise.all([
          doctorService.getSpecializations(),
          doctorService.getDoctors({ limit: 4 })
        ]);
        if (specsRes.data.success) setSpecializations(specsRes.data.specializations);
        if (docsRes.data.success) setFeaturedDoctors(docsRes.data.doctors.slice(0, 4));
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (specialization && specialization !== 'all') params.set('specialization', specialization);
    if (location) params.set('location', location);
    navigate(`/find-doctors?${params.toString()}`);
  };

  const getSpecIcon = (iconName) => {
    switch (iconName) {
      case 'Heart': return <Heart className="w-7 h-7 text-rose-500" />;
      case 'Sparkles': return <Sparkles className="w-7 h-7 text-amber-500" />;
      case 'Activity': return <Activity className="w-7 h-7 text-sky-500" />;
      case 'Baby': return <Baby className="w-7 h-7 text-purple-500" />;
      case 'Bone': return <Bone className="w-7 h-7 text-emerald-500" />;
      case 'Brain': return <Brain className="w-7 h-7 text-indigo-500" />;
      default: return <Stethoscope className="w-7 h-7 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-12 pb-20 border-b border-slate-200/60 dark:border-slate-800">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-sky-400/20 via-indigo-400/20 to-emerald-400/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold text-xs mb-6 shadow-sm border border-sky-200 dark:border-sky-800 animate-pulse-glow">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Trusted Healthcare Booking Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Your Health, Our Priority. <br className="hidden md:inline" />
            Find & Book the <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">Right Doctor Easily.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover top-rated specialists, check real-time availability, and secure your clinic or online consultation instantly.
          </p>

          {/* Doctor Search Bar */}
          <div className="max-w-4xl mx-auto">
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
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-14 pt-10 border-t border-slate-200/80 dark:border-slate-800">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">500+</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Verified Doctors</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">10,000+</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Booked Appointments</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">4.9 ★</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Average Patient Rating</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Secure & Confidential</p>
            </div>
          </div>

        </div>
      </section>

      {/* Popular Specializations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Popular Specializations</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Browse medical departments and find specialist doctors</p>
          </div>
          <Link
            to="/find-doctors"
            className="mt-4 md:mt-0 text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1"
          >
            <span>Explore All Specializations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {specializations.slice(0, 6).map((spec) => (
            <Link
              key={spec.specialization_id}
              to={`/find-doctors?specialization=${encodeURIComponent(spec.specialization_name)}`}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-500 transition-all text-center group flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {getSpecIcon(spec.icon)}
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {spec.specialization_name}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1">
                {spec.doctor_count || 0} Doctors
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Top Rated Doctors</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Book consultations with verified, highly experienced doctors</p>
          </div>
          <Link
            to="/find-doctors"
            className="mt-4 md:mt-0 text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching top doctors..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDoctors.map((doc) => (
              <DoctorCard key={doc.doctor_id} doctor={doc} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-slate-100/70 dark:bg-slate-800/40 py-16 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How Book A Doctor Works</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Get expert healthcare in 3 simple, hassle-free steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm relative z-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-inner">
                1
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Find Your Doctor</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Filter by specialization, experience, fee, rating, or clinic location to find the perfect specialist.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm relative z-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-inner">
                2
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Select Date & Time</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Choose an available slot directly on the doctor's live schedule calendar with zero double booking.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm relative z-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-inner">
                3
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Instant Confirmation</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Receive instant status updates and consult with your doctor effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What Our Patients Say</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Real feedback from verified appointments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <StarRating rating={5} showNumeric={false} />
            <p className="text-slate-600 dark:text-slate-300 text-sm italic">
              "Booking Dr. Jenkins for my mother's cardiac checkup took less than 2 minutes. The slot confirmation was instant!"
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-sm">
                JD
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">John Doe</h4>
                <p className="text-xs text-slate-400">Cardiology Patient</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <StarRating rating={5} showNumeric={false} />
            <p className="text-slate-600 dark:text-slate-300 text-sm italic">
              "I was able to filter by dermatology and find Dr. Chen available on a Saturday. Outstanding platform UX!"
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-sm">
                EW
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Emily Watson</h4>
                <p className="text-xs text-slate-400">Dermatology Patient</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <StarRating rating={5} showNumeric={false} />
            <p className="text-slate-600 dark:text-slate-300 text-sm italic">
              "As a practicing doctor, managing my weekly availability and approving appointments in one dashboard is seamless."
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm">
                ER
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dr. Elena Rostova</h4>
                <p className="text-xs text-slate-400">Neurologist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
