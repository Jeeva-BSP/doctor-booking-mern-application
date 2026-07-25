import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService, favoriteService, notificationService } from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Calendar, Clock, Heart, Bell, Plus, UserCheck, Search, Activity } from 'lucide-react';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [apptsRes, favsRes, notifsRes] = await Promise.all([
        appointmentService.getAppointments(),
        favoriteService.getFavorites(),
        notificationService.getNotifications()
      ]);

      if (apptsRes.data.success) setAppointments(apptsRes.data.appointments);
      if (favsRes.data.success) setFavorites(favsRes.data.favorites);
      if (notifsRes.data.success) setNotifications(notifsRes.data.notifications);
    } catch (err) {
      console.error('Patient dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const upcomingAppts = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed');
  const completedAppts = appointments.filter(a => a.status === 'Completed');

  const handleUpdateStatus = async (id, newStatus) => {
    await appointmentService.updateStatus(id, newStatus);
    fetchDashboardData();
  };

  if (loading) return <LoadingSpinner message="Loading patient dashboard..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Patient Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your health appointments, saved doctors, and medical history</p>
        </div>

        <Link
          to="/find-doctors"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:opacity-95 transition-opacity flex items-center justify-center space-x-2 w-fit"
        >
          <Search className="w-4 h-4" />
          <span>Find & Book Doctor</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Upcoming Appointments</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{upcomingAppts.length}</p>
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
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Saved Doctors</p>
            <p className="text-3xl font-extrabold text-rose-500 mt-1">{favorites.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Notifications</p>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{notifications.length}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Appointments vs Quick Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upcoming Appointments */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Appointments</h2>
            <Link to="/patient/my-appointments" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
              View All History ({appointments.length})
            </Link>
          </div>

          {upcomingAppts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {upcomingAppts.map((appt) => (
                <AppointmentCard
                  key={appt.appointment_id}
                  appointment={appt}
                  role="patient"
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-700 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Upcoming Appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have no pending or confirmed doctor visits scheduled. Search for doctors to book a consultation.
              </p>
              <Link
                to="/find-doctors"
                className="inline-block px-4 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-700 transition-colors"
              >
                Find a Doctor
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Favorites & Notifications */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Favorite Doctors Quick Widget */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Favorite Doctors</span>
              </h3>
              <Link to="/patient/favorites" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                View All
              </Link>
            </div>

            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.slice(0, 3).map((fav) => (
                  <div key={fav.favorite_id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <img src={fav.profile_image} alt={fav.doctor_name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{fav.doctor_name}</h4>
                        <p className="text-[10px] text-sky-600 font-medium">{fav.specialization_name}</p>
                      </div>
                    </div>
                    <Link
                      to={`/doctors/${fav.doctor_id}`}
                      className="px-3 py-1.5 bg-sky-600 text-white font-bold text-[11px] rounded-lg shadow hover:bg-sky-700"
                    >
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No saved doctors yet. Click heart on doctor cards to save!</p>
            )}
          </div>

          {/* Notifications Quick Widget */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                <span>Recent Alerts</span>
              </h3>
              <Link to="/patient/notifications" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                Notifications
              </Link>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.notification_id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No recent notifications.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
