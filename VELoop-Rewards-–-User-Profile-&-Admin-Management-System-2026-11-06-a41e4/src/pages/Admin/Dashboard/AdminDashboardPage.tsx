import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, Coins, ArrowUpRight, Shield, Activity, Search, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { formatNumber } from '../../../utils/helpers';

export const AdminDashboardPage: React.FC = () => {
  const { adminToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'withdrawals' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Reward adjustment modal state
  const [adjustModalUser, setAdjustModalUser] = useState<any>(null);
  const [adjustAsset, setAdjustAsset] = useState('VE');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAdminData = async () => {
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [resStats, resUsers, resWith, resAudit] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/withdrawals', { headers }),
        fetch('/api/admin/audit-logs', { headers })
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resUsers.ok) setUsers((await resUsers.json()).users);
      if (resWith.ok) setWithdrawals((await resWith.json()).withdrawals);
      if (resAudit.ok) setAuditLogs((await resAudit.json()).logs);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchAdminData();
    }
  }, [adminToken]);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`User status updated to ${newStatus}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status, rejectionReason: status === 'rejected' ? 'Administrative policy rejection' : undefined })
      });
      if (res.ok) {
        showToast(`Withdrawal marked as ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update withdrawal', err);
    }
  };

  const handleRewardAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser) return;

    try {
      const res = await fetch('/api/admin/rewards/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          userId: adjustModalUser._id,
          assetType: adjustAsset,
          amount: Number(adjustAmount),
          reason: adjustReason
        })
      });

      if (res.ok) {
        showToast('Wallet balance adjusted successfully');
        setAdjustModalUser(null);
        setAdjustAmount('');
        setAdjustReason('');
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to adjust rewards', err);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#161827] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-mono">Loading Admin Management Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#161827] text-slate-100 p-6 md:p-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-blue-400" /> {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" /> Admin Control Center
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage platform users, verify reward transactions, and process withdrawals</p>
          </div>
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Platform Overview' },
            { id: 'users', label: 'User Management' },
            { id: 'withdrawals', label: 'Withdrawal Approvals' },
            { id: 'audit', label: 'Audit Logs' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-md">
                <span className="text-xs text-slate-400 block mb-1">Total Users</span>
                <span className="text-3xl font-extrabold text-white font-mono">{stats?.totalUsers || 0}</span>
                <span className="text-[11px] text-emerald-400 block mt-2">{stats?.activeUsers || 0} Active members</span>
              </div>
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-md">
                <span className="text-xs text-slate-400 block mb-1">Total VEs Distributed</span>
                <span className="text-3xl font-extrabold text-amber-400 font-mono">{formatNumber(stats?.totalVe)}</span>
                <span className="text-[11px] text-slate-400 block mt-2">Across all user wallets</span>
              </div>
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-md">
                <span className="text-xs text-slate-400 block mb-1">Total Platform Tokens</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">{formatNumber(stats?.totalTokens)}</span>
                <span className="text-[11px] text-slate-400 block mt-2">Governance liquidity</span>
              </div>
              <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 shadow-md">
                <span className="text-xs text-slate-400 block mb-1">Pending Withdrawals</span>
                <span className="text-3xl font-extrabold text-blue-400 font-mono">{stats?.pendingWithdrawals || 0}</span>
                <span className="text-[11px] text-amber-400 block mt-2">Requires admin approval</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS */}
        {activeTab === 'users' && (
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white">Registered Users ({filteredUsers.length})</h2>
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                    <th className="pb-3 px-3">User</th>
                    <th className="pb-3 px-3">VE Balance</th>
                    <th className="pb-3 px-3">Tokens</th>
                    <th className="pb-3 px-3">Level</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-sans">
                        <span className="font-semibold text-white block">{u.username}</span>
                        <span className="text-slate-400 text-[11px]">{u.email}</span>
                      </td>
                      <td className="py-3 px-3 text-amber-400">{formatNumber(u.wallet?.veBalance)} VEs</td>
                      <td className="py-3 px-3 text-emerald-400">{formatNumber(u.wallet?.tokensBalance)}</td>
                      <td className="py-3 px-3 text-indigo-400">Lvl {u.wallet?.currentLevel || 1}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                          u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2 font-sans">
                        <button
                          onClick={() => setAdjustModalUser(u)}
                          className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors text-[11px]"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handleStatusChange(u._id, u.status === 'active' ? 'suspended' : 'active')}
                          className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                            u.status === 'active' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAWALS */}
        {activeTab === 'withdrawals' && (
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-white">Withdrawal Approval Queue</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400">
                    <th className="pb-3 px-3">User</th>
                    <th className="pb-3 px-3">Asset</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Destination</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {withdrawals && withdrawals.length > 0 ? (
                    withdrawals.map(w => (
                      <tr key={w._id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-sans">
                          <span className="font-semibold text-white block">{w.userId?.username || 'User'}</span>
                          <span className="text-slate-400 text-[11px]">{w.userId?.email}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">{w.assetType}</td>
                        <td className="py-3 px-3 text-amber-400">-{formatNumber(w.amount)}</td>
                        <td className="py-3 px-3 text-slate-300 truncate max-w-[150px]">{w.payoutDetails}</td>
                        <td className="py-3 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                            w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            w.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2 font-sans">
                          {w.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleWithdrawalAction(w._id, 'approved')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors text-[11px] font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleWithdrawalAction(w._id, 'rejected')}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors text-[11px] font-semibold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                        No withdrawal requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <h2 className="text-lg font-bold text-white">System Administration Audit Logs</h2>

            <div className="space-y-3">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map(log => (
                  <div key={log._id} className="bg-[#0F172A]/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-amber-400 font-mono">{log.action}</span>
                        <span className="text-slate-400">Target: {log.targetModel}</span>
                      </div>
                      <p className="text-slate-200">{log.changesSummary}</p>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No audit logs recorded yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reward Adjustment Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setAdjustModalUser(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Adjust Wallet Balance</h3>
            <p className="text-xs text-slate-400 mb-6">User: {adjustModalUser.username} ({adjustModalUser.email})</p>

            <form onSubmit={handleRewardAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Type</label>
                <select
                  value={adjustAsset}
                  onChange={e => setAdjustAsset(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="VE">VE (Earnings)</option>
                  <option value="SVE">SVE (Silver Vault)</option>
                  <option value="Gems">Gems</option>
                  <option value="Tokens">Platform Tokens</option>
                  <option value="XP">Experience Points (XP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adjustment Amount (+ or -)</label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 100 or -50"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Administrative Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Bonus compensation for event participation"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg mt-2"
              >
                Confirm Balance Adjustment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
