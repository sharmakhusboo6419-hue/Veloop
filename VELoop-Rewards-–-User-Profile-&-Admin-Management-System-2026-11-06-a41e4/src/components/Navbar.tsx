import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Lock } from 'lucide-react';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { user, token, isAdmin, adminUser, logout, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className={`sticky top-0 z-40 ${styles.navbarCustom}`}>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={isAdminRoute ? '/admin/dashboard' : '/user-profile'} className="flex min-w-0 items-center gap-2 no-underline">
          <div className={styles.brandLogo}>
            VE
          </div>
          <div>
            <span className="block text-sm font-bold text-white sm:text-base">VELoop Rewards</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-amber-400">{isAdminRoute ? 'Admin Console' : 'Member Portal'}</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isAdminRoute ? (
            token && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden text-right sm:block">
                  <span className="block text-sm font-semibold text-white">{user.username}</span>
                  <span className="font-mono text-[10px] text-slate-400">Code: {user.referralCode}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-600"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500">
                  Sign In
                </Link>
                <Link to="/admin/login" className="flex items-center gap-1 rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-600">
                  <Lock size={12} /> Admin
                </Link>
              </div>
            )
          ) : (
            isAdmin && adminUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden text-right sm:block">
                  <span className="block text-sm font-semibold text-white">{adminUser.username}</span>
                  <span className="font-mono text-[10px] text-amber-400">Role: {adminUser.role}</span>
                </div>
                <button
                  onClick={handleAdminLogout}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-600"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300">
                Admin Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
