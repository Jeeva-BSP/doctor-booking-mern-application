import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService, appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Award,
  DollarSign,
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slotsInfo, setSlotsInfo] = useState({ available: false, slots: [], message: '' });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getDoctorById(id);
        if (res.data.success) {
          setDoctor(res.data.doctor);
        }
      } catch (err) {
        console.error('Fetch doctor profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Fetch available slots when selectedDate changes
  useEffect(() => {
    if (!id || !selectedDate) return;
    const fetchSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedTime('');
        setErrorMessage('');
        const res = await appointmentService.getSlots(id, selectedDate);
        if (res.data.success) {
          setSlotsInfo(res.data);
        }
      } catch (err) {
        console.error('Fetch slots error:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [id, selectedDate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/doctors/${id}`));
      return;
    }

    if (user.role !== 'patient') {
      setErrorMessage('Doctor or Admin accounts cannot book patient appointments. Please log in as a Patient.');
      return;
    }

    if (!selectedTime) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    try {
      setBookingLoading(true);
      const res = await appointmentService.createAppointment({
        doctor_id: parseInt(id),
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason: reason
      });

      if (res.data.success) {
        setBookingSuccess(true);
        // Refresh slots
        const slotsRes = await appointmentService.getSlots(id, selectedDate);
        if (slotsRes.data.success) setSlotsInfo(slotsRes.data);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading doctor profile & schedule..." />;
  if (!doctor) return <div className="text-center py-20 font-bold text-slate-500">Doctor not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner / Doctor Summary Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <img
              src={doctor.profile_image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
              alt={doctor.doctor_name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
              }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover ring-4 ring-sky-500/20 shadow-md"
            />
            <span className="absolute -bottom-2 -right-2 p-1 rounded-full bg-emerald-500 text-white ring-4 ring-white dark:ring-slate-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {doctor.doctor_name}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {doctor.specialization_name}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-500" />
              <span>{doctor.qualifications}</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{doctor.experience} Years Experience</span>
            </p>

            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center space-x-1">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span>{doctor.hospital}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{doctor.location}, {doctor.state || 'Tamil Nadu'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-3">
              <StarRating rating={doctor.rating || 4.8} size="md" />
              <span className="text-xs text-slate-400">({doctor.reviews?.length || 0} Verified Reviews)</span>
            </div>
          </div>
        </div>

        {/* Consultation Fee Card */}
        <div className="w-full md:w-auto bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-center space-y-1">
          <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Consultation Fee</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{doctor.consultation_fee}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Includes OPD & Consultation</p>
        </div>

      </div>

      {/* Main Grid: Doctor Profile & Reviews vs Interactive Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Doctor Bio, Languages, Availability, & Reviews */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* About Doctor */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">About Doctor</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {doctor.about || 'Dedicated specialist providing comprehensive patient care and medical consultations.'}
            </p>
            
            <div className="pt-3 flex items-center space-x-2 text-xs font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-700">
              <Globe className="w-4 h-4 text-sky-500" />
              <span>Languages Spoken: <strong className="text-slate-900 dark:text-white">{doctor.languages || 'English'}</strong></span>
            </div>
          </div>

          {/* Working Days & Schedule */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Working Hours & Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctor.availability && doctor.availability.length > 0 ? (
                doctor.availability.map((avail) => (
                  <div key={avail.availability_id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white">{avail.day}</span>
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">{avail.start_time} - {avail.end_time}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 col-span-2">Monday to Friday: 09:00 AM - 05:00 PM</p>
              )}
            </div>
          </div>

          {/* Patient Reviews Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <span>Patient Reviews ({doctor.reviews?.length || 0})</span>
              </h3>
              <StarRating rating={doctor.rating || 4.8} size="sm" />
            </div>

            {doctor.reviews && doctor.reviews.length > 0 ? (
              <div className="space-y-4">
                {doctor.reviews.map((rev) => (
                  <div key={rev.review_id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={rev.patient_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'}
                          alt={rev.patient_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.patient_name}</span>
                      </div>
                      <StarRating rating={rev.rating} size="xs" showNumeric={false} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">{rev.comment}</p>
                    <p className="text-[10px] text-slate-400 text-right">{new Date(rev.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No patient reviews yet. Be the first to review after your consultation!</p>
            )}
          </div>

        </div>

        {/* Right Column: APPOINTMENT BOOKING WORKFLOW */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-sky-500/40 dark:border-sky-500/30 shadow-xl space-y-6">
            
            <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                <span>Book Appointment</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select date & available time slot</p>
            </div>

            {bookingSuccess ? (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-lg text-emerald-900 dark:text-emerald-200">Appointment Requested!</h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Your appointment request for <strong className="underline">{selectedDate}</strong> at <strong className="underline">{selectedTime}</strong> has been submitted to {doctor.doctor_name}.
                </p>
                <div className="pt-2 flex flex-col space-y-2">
                  <button
                    onClick={() => navigate('/patient/dashboard')}
                    className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700 transition-colors"
                  >
                    View My Appointments
                  </button>
                  <button
                    onClick={() => setBookingSuccess(false)}
                    className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Book Another Slot
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-5">
                
                {errorMessage && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 1. Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    1. Select Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* 2. Live Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      2. Available Time Slots ({slotsInfo.day || ''})
                    </label>
                    {slotsInfo.available && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">● Doctor Working</span>
                    )}
                  </div>

                  {loadingSlots ? (
                    <div className="py-6 text-center text-xs text-slate-400 animate-pulse">Checking slot availability...</div>
                  ) : !slotsInfo.available ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 text-amber-700 dark:text-amber-300 text-xs text-center font-medium">
                      {slotsInfo.message || 'Doctor is not available on this date.'}
                    </div>
                  ) : slotsInfo.slots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {slotsInfo.slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                            slot.isBooked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed line-through'
                              : selectedTime === slot.time
                              ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/25 ring-2 ring-sky-400'
                              : 'bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No slots available for this date.</p>
                  )}
                </div>

                {/* 3. Reason for Visit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    3. Reason for Appointment
                  </label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or consultation reason..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  ></textarea>
                </div>

                {/* Confirm Booking Button */}
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedTime || !slotsInfo.available}
                  className="w-full py-3.5 bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/25 hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {bookingLoading ? (
                    <span>Booking Appointment...</span>
                  ) : (
                    <>
                      <span>Confirm & Book Appointment</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  🔒 Safe & confidential booking. Double booking is automatically prevented.
                </p>

              </form>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
