import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coins, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiFetch, readApiJson } from '../../utils/api';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('alex@veloop.io');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { username, email, password, referralCode };

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readApiJson<{ error?: string; token: string; user: User }>(res);
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      navigate('/user-profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('alex@veloop.io');
    setPassword('password123');
    setIsLogin(true);
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#161827] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#1E293B] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center font-extrabold text-slate-950 text-xl mx-auto mb-3 shadow-lg">
            VE
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome Back to VELoop' : 'Create Member Account'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin ? 'Sign in to access your rewards & profile dashboard' : 'Join the premier gamified rewards platform'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Alex Vance"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@veloop.io"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Referral Code (Optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={e => setReferralCode(e.target.value)}
                placeholder="e.g. ALEX2026"
                className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {isLogin && (
          <div className="mt-4">
            <button
              onClick={fillDemoUser}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Load Demo Credentials (alex@veloop.io)
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-400 pt-6 border-t border-slate-800">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-amber-400 font-semibold hover:underline"
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/admin/login" className="text-[11px] text-slate-500 hover:text-slate-300 underline">
            Go to Admin Login Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
