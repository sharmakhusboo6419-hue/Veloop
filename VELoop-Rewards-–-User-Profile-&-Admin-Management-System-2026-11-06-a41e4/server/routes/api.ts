import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {
  UserModel,
  WalletModel,
  WalletTransactionModel,
  LevelConfigModel,
  AchievementModel,
  UserAchievementModel,
  ReferralModel,
  WithdrawalModel,
  ActivityLogModel,
  AdminUserModel,
  AdminAuditLogModel
} from '../models/schemas.ts';
import { verifyUserToken, verifyAdminToken, AuthRequest } from '../middleware/auth.ts';
import { fallbackStore } from '../data/fallbackStore.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'veloop_secure_jwt_secret_key_2026';

const isDbReady = () => mongoose.connection.readyState === 1;

// ==================== AUTH ROUTES ====================

router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password, referralCode } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide username, email, and password.' });
    }

    if (!isDbReady()) {
      const existing = fallbackStore.users.find(u => u.email === email);
      if (existing) return res.status(400).json({ error: 'Email already registered.' });

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = 'user_' + Date.now();
      const userReferralCode = username.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

      const newUser = {
        _id: userId,
        username,
        email,
        passwordHash,
        referralCode: userReferralCode,
        status: 'active',
        emailVerified: true,
        createdAt: new Date()
      };
      fallbackStore.users.push(newUser);

      fallbackStore.wallets.push({
        _id: 'wallet_' + userId,
        userId,
        veBalance: 100,
        sveBalance: 20,
        gemsBalance: 5,
        tokensBalance: 50,
        xpBalance: 250,
        currentLevel: 1
      });

      const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: userId, username, email, referralCode: userReferralCode, status: 'active' }
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userReferralCode = username.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    const newUser = await UserModel.create({
      username,
      email,
      passwordHash,
      referralCode: userReferralCode,
      status: 'active'
    });

    await WalletModel.create({
      userId: newUser._id,
      veBalance: 100,
      sveBalance: 20,
      gemsBalance: 5,
      tokensBalance: 50,
      xpBalance: 250,
      currentLevel: 1
    });

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        referralCode: newUser.referralCode,
        status: newUser.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during registration' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    if (!isDbReady()) {
      const user = fallbackStore.users.find(u => u.email === email);
      if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
      if (user.status === 'suspended') return res.status(403).json({ error: 'Account suspended.' });

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, username: user.username, email: user.email, referralCode: user.referralCode, status: user.status, createdAt: user.createdAt }
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
});

router.get('/auth/me', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const user = fallbackStore.users.find(u => u._id === req.user?.id);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      const { passwordHash, ...safeUser } = user;
      return res.json({ user: safeUser });
    }

    const user = await UserModel.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/logout', verifyUserToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ==================== USER PROFILE & DASHBOARD ROUTES ====================

