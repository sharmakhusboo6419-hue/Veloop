import React from 'react';
import { Users, Copy } from 'lucide-react';
import { copyToClipboard, formatNumber } from '../../utils/helpers';
import styles from './ReferralSnapshot.module.css';

interface ReferralSnapshotProps {
  referrals: any;
  onCopyToast: (msg: string) => void;
}

export const ReferralSnapshot: React.FC<ReferralSnapshotProps> = ({ referrals, onCopyToast }) => {
  const referralLink = `${window.location.origin}/login?ref=${referrals?.referralCode || 'REF2026'}`;

  return (
    <div className={styles.cardBox}>
      <div className="d-flex align-items-center justify-between mb-4">
        <h2 className="h5 fw-bold text-white mb-0 d-flex align-items-center gap-2">
          <Users className="text-success" size={20} /> Referral Snapshot
        </h2>
        <span className="badge font-monospace bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1">
          Code: {referrals?.referralCode || 'REF2026'}
        </span>
      </div>

      <div className={`${styles.subBox} d-flex flex-column flex-sm-row align-items-sm-center justify-between gap-3 mb-4`}>
        <div>
          <span className="text-muted small d-block mb-1">Your Referral Link</span>
          <span className="small font-monospace text-success">{referralLink}</span>
        </div>
        <button
          onClick={() => {
            copyToClipboard(referralLink);
            onCopyToast('Referral link copied to clipboard!');
          }}
          className="btn btn-success btn-sm px-3 d-flex align-items-center gap-1.5 fw-semibold"
        >
          <Copy size={14} /> Copy Link
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className={styles.subBox}>
            <span className="text-muted small d-block mb-1">Total Referrals</span>
            <span className="h4 fw-bold text-white font-monospace mb-0">{referrals?.totalReferrals || 0}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className={styles.subBox}>
            <span className="text-muted small d-block mb-1">Rewards Earned</span>
            <span className="h4 fw-bold text-warning font-monospace mb-0">{formatNumber(referrals?.totalRewardsEarned)} VEs</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className={styles.subBox}>
            <span className="text-muted small d-block mb-1">XP Earned</span>
            <span className="h4 fw-bold text-primary font-monospace mb-0">+{formatNumber(referrals?.totalXpEarned)} XP</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="small text-muted text-uppercase fw-bold mb-3">Referred Members</h3>
        {referrals?.referralsList && referrals.referralsList.length > 0 ? (
          <div className="space-y-2">
            {referrals.referralsList.map((ref: any) => (
              <div key={ref._id} className={`${styles.subBox} d-flex align-items-center justify-between p-3`}>
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-success bg-opacity-25 text-success rounded-2 p-2 fw-bold">
                    {ref.referredUserId?.username?.[0] || 'U'}
                  </div>
                  <div>
                    <span className="fw-semibold text-white d-block small">{ref.referredUserId?.username || 'Member'}</span>
                    <span className="text-muted small">{ref.referredUserId?.email || 'user@veloop.io'}</span>
                  </div>
                </div>
                <div className="text-end font-monospace small">
                  <span className="text-success fw-semibold d-block">+{ref.rewardEarned} VEs</span>
                  <span className="text-muted">{new Date(ref.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted small py-4">
            No referrals yet. Share your link to start earning rewards!
          </div>
        )}
      </div>
    </div>
  );
};
