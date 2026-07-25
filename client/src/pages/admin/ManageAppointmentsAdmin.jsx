import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Calendar } from 'lucide-react';

export default function ManageAppointmentsAdmin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments();
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Admin appts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    await appointmentService.updateStatus(id, status);
    fetchAllAppointments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          <span>All Platform Appointments</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Admin oversight for all patient-doctor bookings nationwide</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching platform appointments..." />
      ) : appointments.length > 0 ? (
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
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Appointments Recorded</h3>
          <p className="text-xs text-slate-500 mt-1">Appointments booked across the system will be displayed here.</p>
        </div>
      )}
    </div>
  );
}
