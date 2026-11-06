import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { LevelConfig } from '../models/LevelConfig.js';
import { Achievement } from '../models/Achievement.js';
import { Referral } from '../models/Referral.js';
import { Withdrawal } from '../models/Withdrawal.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';

/**
 * Get platform overview statistics
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const wallets = await Wallet.find();
    const totalVe = wallets.reduce((sum, w) => sum + w.veBalance, 0);
    const totalSve = wallets.reduce((sum, w) => sum + w.sveBalance, 0);
    const totalGems = wallets.reduce((sum, w) => sum + w.gemsBalance, 0);
    const totalTokens = wallets.reduce((sum, w) => sum + w.tokensBalance, 0);

    const totalWithdrawals = await Withdrawal.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });

    res.status(200).json({
      success: true,
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalVe,
      totalSve,
      totalGems,
      totalTokens,
      totalWithdrawals,
      pendingWithdrawals,
      approvedWithdrawals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated and filtered user list
 */
export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    const userIds = users.map(u => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } });
    const walletMap = new Map(wallets.map(w => [w.userId.toString(), w]));

    const usersWithWallet = users.map(u => ({
      ...u.toObject(),
      wallet: walletMap.get(u._id.toString()) || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0, currentLevel: 1 }
    }));

    res.status(200).json({ success: true, users: usersWithWallet });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed user view (wallet, activity, referrals, withdrawals)
 */
export const getAdminUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const wallet = await Wallet.findOne({ userId: id });
    const transactions = await WalletTransaction.find({ userId: id }).sort({ createdAt: -1 }).limit(20);
    const withdrawals = await Withdrawal.find({ userId: id }).sort({ createdAt: -1 });
    const referrals = await Referral.find({ referrerId: id }).populate('referredUserId', 'username email');
    const activities = await ActivityLog.find({ userId: id }).sort({ createdAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      user,
      wallet,
      transactions,
      withdrawals,
      referrals,
      activities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Suspend or restore user account
 */
export const updateAdminUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: 'UPDATE_USER_STATUS',
      targetModel: 'User',
      targetId: user._id.toString(),
      changesSummary: `Updated user ${user.email} status to ${status}`
    });

    res.status(200).json({ success: true, message: `User status updated to ${status}`, user });
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust user wallet balances with audit trail
 */
export const adjustAdminRewards = async (req, res, next) => {
  try {
    const { userId, assetType, amount, reason } = req.body;
    if (!userId || !assetType || amount === undefined || !reason) {
      return res.status(400).json({ success: false, error: 'Missing required adjustment fields.' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'Wallet not found for user.' });
    }

    const key = `${assetType.toLowerCase()}Balance`;
    const previousBalance = wallet[key] || 0;
    const newBalance = previousBalance + Number(amount);
    if (newBalance < 0) {
      return res.status(400).json({ success: false, error: 'Resulting balance cannot be negative.' });
    }

    wallet[key] = newBalance;
    await wallet.save();

    await WalletTransaction.create({
      userId,
      assetType,
      amount: Number(amount),
      type: 'adjust',
      description: `Admin adjustment: ${reason}`
    });

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: 'ADJUST_WALLET',
      targetModel: 'Wallet',
      targetId: wallet._id.toString(),
      changesSummary: `Adjusted ${assetType} by ${amount} for user ${userId}. Reason: ${reason}`
    });

    res.status(200).json({ success: true, message: 'Reward balance adjusted successfully', wallet });
  } catch (error) {
    next(error);
  }
};

/**
 * List withdrawal requests
 */
export const getAdminWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find().populate('userId', 'username email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or reject withdrawal request
 */
export const updateAdminWithdrawalStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, error: 'Withdrawal request not found.' });
    }

    withdrawal.status = status;
    if (rejectionReason) withdrawal.rejectionReason = rejectionReason;
    withdrawal.processedBy = req.user.id;
    await withdrawal.save();

    await AdminAuditLog.create({
      adminId: req.user.id,
      action: 'UPDATE_WITHDRAWAL_STATUS',
      targetModel: 'Withdrawal',
      targetId: withdrawal._id.toString(),
      changesSummary: `Updated withdrawal ${withdrawal._id} status to ${status}`
    });

    res.status(200).json({ success: true, message: `Withdrawal status updated to ${status}`, withdrawal });
  } catch (error) {
    next(error);
  }
};

/**
 * Get level configurations
 */
export const getAdminLevels = async (req, res, next) => {
  try {
    const levels = await LevelConfig.find().sort({ levelNumber: 1 });
    res.status(200).json({ success: true, levels });
  } catch (error) {
    next(error);
  }
};

/**
 * Get achievements configuration
 */
export const getAdminAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find();
    res.status(200).json({ success: true, achievements });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all system referrals
 */
export const getAdminReferrals = async (req, res, next) => {
  try {
    const referrals = await Referral.find().populate('referrerId referredUserId', 'username email');
    res.status(200).json({ success: true, referrals });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system activity logs
 */
export const getAdminActivityLogs = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find().populate('userId', 'username email').sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin audit logs
 */
export const getAdminAuditLogs = async (req, res, next) => {
  try {
    const logs = await AdminAuditLog.find().populate('adminId', 'username email').sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};
