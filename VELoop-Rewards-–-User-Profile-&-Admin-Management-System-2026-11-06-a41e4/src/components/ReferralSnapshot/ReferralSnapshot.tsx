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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white mb-0 flex items-center gap-2">
          <Users className="text-emerald-300" size={20} /> Referral Snapshot
        </h2>
        <span className="badge font-mono bg-success bg-opacity-10 text-emerald-300 border border-success border-opacity-25 px-3 py-1">
          Code: {referrals?.referralCode || 'REF2026'}
        </span>
      </div>

      <div className={`${styles.subBox} flex flex-column flex-sm-row align-items-sm-center justify-between gap-3 mb-4`}>
        <div>
          <span className="text-slate-300 text-xs d-block mb-1">Your Referral Link</span>
          <span className="text-xs font-mono text-emerald-300">{referralLink}</span>
        </div>
        <button
          onClick={() => {
            copyToClipboard(referralLink);
            onCopyToast('Referral link copied to clipboard!');
          }}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs flex items-center gap-1.5 font-semibold"
        >
          <Copy size={14} /> Copy Link
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="grid">
          <div className={styles.subBox}>
            <span className="text-slate-300 text-xs d-block mb-1">Total Referrals</span>
            <span className="text-2xl font-bold text-white font-mono mb-0">{referrals?.totalReferrals || 0}</span>
          </div>
        </div>
        <div className="grid">
          <div className={styles.subBox}>
            <span className="text-slate-300 text-xs d-block mb-1">Rewards Earned</span>
            <span className="text-2xl font-bold text-amber-300 font-mono mb-0">{formatNumber(referrals?.totalRewardsEarned)} VEs</span>
          </div>
        </div>
        <div className="grid">
          <div className={styles.subBox}>
            <span className="text-slate-300 text-xs d-block mb-1">XP Earned</span>
            <span className="text-2xl font-bold text-blue-300 font-mono mb-0">+{formatNumber(referrals?.totalXpEarned)} XP</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs text-slate-300 uppercase font-bold mb-3">Referred Members</h3>
        {referrals?.referralsList && referrals.referralsList.length > 0 ? (
          <div className="space-y-2">
            {referrals.referralsList.map((ref: any) => (
              <div key={ref._id} className={`${styles.subBox} flex items-center justify-between p-3`}>
                <div className="flex items-center gap-3">
                  <div className="bg-success bg-opacity-25 text-emerald-300 rounded-2 p-2 font-bold">
                    {ref.referredUserId?.username?.[0] || 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-white d-block text-xs">{ref.referredUserId?.username || 'Member'}</span>
                    <span className="text-slate-300 text-xs">{ref.referredUserId?.email || 'user@veloop.io'}</span>
                  </div>
                </div>
                <div className="text-end font-mono text-xs">
                  <span className="text-emerald-300 font-semibold d-block">+{ref.rewardEarned} VEs</span>
                  <span className="text-slate-300">{new Date(ref.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-300 text-xs py-4">
            No referrals yet. Share your link to start earning rewards!
          </div>
        )}
      </div>
    </div>
  );
};
