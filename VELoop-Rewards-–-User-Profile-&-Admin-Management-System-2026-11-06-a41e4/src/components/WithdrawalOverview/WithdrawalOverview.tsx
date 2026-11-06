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
      <div className="d-flex align-items-center justify-between mb-4">
        <h2 className="h5 fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <ArrowUpRight className="text-info" size={20} /> Withdrawal Overview
        </h2>
        <button
          onClick={onOpenWithdrawal}
          className="btn btn-primary btn-sm px-3 fw-semibold"
        >
          Request Withdrawal
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className={styles.subBox}>
            <span className="text-muted small d-block mb-1">Total Requests</span>
            <span className="h4 fw-bold text-white font-monospace mb-0">{summary?.totalRequests || 0}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className={styles.subBox}>
            <span className="text-warning small d-block mb-1 d-flex align-items-center gap-1">
              <Clock size={14} /> Pending
            </span>
            <span className="h4 fw-bold text-warning font-monospace mb-0">{summary?.pendingRequests || 0}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className={styles.subBox}>
            <span className="text-success small d-block mb-1 d-flex align-items-center gap-1">
              <CheckCircle2 size={14} /> Approved
            </span>
            <span className="h4 fw-bold text-success font-monospace mb-0">{summary?.approvedRequests || 0}</span>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className={styles.subBox}>
            <span className="text-danger small d-block mb-1 d-flex align-items-center gap-1">
              <XCircle size={14} /> Rejected
            </span>
            <span className="h4 fw-bold text-danger font-monospace mb-0">{summary?.rejectedRequests || 0}</span>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className={`table ${styles.tableDark} align-middle small`}>
          <thead>
            <tr className="text-muted font-monospace">
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
                  <td className="fw-semibold text-white">{w.assetType}</td>
                  <td className="text-warning font-monospace">-{formatNumber(w.amount)}</td>
                  <td className="text-muted text-truncate" style={{ maxWidth: '140px' }}>{w.payoutDetails}</td>
                  <td>
                    <span className={`badge ${
                      w.status === 'approved' ? 'bg-success bg-opacity-15 text-success border border-success border-opacity-25' :
                      w.status === 'pending' ? 'bg-warning bg-opacity-15 text-warning border border-warning border-opacity-25' :
                      'bg-danger bg-opacity-15 text-danger border border-danger border-opacity-25'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="text-muted font-monospace">{new Date(w.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
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
