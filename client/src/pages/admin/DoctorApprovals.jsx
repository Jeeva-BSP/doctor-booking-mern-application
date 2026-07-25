import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Clock, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function DoctorApprovals() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPendingDoctors();
      if (res.data.success) {
        setPendingDoctors(res.data.pendingDoctors);
      }
    } catch (err) {
      console.error('Fetch pending error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleVerification = async (doctorId, status) => {
    try {
      const res = await adminService.updateDoctorVerification(doctorId, status);
      if (res.data.success) {
        setMessage(`Doctor registration ${status} successfully.`);
        fetchPending();
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
          <Clock className="w-8 h-8 text-amber-500" />
          <span>Doctor Approval Requests</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review newly registered doctors before granting public booking access</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold">✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Fetching pending doctor registrations..." />
      ) : pendingDoctors.length > 0 ? (
        <div className="space-y-4">
          {pendingDoctors.map((doc) => (
            <div key={doc.doctor_id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex items-start space-x-4">
                <img
                  src={doc.profile_image}
                  alt={doc.doctor_name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';
                  }}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-sky-500/20"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{doc.doctor_name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                      {doc.specialization_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{doc.qualifications} • {doc.experience} Years Experience</p>
                  <p className="text-xs text-slate-500">{doc.hospital} ({doc.location}, {doc.state || 'TN'}) • Email: {doc.email} • Fee: ₹{doc.consultation_fee}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button
                  onClick={() => handleVerification(doc.doctor_id, 'approved')}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Doctor</span>
                </button>
                <button
                  onClick={() => handleVerification(doc.doctor_id, 'rejected')}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs rounded-xl hover:bg-rose-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Pending Registrations</h3>
          <p className="text-xs text-slate-500 mt-1">All doctor registrations have been reviewed.</p>
        </div>
      )}
    </div>
  );
}
