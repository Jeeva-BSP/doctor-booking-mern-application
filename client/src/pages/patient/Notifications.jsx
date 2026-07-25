import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Bell, CheckCheck, Clock } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshNotifications } = useAuth();

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Notifs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markRead('all');
    fetchNotifs();
    refreshNotifications();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
            <Bell className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            <span>Notifications</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Appointment updates and account alerts</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors flex items-center space-x-1.5"
        >
          <CheckCheck className="w-4 h-4 text-emerald-500" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching notifications..." />
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.notification_id}
              className={`p-5 rounded-2xl border transition-all ${
                n.is_read
                  ? 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 opacity-75'
                  : 'bg-sky-50/60 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
        </div>
      )}
    </div>
  );
}
