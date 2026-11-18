import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ProfileHero } from '../../components/ProfileHero/ProfileHero';
import { RewardAssets } from '../../components/RewardAssets/RewardAssets';
import { LevelProgress } from '../../components/LevelProgress/LevelProgress';
import { AchievementCard } from '../../components/AchievementCard/AchievementCard';
import { WithdrawalOverview } from '../../components/WithdrawalOverview/WithdrawalOverview';
import { ReferralSnapshot } from '../../components/ReferralSnapshot/ReferralSnapshot';
import { RecentActivity } from '../../components/RecentActivity/RecentActivity';
import { QuickActions } from '../../components/QuickActions/QuickActions';
import { X, CheckCircle2 } from 'lucide-react';
import { apiFetch, readApiJson } from '../../utils/api';
import styles from './UserProfilePage.module.css';

export const UserProfilePage: React.FC = () => {
  const { token } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [levelData, setLevelData] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [withdrawalSummary, setWithdrawalSummary] = useState<any>(null);
  const [referralsData, setReferralsData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Withdrawal modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAsset, setWithdrawAsset] = useState('VE');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resProfile, resRewards, resLevel, resAch, resWith, resRef, resAct] = await Promise.all([
        apiFetch('/api/profile/me', { headers }),
        apiFetch('/api/profile/rewards', { headers }),
        apiFetch('/api/profile/level-progress', { headers }),
        apiFetch('/api/profile/achievements', { headers }),
        apiFetch('/api/profile/withdrawal-summary', { headers }),
        apiFetch('/api/profile/referrals', { headers }),
        apiFetch('/api/profile/activity', { headers }),
      ]);

      if (resProfile.ok) {
        const d = await readApiJson<any>(resProfile);
        setProfileData(d.user);
        setWalletData(d.wallet);
      }
      if (resLevel.ok) setLevelData(await readApiJson<any>(resLevel));
      if (resAch.ok) setAchievements((await readApiJson<any>(resAch)).achievements);
      if (resWith.ok) setWithdrawalSummary(await readApiJson<any>(resWith));
      if (resRef.ok) setReferralsData(await readApiJson<any>(resRef));
      if (resAct.ok) setActivities((await readApiJson<any>(resAct)).activities);
    } catch (err) {
      console.error('Error fetching profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleQuickAction = (actionKey: string) => {
    if (actionKey === 'withdraw') {
      setShowWithdrawModal(true);
    } else if (actionKey === 'refer') {
      showToast('Share your referral link to invite friends and earn rewards!');
    } else {
      showToast(`Action triggered: ${actionKey}. Keep exploring VELoop!`);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    try {
      const res = await apiFetch('/api/profile/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          assetType: withdrawAsset,
          amount: Number(withdrawAmount),
          payoutDetails
        })
      });

      if (!res.ok) {
        const d = await readApiJson<{ error?: string }>(res);
        throw new Error(d.error || 'Withdrawal failed');
      }

      setWithdrawSuccess(true);
      showToast('Withdrawal request submitted successfully!');
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawSuccess(false);
        setWithdrawAmount('');
        setPayoutDetails('');
        fetchData();
      }, 1500);
    } catch (err: any) {
      setWithdrawError(err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingInner}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading VELoop profile dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast} role="status">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      <div className={styles.content}>
        <header className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Member command center</p>
            <h1 className={styles.heading}>Your rewards, in motion.</h1>
            <p className={styles.lede}>Track your balance, progress, and the next useful action from one focused view.</p>
          </div>
          <div className={styles.liveMark}>Live account overview</div>
        </header>

        <div className={styles.stack}>
          <ProfileHero user={profileData} levelData={levelData} onCopyToast={showToast} />
          <div id="rewards">
            <RewardAssets wallet={walletData || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0 }} onActionClick={handleQuickAction} />
          </div>
          <QuickActions onActionClick={handleQuickAction} />
          <div className={styles.split}>
            <LevelProgress levelData={levelData} />
            <AchievementCard achievements={achievements} />
          </div>
          <div id="withdrawals">
            <WithdrawalOverview summary={withdrawalSummary} onOpenWithdrawal={() => setShowWithdrawModal(true)} />
          </div>
          <div id="referrals">
            <ReferralSnapshot referrals={referralsData} onCopyToast={showToast} />
          </div>
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div className={styles.modalBackdrop} role="presentation">
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="withdraw-title">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className={styles.modalClose}
              aria-label="Close withdrawal dialog"
            >
              <X size={18} />
            </button>

            <h2 id="withdraw-title" className={styles.modalTitle}>Request asset withdrawal</h2>
            <p className={styles.modalCopy}>Convert your platform earnings to an external wallet or account.</p>

            {withdrawSuccess ? (
              <div className={styles.success}>
                Withdrawal request submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className={styles.form}>
                {withdrawError && (
                  <div className={styles.error} role="alert">
                    {withdrawError}
                  </div>
                )}
                <div className={styles.field}>
                  <label htmlFor="withdraw-asset" className={styles.label}>Asset type</label>
                  <select
                    id="withdraw-asset"
                    value={withdrawAsset}
                    onChange={e => setWithdrawAsset(e.target.value)}
                    className={styles.input}
                  >
                    <option value="VE">VE (VELoop Earnings)</option>
                    <option value="SVE">SVE (Silver Vault Earnings)</option>
                    <option value="Gems">Gems</option>
                    <option value="Tokens">Platform Tokens</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="withdraw-amount" className={styles.label}>Amount</label>
                  <input
                    id="withdraw-amount"
                    type="number"
                    required
                    min="1"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 250"
                    className={`${styles.input} ${styles.mono}`}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="payout-details" className={styles.label}>Destination payout address / account</label>
                  <input
                    id="payout-details"
                    type="text"
                    required
                    value={payoutDetails}
                    onChange={e => setPayoutDetails(e.target.value)}
                    placeholder="e.g. 0x71C...392A or bank account"
                    className={`${styles.input} ${styles.mono}`}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.submit}
                >
                  Submit Withdrawal Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
