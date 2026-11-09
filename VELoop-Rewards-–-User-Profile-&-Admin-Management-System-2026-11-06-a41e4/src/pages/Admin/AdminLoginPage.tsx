import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiFetch, readApiJson } from '../../utils/api';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@veloop.io');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await readApiJson<{ error?: string; token: string; admin: any }>(res);
      if (!res.ok) {
        throw new Error(data.error || 'Admin authentication failed');
      }

      adminLogin(data.token, data.admin);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@veloop.io');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#161827] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E293B] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Management Console</h1>
          <p className="text-xs text-slate-400 mt-1">Protected administrative portal for VELoop Rewards</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@veloop.io"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={fillDemoAdmin}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-400 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" /> Load Demo Admin Credentials
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 pt-6 border-t border-slate-800">
          <Link to="/login" className="text-amber-400 font-semibold hover:underline">
            Return to Member Login
          </Link>
        </div>
      </div>
    </div>
  );
};
