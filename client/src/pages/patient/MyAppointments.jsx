import React, { useState, useEffect } from 'react';
import { appointmentService, reviewService } from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import { Calendar, Clock, RefreshCw, Star, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newTime, setNewTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAppt, setReviewAppt] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments({ status: activeTab });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Fetch appts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      setMessage(`Appointment ${status.toLowerCase()} successfully.`);
      fetchAppointments();
    } catch (err) {
      setErrorMsg('Failed to update appointment status.');
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (appt) => {
    setSelectedAppt(appt);
    setNewDate(appt.appointment_date);
    setNewTime('');
    setRescheduleModalOpen(true);
    fetchSlotsForReschedule(appt.doctor_id, appt.appointment_date);
  };

  const fetchSlotsForReschedule = async (doctorId, date) => {
    try {
      const res = await appointmentService.getSlots(doctorId, date);
      if (res.data.success) {
        setAvailableSlots(res.data.slots || []);
      }
    } catch (e) {
      setAvailableSlots([]);
    }
  };

  const handleDateChangeForReschedule = (e) => {
    const d = e.target.value;
    setNewDate(d);
    if (selectedAppt) {
      fetchSlotsForReschedule(selectedAppt.doctor_id, d);
    }
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!newTime) {
      setErrorMsg('Please select a new time slot.');
      return;
    }
    try {
      setRescheduleLoading(true);
      const res = await appointmentService.reschedule(selectedAppt.appointment_id, newDate, newTime);
      if (res.data.success) {
        setRescheduleModalOpen(false);
        setMessage('Appointment rescheduled successfully!');
        fetchAppointments();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Open Review Modal
  const handleOpenReview = (appt) => {
    setReviewAppt(appt);
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      setReviewLoading(true);
      const res = await reviewService.createReview({
        appointment_id: reviewAppt.appointment_id,
        doctor_id: reviewAppt.doctor_id,
        rating: reviewRating,
        comment: reviewComment
      });

      if (res.data.success) {
        setReviewModalOpen(false);
        setMessage('Review submitted successfully!');
        fetchAppointments();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to post review.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Appointments</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track upcoming, completed, and rescheduled doctor consultations</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-2">
        {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching appointments..." />
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.appointment_id}
              appointment={appt}
              role="patient"
              onUpdateStatus={handleUpdateStatus}
              onOpenReschedule={handleOpenReschedule}
              onOpenReview={handleOpenReview}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Appointments Found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no appointments matching the selected filter status.</p>
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal isOpen={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} title="Reschedule Appointment">
        {selectedAppt && (
          <form onSubmit={handleConfirmReschedule} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rescheduling appointment with <strong>{selectedAppt.doctor_name}</strong>
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">New Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={handleDateChangeForReschedule}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">New Time Slot</label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableSlots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={s.isBooked}
                    onClick={() => setNewTime(s.time)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      s.isBooked
                        ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                        : newTime === s.time
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={rescheduleLoading || !newTime}
              className="w-full py-3 bg-sky-600 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-700 disabled:opacity-50"
            >
              {rescheduleLoading ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </form>
        )}
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Write Doctor Review">
        {reviewAppt && (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <p className="text-xs text-slate-500">
              Share your experience with <strong>{reviewAppt.doctor_name}</strong>
            </p>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Rating</label>
              <StarRating rating={reviewRating} onRatingChange={(val) => setReviewRating(val)} size="lg" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Feedback Comment</label>
              <textarea
                rows="4"
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Write your review here..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={reviewLoading}
              className="w-full py-3 bg-amber-500 text-white font-bold text-xs rounded-xl shadow hover:bg-amber-600 disabled:opacity-50"
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </Modal>

    </div>
  );
}
