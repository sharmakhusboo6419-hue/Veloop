import bcrypt from 'bcryptjs';

// In-memory fallback store for 100% reliable execution without external DB latency or timeouts
class FallbackStore {
  users: any[] = [];
  wallets: any[] = [];
  transactions: any[] = [];
  levels: any[] = [];
  achievements: any[] = [];
  userAchievements: any[] = [];
  referrals: any[] = [];
  withdrawals: any[] = [];
  activities: any[] = [];
  adminUsers: any[] = [];
  auditLogs: any[] = [];

  async init() {
    if (this.users.length > 0) return;

    const adminPass = await bcrypt.hash('Admin@123', 10);
    this.adminUsers.push({
      _id: 'admin_1',
      username: 'SuperAdmin',
      email: 'admin@veloop.io',
      passwordHash: adminPass,
      role: 'super_admin',
      createdAt: new Date()
    });

    const userPass = await bcrypt.hash('password123', 10);
    const userId = 'user_1';
    this.users.push({
      _id: userId,
      username: 'Alex Vance',
      email: 'alex@veloop.io',
      passwordHash: userPass,
      referralCode: 'ALEX2026',
      status: 'active',
      emailVerified: true,
      createdAt: new Date()
    });

    this.wallets.push({
      _id: 'wallet_1',
      userId,
      veBalance: 2450,
      sveBalance: 480,
      gemsBalance: 125,
      tokensBalance: 890,
      xpBalance: 6420,
      currentLevel: 4
    });

    this.levels = [
      { levelNumber: 1, levelName: 'Novice Recruiter', xpThreshold: 1000 },
      { levelNumber: 2, levelName: 'Asset Scout', xpThreshold: 2500 },
      { levelNumber: 3, levelName: 'Token Pioneer', xpThreshold: 5000 },
      { levelNumber: 4, levelName: 'Reward Explorer', xpThreshold: 8000 },
      { levelNumber: 5, levelName: 'Elite Vanguard', xpThreshold: 12000 },
    ];

    this.achievements = [
      { _id: 'ach_1', title: 'Reward Explorer', description: 'Collect your first 1,000 VEs', xpReward: 500, criteriaType: 'VE_EARNED', criteriaValue: 1000, isActive: true },
      { _id: 'ach_2', title: 'Gem Hunter', description: 'Collect 50 Gems from daily chests', xpReward: 300, criteriaType: 'GEMS_EARNED', criteriaValue: 50, isActive: true },
      { _id: 'ach_3', title: 'Referral Master', description: 'Successfully refer 5 active members', xpReward: 1000, criteriaType: 'REFERRALS_COUNT', criteriaValue: 5, isActive: true }
    ];

    this.userAchievements.push({
      _id: 'uach_1',
      userId,
      achievementId: 'ach_1',
      unlockedAt: new Date(),
      progress: 100
    });

    this.withdrawals.push(
      { _id: 'w_1', userId, assetType: 'VE', amount: 250, status: 'pending', payoutDetails: '0x71C...392A', createdAt: new Date() },
      { _id: 'w_2', userId, assetType: 'Tokens', amount: 100, status: 'approved', payoutDetails: '0x71C...392A', createdAt: new Date() }
    );

    this.activities.push(
      { _id: 'act_1', userId, actionType: 'REWARD_EARNED', description: 'Earned 500 VEs from daily activity bonus', createdAt: new Date() },
      { _id: 'act_2', userId, actionType: 'LEVEL_UP', description: 'Advanced to Level 04 – Reward Explorer', createdAt: new Date() }
    );
  }
}

export const fallbackStore = new FallbackStore();
fallbackStore.init();
