import React from 'react';
import { ArrowUpRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { formatNumber } from '../../utils/helpers';
import styles from './WithdrawalOverview.module.css';

interface WithdrawalOverviewProps {
  summary: any;
  onOpenWithdrawal: () => void;
}

export const WithdrawalOverview: React.FC<WithdrawalOverviewProps> = ({ summary, onOpenWithdrawal }) => {
  return (
    <div className={styles.cardBox}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white mb-0 flex items-center gap-2">
          <ArrowUpRight className="text-info" size={20} /> Withdrawal Overview
        </h2>
        <button
          onClick={onOpenWithdrawal}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white btn-sm px-3 font-semibold"
        >
          Request Withdrawal
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="grid-cols-2 md:grid-cols-4">
          <div className={styles.subBox}>
            <span className="text-slate-300 text-xs d-block mb-1">Total Requests</span>
            <span className="text-2xl font-bold text-white font-mono mb-0">{summary?.totalRequests || 0}</span>
          </div>
        </div>
        <div className="grid-cols-2 md:grid-cols-4">
          <div className={styles.subBox}>
            <span className="text-amber-300 text-xs d-block mb-1 flex items-center gap-1">
              <Clock size={14} /> Pending
            </span>
            <span className="text-2xl font-bold text-amber-300 font-mono mb-0">{summary?.pendingRequests || 0}</span>
          </div>
        </div>
        <div className="grid-cols-2 md:grid-cols-4">
          <div className={styles.subBox}>
            <span className="text-emerald-300 text-xs d-block mb-1 flex items-center gap-1">
              <CheckCircle2 size={14} /> Approved
            </span>
            <span className="text-2xl font-bold text-emerald-300 font-mono mb-0">{summary?.approvedRequests || 0}</span>
          </div>
        </div>
        <div className="grid-cols-2 md:grid-cols-4">
          <div className={styles.subBox}>
            <span className="text-rose-300 text-xs d-block mb-1 flex items-center gap-1">
              <XCircle size={14} /> Rejected
            </span>
            <span className="text-2xl font-bold text-rose-300 font-mono mb-0">{summary?.rejectedRequests || 0}</span>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className={`table ${styles.tableDark} align-middle text-xs`}>
          <thead>
            <tr className="text-slate-300 font-mono">
              <th>Asset</th>
              <th>Amount</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {summary?.withdrawals && summary.withdrawals.length > 0 ? (
              summary.withdrawals.map((w: any) => (
                <tr key={w._id}>
                  <td className="font-semibold text-white">{w.assetType}</td>
                  <td className="text-amber-300 font-mono">-{formatNumber(w.amount)}</td>
                  <td className="text-slate-300 text-truncate" style={{ maxWidth: '140px' }}>{w.payoutDetails}</td>
                  <td>
                    <span className={`badge ${
                      w.status === 'approved' ? 'bg-success bg-opacity-15 text-emerald-300 border border-success border-opacity-25' :
                      w.status === 'pending' ? 'bg-warning bg-opacity-15 text-amber-300 border border-warning border-opacity-25' :
                      'bg-danger bg-opacity-15 text-rose-300 border border-danger border-opacity-25'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="text-slate-300 font-mono">{new Date(w.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-slate-300 py-4">
                  No withdrawal requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
