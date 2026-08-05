import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, User, Stethoscope, ShieldCheck } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllUsers().then(res => {
      if (res.data.success) {
        setUsers(res.data.users);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
            <Users className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            <span>Manage Platform Users</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View all patients, doctors, and system administrators</p>
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'patient', 'doctor', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterRole === r
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching user directory..." />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase font-bold text-slate-400">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone / Contact</th>
                  <th className="p-4">Specialization / Status</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 flex items-center space-x-3">
                      <img
                        src={u.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'}
                        alt={u.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400';
                        }}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-sky-500/20"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'doctor' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{u.phone || 'N/A'}</td>
                    <td className="p-4">
                      {u.role === 'doctor' ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{u.specialization_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.verification_status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {u.verification_status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Active Patient</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