router.get('/profile/me', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const user = fallbackStore.users.find(u => u._id === req.user?.id);
      const wallet = fallbackStore.wallets.find(w => w.userId === req.user?.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { passwordHash, ...safeUser } = user;
      return res.json({
        user: safeUser,
        wallet: wallet || { veBalance: 1250, sveBalance: 340, gemsBalance: 85, tokensBalance: 520, xpBalance: 6420, currentLevel: 4 }
      });
    }

    const user = await UserModel.findById(req.user?.id).select('-passwordHash');
    const wallet = await WalletModel.findOne({ userId: req.user?.id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user,
      wallet: wallet || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0, currentLevel: 1 }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/profile/me', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    const { username } = req.body;
    if (!isDbReady()) {
      const user = fallbackStore.users.find(u => u._id === req.user?.id);
      if (user && username) user.username = username;
      const { passwordHash, ...safeUser } = user;
      return res.json({ message: 'Profile updated successfully', user: safeUser });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user?.id,
      { ...(username && { username }) },
      { new: true }
    ).select('-passwordHash');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/rewards', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const wallet = fallbackStore.wallets.find(w => w.userId === req.user?.id);
      const transactions = fallbackStore.transactions.filter(t => t.userId === req.user?.id);
      return res.json({
        wallet: wallet || { veBalance: 1250, sveBalance: 340, gemsBalance: 85, tokensBalance: 520, xpBalance: 6420 },
        transactions
      });
    }

    const wallet = await WalletModel.findOne({ userId: req.user?.id });
    const transactions = await WalletTransactionModel.find({ userId: req.user?.id }).sort({ createdAt: -1 }).limit(10);
    res.json({
      wallet: wallet || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0 },
      transactions
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/level-progress', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const wallet = fallbackStore.wallets.find(w => w.userId === req.user?.id);
      const currentLevelNum = wallet?.currentLevel || 4;
      const currentXp = wallet?.xpBalance || 6420;
      const requiredXp = 8000;
      const remainingXp = Math.max(0, requiredXp - currentXp);
      const progressPercent = Math.min(100, Math.round((currentXp / requiredXp) * 100));

      return res.json({
        currentLevel: currentLevelNum,
        levelName: 'Reward Explorer',
        currentXp,
        requiredXp,
        remainingXp,
        progressPercent,
        nextLevelName: 'Elite Vanguard'
      });
    }

    const wallet = await WalletModel.findOne({ userId: req.user?.id });
    const currentLevelNum = wallet?.currentLevel || 1;
    const currentXp = wallet?.xpBalance || 0;

    const currentLevelConfig = await LevelConfigModel.findOne({ levelNumber: currentLevelNum });
    const nextLevelConfig = await LevelConfigModel.findOne({ levelNumber: currentLevelNum + 1 });

    const requiredXp = nextLevelConfig ? nextLevelConfig.xpThreshold : currentLevelConfig?.xpThreshold || 10000;
    const levelName = currentLevelConfig?.levelName || 'Reward Explorer';
    const nextLevelName = nextLevelConfig?.levelName || 'Max Level Reached';
    const remainingXp = Math.max(0, requiredXp - currentXp);
    const progressPercent = Math.min(100, Math.round((currentXp / requiredXp) * 100));

    res.json({
      currentLevel: currentLevelNum,
      levelName,
      currentXp,
      requiredXp,
      remainingXp,
      progressPercent,
      nextLevelName
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/achievements', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const achievements = fallbackStore.achievements.map(ach => ({
        id: ach._id,
        title: ach.title,
        description: ach.description,
        badgeUrl: ach.badgeUrl,
        xpReward: ach.xpReward,
        isUnlocked: ach._id === 'ach_1',
        unlockedAt: ach._id === 'ach_1' ? new Date() : null,
        progress: ach._id === 'ach_1' ? 100 : 35
      }));
      return res.json({ achievements });
    }

    const allAchievements = await AchievementModel.find({ isActive: true });
    const userUnlocked = await UserAchievementModel.find({ userId: req.user?.id });
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
        progress: unlocked ? 100 : 35
      };
    });

    res.json({ achievements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/withdrawal-summary', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const withdrawals = fallbackStore.withdrawals.filter(w => w.userId === req.user?.id);
      return res.json({
        totalRequests: withdrawals.length,
        pendingRequests: withdrawals.filter(w => w.status === 'pending').length,
        approvedRequests: withdrawals.filter(w => w.status === 'approved').length,
        rejectedRequests: withdrawals.filter(w => w.status === 'rejected').length,
        totalSuccessfullyWithdrawn: 100,
        withdrawals
      });
    }

    const withdrawals = await WithdrawalModel.find({ userId: req.user?.id }).sort({ createdAt: -1 });

    const totalRequests = withdrawals.length;
    const pendingRequests = withdrawals.filter(w => w.status === 'pending').length;
    const approvedRequests = withdrawals.filter(w => w.status === 'approved').length;
    const rejectedRequests = withdrawals.filter(w => w.status === 'rejected' || w.status === 'failed').length;
    const totalSuccessfullyWithdrawn = withdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);

    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalSuccessfullyWithdrawn,
      withdrawals
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/profile/withdraw', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    const { assetType, amount, payoutDetails } = req.body;
    const numAmount = Number(amount);
    if (!assetType || !numAmount || numAmount <= 0 || !payoutDetails) {
      return res.status(400).json({ error: 'Please provide valid assetType, positive amount, and payout destination.' });
    }

    if (!['VE', 'SVE', 'Gems', 'Tokens'].includes(assetType)) {
      return res.status(400).json({ error: 'Invalid asset type for withdrawal. XP cannot be withdrawn.' });
    }

    if (!isDbReady()) {
      const wallet = fallbackStore.wallets.find(w => w.userId === req.user?.id);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found.' });
      const key = `${assetType.toLowerCase()}Balance`;
      const curBal = Number(wallet[key]) || 0;
      if (curBal < numAmount) {
        return res.status(400).json({ error: `Insufficient ${assetType} balance. You have ${curBal} ${assetType}.` });
      }

      wallet[key] = curBal - numAmount;
      const withdrawal = {
        _id: 'w_' + Date.now(),
        userId: req.user?.id,
        assetType,
        amount: numAmount,
        status: 'pending',
        payoutDetails,
        createdAt: new Date()
      };
      fallbackStore.withdrawals.unshift(withdrawal);

      fallbackStore.transactions.unshift({
        _id: 'tx_' + Date.now(),
        userId: req.user?.id,
        assetType,
        amount: -numAmount,
        type: 'withdrawal',
        description: `Withdrawal request of ${numAmount} ${assetType} to ${payoutDetails}`,
        createdAt: new Date()
      });

      fallbackStore.activities.unshift({
        _id: 'act_' + Date.now(),
        userId: req.user?.id,
        actionType: 'WITHDRAWAL_REQUEST',
        description: `Requested withdrawal of ${numAmount} ${assetType}`,
        createdAt: new Date()
      });

      return res.status(201).json({ message: 'Withdrawal request submitted successfully', withdrawal });
    }

    const wallet = await WalletModel.findOne({ userId: req.user?.id });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found.' });

    const key = `${assetType.toLowerCase()}Balance` as keyof typeof wallet;
    const curBal = Number(wallet[key]) || 0;
    if (curBal < numAmount) {
      return res.status(400).json({ error: `Insufficient ${assetType} balance. You have ${curBal} ${assetType}.` });
    }

    (wallet as any)[key] = curBal - numAmount;
    await wallet.save();

    const withdrawal = await WithdrawalModel.create({
      userId: req.user?.id,
      assetType,
      amount: numAmount,
      status: 'pending',
      payoutDetails
    });

    await WalletTransactionModel.create({
      userId: req.user?.id,
      assetType,
      amount: -numAmount,
      type: 'withdrawal',
      description: `Withdrawal request of ${numAmount} ${assetType} to ${payoutDetails}`
    });

    await ActivityLogModel.create({
      userId: req.user?.id,
      actionType: 'WITHDRAWAL_REQUEST',
      description: `Requested withdrawal of ${numAmount} ${assetType}`,
      metadata: { amount: numAmount, assetType, withdrawalId: withdrawal._id }
    });

    res.status(201).json({ message: 'Withdrawal request submitted successfully', withdrawal });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/referrals', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const user = fallbackStore.users.find(u => u._id === req.user?.id);
      return res.json({
        referralCode: user?.referralCode || 'ALEX2026',
        totalReferrals: 2,
        successfulReferrals: 2,
        pendingReferrals: 0,
        totalRewardsEarned: 100,
        totalXpEarned: 500,
        referralsList: [
          { _id: 'ref_1', referredUserId: { username: 'Sarah Connor', email: 'sarah@veloop.io' }, rewardEarned: 50, createdAt: new Date() },
          { _id: 'ref_2', referredUserId: { username: 'John Doe', email: 'john@veloop.io' }, rewardEarned: 50, createdAt: new Date() }
        ]
      });
    }

    const user = await UserModel.findById(req.user?.id);
    const referrals = await ReferralModel.find({ referrerId: req.user?.id }).populate('referredUserId', 'username email createdAt');

    const totalRewardsEarned = referrals.reduce((sum, r) => sum + r.rewardEarned, 0);
    const totalXpEarned = referrals.reduce((sum, r) => sum + r.xpEarned, 0);

    res.json({
      referralCode: user?.referralCode || 'ALEX2026',
      totalReferrals: referrals.length,
      successfulReferrals: referrals.filter(r => r.status === 'successful').length,
      pendingReferrals: 0,
      totalRewardsEarned,
      totalXpEarned,
      referralsList: referrals
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/activity', verifyUserToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const activities = fallbackStore.activities.filter(a => a.userId === req.user?.id);
      return res.json({ activities });
    }

    const activities = await ActivityLogModel.find({ userId: req.user?.id }).sort({ createdAt: -1 }).limit(15);
    res.json({ activities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

router.post('/admin/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isDbReady()) {
      const admin = fallbackStore.adminUsers.find(a => a.email === email);
      if (!admin) return res.status(401).json({ error: 'Invalid admin credentials.' });

      const isMatch = await bcrypt.compare(password, admin.passwordHash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid admin credentials.' });

      const adminToken = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role, isAdmin: true },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      return res.json({
        message: 'Admin login successful',
        token: adminToken,
        admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role }
      });
    }

    const admin = await AdminUserModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      message: 'Admin login successful',
      token: adminToken,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/stats', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      return res.json({
        totalUsers: fallbackStore.users.length,
        activeUsers: fallbackStore.users.filter(u => u.status === 'active').length,
        suspendedUsers: fallbackStore.users.filter(u => u.status === 'suspended').length,
        totalVe: fallbackStore.wallets.reduce((s, w) => s + w.veBalance, 0),
        totalSve: fallbackStore.wallets.reduce((s, w) => s + w.sveBalance, 0),
        totalGems: fallbackStore.wallets.reduce((s, w) => s + w.gemsBalance, 0),
        totalTokens: fallbackStore.wallets.reduce((s, w) => s + w.tokensBalance, 0),
        totalWithdrawals: fallbackStore.withdrawals.length,
        pendingWithdrawals: fallbackStore.withdrawals.filter(w => w.status === 'pending').length,
        approvedWithdrawals: fallbackStore.withdrawals.filter(w => w.status === 'approved').length
      });
    }

    const totalUsers = await UserModel.countDocuments();
    const activeUsers = await UserModel.countDocuments({ status: 'active' });
    const suspendedUsers = await UserModel.countDocuments({ status: 'suspended' });

    const wallets = await WalletModel.find();
    const totalVe = wallets.reduce((sum, w) => sum + w.veBalance, 0);
    const totalSve = wallets.reduce((sum, w) => sum + w.sveBalance, 0);
    const totalGems = wallets.reduce((sum, w) => sum + w.gemsBalance, 0);
    const totalTokens = wallets.reduce((sum, w) => sum + w.tokensBalance, 0);

    const totalWithdrawals = await WithdrawalModel.countDocuments();
    const pendingWithdrawals = await WithdrawalModel.countDocuments({ status: 'pending' });
    const approvedWithdrawals = await WithdrawalModel.countDocuments({ status: 'approved' });

    res.json({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/users', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      const usersWithWallet = fallbackStore.users.map(u => ({
        ...u,
        wallet: fallbackStore.wallets.find(w => w.userId === u._id) || { veBalance: 0, tokensBalance: 0, currentLevel: 1 }
      }));
      return res.json({ users: usersWithWallet });
    }

    const users = await UserModel.find().select('-passwordHash').sort({ createdAt: -1 });
    const userIds = users.map(u => u._id);
    const wallets = await WalletModel.find({ userId: { $in: userIds } });
    const walletMap = new Map(wallets.map(w => [w.userId.toString(), w]));

    const usersWithWallet = users.map(u => ({
      ...u.toObject(),
      wallet: walletMap.get(u._id.toString()) || { veBalance: 0, sveBalance: 0, gemsBalance: 0, tokensBalance: 0, xpBalance: 0, currentLevel: 1 }
    }));

    res.json({ users: usersWithWallet });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/admin/users/:id/status', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!isDbReady()) {
      const user = fallbackStore.users.find(u => u._id === req.params.id);
      if (user) user.status = status;
      const { passwordHash, ...safeUser } = user || {};
      return res.json({ message: `User status updated to ${status}`, user: safeUser });
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `User status updated to ${status}`, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/rewards/adjust', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    const { userId, assetType, amount, reason } = req.body;
    if (!isDbReady()) {
      const wallet = fallbackStore.wallets.find(w => w.userId === userId);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
      const key = `${assetType.toLowerCase()}Balance`;
      wallet[key] = (wallet[key] || 0) + Number(amount);
      return res.json({ message: 'Balance adjusted', wallet });
    }

    const wallet = await WalletModel.findOne({ userId });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found for user' });

    const key = `${assetType.toLowerCase()}Balance` as keyof typeof wallet;
    const previousBalance = Number(wallet[key]) || 0;
    const newBalance = previousBalance + Number(amount);
    if (newBalance < 0) return res.status(400).json({ error: 'Resulting balance cannot be negative.' });

    (wallet as any)[key] = newBalance;
    await wallet.save();

    res.json({ message: 'Reward balance adjusted successfully', wallet });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/withdrawals', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ withdrawals: fallbackStore.withdrawals });
    }

    const withdrawals = await WithdrawalModel.find().populate('userId', 'username email').sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/admin/withdrawals/:id/status', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    if (!isDbReady()) {
      const w = fallbackStore.withdrawals.find(item => item._id === req.params.id);
      if (w) w.status = status;
      return res.json({ message: `Withdrawal updated to ${status}`, withdrawal: w });
    }

    const withdrawal = await WithdrawalModel.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    withdrawal.status = status;
    await withdrawal.save();
    res.json({ message: `Withdrawal status updated to ${status}`, withdrawal });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/audit-logs', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ logs: fallbackStore.auditLogs });
    }

    const logs = await AdminAuditLogModel.find().populate('adminId', 'username email').sort({ createdAt: -1 }).limit(50);
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/users/:id', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (!isDbReady()) {
      const user = fallbackStore.users.find(u => u._id === id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const wallet = fallbackStore.wallets.find(w => w.userId === id);
      const transactions = fallbackStore.transactions.filter(t => t.userId === id);
      const withdrawals = fallbackStore.withdrawals.filter(w => w.userId === id);
      const activities = fallbackStore.activities.filter(a => a.userId === id);
      const { passwordHash, ...safeUser } = user;
      return res.json({ user: safeUser, wallet, transactions, withdrawals, activities });
    }

    const user = await UserModel.findById(id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const wallet = await WalletModel.findOne({ userId: id });
    const transactions = await WalletTransactionModel.find({ userId: id }).sort({ createdAt: -1 }).limit(20);
    const withdrawals = await WithdrawalModel.find({ userId: id }).sort({ createdAt: -1 });
    const activities = await ActivityLogModel.find({ userId: id }).sort({ createdAt: -1 }).limit(20);

    res.json({ user, wallet, transactions, withdrawals, activities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/levels', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ levels: fallbackStore.levels });
    }
    const levels = await LevelConfigModel.find().sort({ levelNumber: 1 });
    res.json({ levels });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/achievements', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ achievements: fallbackStore.achievements });
    }
    const achievements = await AchievementModel.find();
    res.json({ achievements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/referrals', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ referrals: fallbackStore.referrals });
    }
    const referrals = await ReferralModel.find().populate('referrerId referredUserId', 'username email');
    res.json({ referrals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/activity', verifyAdminToken, async (req: AuthRequest, res) => {
  try {
    if (!isDbReady()) {
      return res.json({ activities: fallbackStore.activities });
    }
    const activities = await ActivityLogModel.find().populate('userId', 'username email').sort({ createdAt: -1 }).limit(50);
    res.json({ activities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
