import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Lock, Mail, AlertCircle, ShieldCheck, UserCheck, Activity } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      if (data.success) {
        if (redirect) {
          navigate(redirect);
          return;
        }
        if (data.user.role === 'patient') navigate('/patient/dashboard');
        else if (data.user.role === 'doctor') navigate('/doctor/dashboard');
        else if (data.user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // One-click Demo Credentials helper
  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-md shadow-sky-500/20">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Log in to manage appointments & healthcare</p>
        </div>

        {/* Demo Credentials Section */}
        <div className="bg-sky-50/70 dark:bg-sky-950/40 p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/60 space-y-2">
          <p className="text-[11px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider text-center">
            ⚡ Quick Demo Accounts (One-Click Test)
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => handleQuickDemo('patient@example.com', 'password123')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 rounded-xl text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('doctor@bookadoctor.com', 'password123')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@bookadoctor.com', 'admin123')}
              className="py-1.5 px-2 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-sky-500/25 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>

        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-sky-600 dark:text-sky-400 hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
