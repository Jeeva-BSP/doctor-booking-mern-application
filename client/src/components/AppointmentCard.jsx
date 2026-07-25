import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, RefreshCw, Star, FileText } from 'lucide-react';
import StarRating from './StarRating';

export default function AppointmentCard({
  appointment,
  role = 'patient',
  onUpdateStatus = null,
  onOpenReschedule = null,
  onOpenReview = null
}) {
  const [loading, setLoading] = useState(false);

  const statusConfig = {
    Pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Clock,
      label: 'Pending Approval'
    },
    Confirmed: {
      bg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      icon: CheckCircle2,
      label: 'Confirmed'
    },
    Completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
      label: 'Completed'
    },
    Cancelled: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      icon: XCircle,
      label: 'Cancelled'
    },
    Rejected: {
      bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: AlertCircle,
      label: 'Declined'
    }
  };

  const currentStatus = statusConfig[appointment.status] || statusConfig.Pending;
  const StatusIcon = currentStatus.icon;

  const handleStatusChange = async (newStatus) => {
    if (!onUpdateStatus) return;
    setLoading(true);
    try {
      await onUpdateStatus(appointment.appointment_id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      
      <div>
        {/* Header with Date/Time & Status */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/80 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex flex-col items-center justify-center text-sky-700 dark:text-sky-300 font-bold shrink-0">
              <span className="text-[10px] uppercase font-extrabold tracking-wider">{new Date(appointment.appointment_date + 'T00:00:00').toLocaleString('default', { month: 'short' })}</span>
              <span className="text-lg leading-none">{new Date(appointment.appointment_date + 'T00:00:00').getDate()}</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>{appointment.appointment_date}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>{appointment.appointment_time}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Appt ID: #{appointment.appointment_id}
              </p>
            </div>
          </div>

          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentStatus.bg}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{currentStatus.label}</span>
          </span>
        </div>

        {/* Counterpart Information */}
        <div className="flex items-center space-x-3.5 mb-4">
          <img
            src={role === 'patient' ? appointment.doctor_image : appointment.patient_image}
            alt={role === 'patient' ? appointment.doctor_name : appointment.patient_name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = role === 'patient'
                ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';
            }}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-sky-500/20"
          />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {role === 'patient' ? appointment.doctor_name : appointment.patient_name}
            </h4>
            <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
              {role === 'patient' ? `${appointment.specialization_name} • ${appointment.hospital}` : `Gender: ${appointment.gender || 'N/A'}`}
            </p>
          </div>
        </div>

        {/* Reason / Medical Notes */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 mb-4">
          <div className="flex items-center space-x-1.5 text-slate-500 font-semibold mb-1">
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            <span>Reason for Visit:</span>
          </div>
          <p className="italic">{appointment.reason || 'General health consultation'}</p>
        </div>

        {/* Review snippet if completed & reviewed */}
        {appointment.rating && (
          <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-amber-800 dark:text-amber-300">Your Review:</span>
              <StarRating rating={appointment.rating} size="xs" showNumeric={false} />
            </div>
            <p className="text-amber-900/80 dark:text-amber-200">{appointment.comment}</p>
          </div>
        )}
      </div>

      {/* Action Buttons based on Role & Status */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
        {/* DOCTOR ACTIONS */}
        {role === 'doctor' && appointment.status === 'Pending' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatusChange('Confirmed')}
              disabled={loading}
              className="py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition-colors"
            >
              Accept Appointment
            </button>
            <button
              onClick={() => handleStatusChange('Rejected')}
              disabled={loading}
              className="py-2 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-200 transition-colors"
            >
              Decline
            </button>
          </div>
        )}

        {role === 'doctor' && appointment.status === 'Confirmed' && (
          <button
            onClick={() => handleStatusChange('Completed')}
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Consultation Completed</span>
          </button>
        )}

        {/* PATIENT ACTIONS */}
        {role === 'patient' && (appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenReschedule && onOpenReschedule(appointment)}
              className="py-2 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-semibold hover:bg-sky-100 transition-colors flex items-center justify-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reschedule</span>
            </button>

            <button
              onClick={() => handleStatusChange('Cancelled')}
              disabled={loading}
              className="py-2 bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              Cancel Appointment
            </button>
          </div>
        )}

        {role === 'patient' && appointment.status === 'Completed' && !appointment.rating && (
          <button
            onClick={() => onOpenReview && onOpenReview(appointment)}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 hover:opacity-95 transition-opacity flex items-center justify-center space-x-1.5"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Write Doctor Review</span>
          </button>
        )}
      </div>

    </div>
  );
}
