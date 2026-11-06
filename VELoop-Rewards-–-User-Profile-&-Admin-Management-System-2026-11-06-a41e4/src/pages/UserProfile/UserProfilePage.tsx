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
import { GmailIntegration } from '../../components/GmailIntegration/GmailIntegration';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

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
        fetch('/api/profile/me', { headers }),
        fetch('/api/profile/rewards', { headers }),
        fetch('/api/profile/level-progress', { headers }),
        fetch('/api/profile/achievements', { headers }),
        fetch('/api/profile/withdrawal-summary', { headers }),
        fetch('/api/profile/referrals', { headers }),
        fetch('/api/profile/activity', { headers }),
      ]);

      if (resProfile.ok) {
        const d = await resProfile.json();
        setProfileData(d.user);
        setWalletData(d.wallet);
      }
      if (resLevel.ok) setLevelData(await resLevel.json());
      if (resAch.ok) setAchievements((await resAch.json()).achievements);
      if (resWith.ok) setWithdrawalSummary(await resWith.json());
      if (resRef.ok) setReferralsData(await resRef.json());
      if (resAct.ok) setActivities((await resAct.json()).activities);
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
      const res = await fetch('/api/profile/withdraw', {
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
        const d = await res.json();
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
      <div className="min-h-[calc(100vh-73px)] bg-[#161827] flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-mono">Loading VELoop Profile Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid min-h-[calc(100vh-73px)] text-slate-100 px-4 py-6 sm:px-6 md:px-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toastMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col gap-3 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-400">Member command center</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Your rewards, in motion.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Track your balance, progress, and the next useful action from one focused view.</p>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Live account overview</div>
        </header>

        {/* Profile Hero Section */}
        <ProfileHero user={profileData} levelData={levelData} onCopyToast={showToast} />

        {/* Reward Assets Section */}
        <div id="rewards">
          <RewardAssets wallet={walletData || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0 }} onActionClick={handleQuickAction} />
        </div>

        {/* Quick Actions */}
        <QuickActions onActionClick={handleQuickAction} />

        {/* Level Progression & Achievements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LevelProgress levelData={levelData} />
          <AchievementCard achievements={achievements} />
        </div>

        {/* Withdrawal Overview */}
        <div id="withdrawals">
          <WithdrawalOverview summary={withdrawalSummary} onOpenWithdrawal={() => setShowWithdrawModal(true)} />
        </div>

        {/* Referral Snapshot */}
        <div id="referrals">
          <ReferralSnapshot referrals={referralsData} onCopyToast={showToast} />
        </div>

        {/* Gmail Integration Section */}
        <GmailIntegration />

        {/* Recent Activity */}
        <RecentActivity activities={activities} />
      </div>

      {/* Withdrawal Request Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Request Asset Withdrawal</h3>
            <p className="text-xs text-slate-400 mb-6">Convert your platform earnings to external wallet or account.</p>

            {withdrawSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-semibold">
                Withdrawal request submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                {withdrawError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    {withdrawError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Type</label>
                  <select
                    value={withdrawAsset}
                    onChange={e => setWithdrawAsset(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="VE">VE (VELoop Earnings)</option>
                    <option value="SVE">SVE (Silver Vault Earnings)</option>
                    <option value="Gems">Gems</option>
                    <option value="Tokens">Platform Tokens</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination Payout Address / Account</label>
                  <input
                    type="text"
                    required
                    value={payoutDetails}
                    onChange={e => setPayoutDetails(e.target.value)}
                    placeholder="e.g. 0x71C...392A or bank account"
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg mt-2"
                >
                  Submit Withdrawal Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
