import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Clock, Save, CheckCircle2, Calendar } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ManageAvailability() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Schedule matrix state: { [day]: { enabled: boolean, start_time: string, end_time: string, duration: number } }
  const [schedule, setSchedule] = useState(() => {
    const initial = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day] = { enabled: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day), start_time: '09:00', end_time: '17:00', duration: 30 };
    });
    return initial;
  });

  useEffect(() => {
    if (!user?.doctor_id) {
      setLoading(false);
      return;
    }
    doctorService.getDoctorById(user.doctor_id).then(res => {
      if (res.data.success && res.data.doctor.availability) {
        const availList = res.data.doctor.availability;
        const newSched = { ...schedule };
        DAYS_OF_WEEK.forEach(day => {
          const match = availList.find(a => a.day === day);
          if (match) {
            newSched[day] = {
              enabled: true,
              start_time: match.start_time,
              end_time: match.end_time,
              duration: match.appointment_duration || 30
            };
          } else {
            newSched[day] = { ...newSched[day], enabled: false };
          }
        });
        setSchedule(newSched);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleToggleDay = (day) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled }
    });
  };

  const handleChange = (day, field, value) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], [field]: value }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const activeSchedule = Object.keys(schedule)
        .filter(day => schedule[day].enabled)
        .map(day => ({
          day,
          start_time: schedule[day].start_time,
          end_time: schedule[day].end_time,
          appointment_duration: parseInt(schedule[day].duration)
        }));

      const res = await doctorService.updateAvailability(activeSchedule);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Update availability error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading availability schedule..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
          <Clock className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          <span>Manage Working Availability</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Set your working days, consultation hours, and slot duration for live patient booking.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Availability schedule saved and synchronized with live calendar!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
        
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                schedule[day].enabled
                  ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700'
                  : 'bg-slate-100/50 dark:bg-slate-900/20 border-slate-200/50 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`day-${day}`}
                  checked={schedule[day].enabled}
                  onChange={() => handleToggleDay(day)}
                  className="w-5 h-5 accent-sky-600 rounded cursor-pointer"
                />
                <label htmlFor={`day-${day}`} className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer min-w-24">
                  {day}
                </label>
              </div>

              {schedule[day].enabled ? (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-semibold">Start:</span>
                    <input
                      type="time"
                      value={schedule[day].start_time}
                      onChange={(e) => handleChange(day, 'start_time', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-semibold">End:</span>
                    <input
                      type="time"
                      value={schedule[day].end_time}
                      onChange={(e) => handleChange(day, 'end_time', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="text-slate-500 font-semibold">Slot:</span>
                    <select
                      value={schedule[day].duration}
                      onChange={(e) => handleChange(day, 'duration', e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                    >
                      <option value="15">15 Mins</option>
                      <option value="30">30 Mins</option>
                      <option value="45">45 Mins</option>
                      <option value="60">60 Mins</option>
                    </select>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Day Off (Unavailable)</span>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-sky-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/20 hover:bg-sky-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving Schedule...' : 'Save Availability Schedule'}</span>
        </button>

      </form>
    </div>
  );
}
