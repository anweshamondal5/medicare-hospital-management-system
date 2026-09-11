import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cross, Lock, Mail, ShieldAlert, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (role: UserRole) => {
    if (role === 'ADMIN') {
      setEmail('admin@medicare.demo');
      setPassword('Admin@123');
    } else if (role === 'DOCTOR') {
      setEmail('doctor@medicare.demo');
      setPassword('Doctor@123');
    } else {
      setEmail('reception@medicare.demo');
      setPassword('Reception@123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-teal-600 text-white shadow-xl shadow-teal-600/30">
            <Cross className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">MediCare HMS</h2>
          <p className="text-xs text-slate-500 font-medium">Hospital Management & Database Portal</p>
        </div>

        {/* 1-Click Demo Accounts Pre-fill Box */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Evaluation Mode: 1-Click Role Login</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Click any demo role below to automatically pre-fill validated test credentials:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('ADMIN')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-bold text-slate-700 transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('DOCTOR')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-bold text-slate-700 transition"
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('RECEPTIONIST')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-bold text-slate-700 transition"
            >
              Receptionist
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@medicare.demo"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with bcrypt & JWT authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
};
