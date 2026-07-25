import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';
import { Calendar, Clock, CheckCircle2, AlertCircle, Settings, Users, Star, ShieldCheck } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments();
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Doctor appts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const pendingRequests = appointments.filter(a => a.status === 'Pending');
  const confirmedAppts = appointments.filter(a => a.status === 'Confirmed');
  const completedAppts = appointments.filter(a => a.status === 'Completed');

  const handleUpdateStatus = async (id, status) => {
    await appointmentService.updateStatus(id, status);
    fetchDoctorAppointments();
  };

  if (loading) return <LoadingSpinner message="Loading doctor dashboard & patient appointments..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Verification Notice if Pending Admin Approval */}
      {user?.verification_status === 'pending' && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 rounded-3xl flex items-start space-x-4">
          <AlertCircle className="w-7 h-7 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-base text-amber-900 dark:text-amber-200">Registration Pending Admin Approval</h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Your doctor account was registered successfully and is currently being reviewed by the platform administrator. Once approved, your profile will be publicly visible to patients for slot booking.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Doctor Dashboard</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              user?.verification_status === 'approved'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}>
              {user?.verification_status || 'approved'}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage consultation requests, patient schedules, and working hours</p>
        </div>

        <Link
          to="/doctor/availability"
          className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2 w-fit"
        >
          <Settings className="w-4 h-4" />
          <span>Manage Availability</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Pending Requests</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{pendingRequests.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Confirmed Appts</p>
            <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">{confirmedAppts.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Completed Visits</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{completedAppts.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Rating</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{user?.rating ? user.rating.toFixed(1) : '4.9'} ★</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
            <Star className="w-6 h-6 fill-current" />
          </div>
        </div>

      </div>

      {/* Appointment Requests Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient Appointment Requests & Schedule</h2>
          <span className="text-xs font-semibold text-slate-500">Total: {appointments.length} Appointments</span>
        </div>

        {appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.appointment_id}
                appointment={appt}
                role="doctor"
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Appointment Requests Yet</h3>
            <p className="text-xs text-slate-500 mt-1">When patients book consultations on your profile, requests will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
