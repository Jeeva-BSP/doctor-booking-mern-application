import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ShieldCheck, Users, Calendar, Stethoscope, Clock, CheckCircle2, Award, Plus, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingDoctors()
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pendingRes.data.success) setPendingDoctors(pendingRes.data.pendingDoctors);
    } catch (err) {
      console.error('Admin dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerification = async (doctorId, status) => {
    await adminService.updateDoctorVerification(doctorId, status);
    fetchAdminData();
  };

  if (loading) return <LoadingSpinner message="Loading admin analytics & approval queue..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Platform overview, doctor verification requests, and user statistics</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/approvals"
            className="px-4 py-2.5 bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow hover:bg-amber-600 transition-colors flex items-center space-x-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({pendingDoctors.length})</span>
          </Link>
          <Link
            to="/admin/specializations"
            className="px-4 py-2.5 bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow hover:bg-sky-700 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Specializations</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Patients</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats?.totalPatients || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">Registered Patient Accounts</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Approved Doctors</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{stats?.approvedDoctors || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">Publicly Listed Doctors</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Pending Doctors</p>
          <p className="text-3xl font-extrabold text-amber-500 mt-1">{stats?.pendingDoctors || 0}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-1">Awaiting Admin Verification</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Total Appointments</p>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{stats?.totalAppointments || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">Platform Consultations</p>
        </div>

      </div>

      {/* Main Grid: Pending Doctor Registrations & Quick Admin Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Doctor Approval Queue */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Pending Doctor Verification Queue</span>
            </h2>
            <Link to="/admin/approvals" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
              View Queue
            </Link>
          </div>

          {pendingDoctors.length > 0 ? (
            <div className="space-y-4">
              {pendingDoctors.map((doc) => (
                <div key={doc.doctor_id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img src={doc.profile_image} alt={doc.doctor_name} className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{doc.doctor_name}</h3>
                      <p className="text-xs text-sky-600 font-semibold">{doc.specialization_name} • {doc.experience} Yrs Exp.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualifications} | {doc.hospital}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleVerification(doc.doctor_id, 'approved')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(doc.doctor_id, 'rejected')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs rounded-xl hover:bg-rose-200 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-700 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">All Clear!</h3>
              <p className="text-xs text-slate-400">No doctor verification requests pending right now.</p>
            </div>
          )}
        </div>

        {/* Right Column: Quick Navigation Tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Management Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-sky-50 transition-colors group"
              >
                <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600">Manage Users (Patients & Doctors)</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
              </Link>

              <Link
                to="/admin/appointments"
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-sky-50 transition-colors group"
              >
                <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600">Manage Platform Appointments</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
              </Link>

              <Link
                to="/admin/specializations"
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl hover:bg-sky-50 transition-colors group"
              >
                <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600">Manage Specializations (CRUD)</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
