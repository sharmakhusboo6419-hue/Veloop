import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { LevelConfig } from '../models/LevelConfig.js';
import { Achievement } from '../models/Achievement.js';
import { UserAchievement } from '../models/UserAchievement.js';
import { Referral } from '../models/Referral.js';
import { Withdrawal } from '../models/Withdrawal.js';
import { ActivityLog } from '../models/ActivityLog.js';

/**
 * Get user profile and wallet
 */
export const getProfileMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      user,
      wallet: wallet || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0, currentLevel: 1 }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfileMe = async (req, res, next) => {
  try {
    const { username } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { ...(username && { username }) },
      { new: true }
    ).select('-passwordHash');

    res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reward assets and transactions
 */
export const getRewards = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    const transactions = await WalletTransaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.status(200).json({
      success: true,
      wallet: wallet || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0 },
      transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get level progression
 */
export const getLevelProgress = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    const currentLevelNum = wallet?.currentLevel || 1;
    const currentXp = wallet?.xpBalance || 0;

    const currentLevelConfig = await LevelConfig.findOne({ levelNumber: currentLevelNum });
    const nextLevelConfig = await LevelConfig.findOne({ levelNumber: currentLevelNum + 1 });

    const requiredXp = nextLevelConfig ? nextLevelConfig.xpThreshold : currentLevelConfig?.xpThreshold || 10000;
    const levelName = currentLevelConfig?.levelName || 'Novice';
    const nextLevelName = nextLevelConfig?.levelName || 'Max Level';
    const remainingXp = Math.max(0, requiredXp - currentXp);
    const progressPercent = Math.min(100, Math.round((currentXp / requiredXp) * 100));

    res.status(200).json({
      success: true,
      currentLevel: currentLevelNum,
      levelName,
      currentXp,
      requiredXp,
      remainingXp,
      progressPercent,
      nextLevelName
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user achievements
 */
export const getAchievements = async (req, res, next) => {
  try {
    const allAchievements = await Achievement.find({ isActive: true });
    const userUnlocked = await UserAchievement.find({ userId: req.user.id });
    const unlockedMap = new Map(userUnlocked.map(ua => [ua.achievementId.toString(), ua]));

    const achievements = allAchievements.map(ach => {
      const unlocked = unlockedMap.get(ach._id.toString());
      return {
        id: ach._id,
        title: ach.title,
        description: ach.description,
        badgeUrl: ach.badgeUrl,
        xpReward: ach.xpReward,
        isUnlocked: !!unlocked,
        unlockedAt: unlocked ? unlocked.unlockedAt : null,
        progress: unlocked ? 100 : 25
      };
    });

    res.status(200).json({ success: true, achievements });
  } catch (error) {
    next(error);
  }
};

/**
 * Get withdrawal summary and history
 */
export const getWithdrawalSummary = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const totalRequests = withdrawals.length;
    const pendingRequests = withdrawals.filter(w => w.status === 'pending').length;
    const approvedRequests = withdrawals.filter(w => w.status === 'approved').length;
    const rejectedRequests = withdrawals.filter(w => w.status === 'rejected' || w.status === 'failed').length;
    const totalSuccessfullyWithdrawn = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);

    res.status(200).json({
      success: true,
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalSuccessfullyWithdrawn,
      withdrawals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request a new withdrawal
 */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { assetType, amount, payoutDetails } = req.body;
    const numAmount = Number(amount);

    if (!assetType || !numAmount || numAmount <= 0 || !payoutDetails) {
      return res.status(400).json({ success: false, error: 'Please provide valid assetType, positive amount, and payout destination.' });
    }

    if (!['VE', 'SVE', 'Gems', 'Tokens'].includes(assetType)) {
      return res.status(400).json({ success: false, error: 'Invalid asset type for withdrawal. XP cannot be withdrawn.' });
    }

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found.' });
    }

    const key = `${assetType.toLowerCase()}Balance`;
    const curBal = Number(wallet[key]) || 0;
    if (curBal < numAmount) {
      return res.status(400).json({ success: false, error: `Insufficient ${assetType} balance. You have ${curBal} ${assetType}.` });
    }

    wallet[key] = curBal - numAmount;
    await wallet.save();

    const withdrawal = await Withdrawal.create({
      userId: req.user.id,
      assetType,
      amount: numAmount,
      status: 'pending',
      payoutDetails
    });

    await WalletTransaction.create({
      userId: req.user.id,
      assetType,
      amount: -numAmount,
      type: 'withdrawal',
      description: `Withdrawal request of ${numAmount} ${assetType} to ${payoutDetails}`
    });

    await ActivityLog.create({
      userId: req.user.id,
      actionType: 'WITHDRAWAL_REQUEST',
      description: `Requested withdrawal of ${numAmount} ${assetType}`,
      metadata: { amount: numAmount, assetType, withdrawalId: withdrawal._id }
    });

    res.status(201).json({ success: true, message: 'Withdrawal request submitted successfully', withdrawal });
  } catch (error) {
    next(error);
  }
};

/**
 * Get referral snapshot
 */
export const getReferrals = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const referrals = await Referral.find({ referrerId: req.user.id }).populate('referredUserId', 'username email createdAt');

    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => r.status === 'successful').length;
    const totalRewardsEarned = referrals.reduce((sum, r) => sum + r.rewardEarned, 0);
    const totalXpEarned = referrals.reduce((sum, r) => sum + r.xpEarned, 0);

    res.status(200).json({
      success: true,
      referralCode: user?.referralCode || 'REF2026',
      totalReferrals,
      successfulReferrals,
      pendingReferrals: 0,
      totalRewardsEarned,
      totalXpEarned,
      referralsList: referrals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent activity logs
 */
export const getActivity = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(15);
    res.status(200).json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};
