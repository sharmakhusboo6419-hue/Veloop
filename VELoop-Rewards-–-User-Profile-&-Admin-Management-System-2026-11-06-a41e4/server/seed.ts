import bcrypt from 'bcryptjs';
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
} from './models/schemas.ts';

export async function seedDatabase() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  try {
    const adminExists = await AdminUserModel.findOne({ email: 'admin@veloop.io' });
    if (!adminExists) {
      const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
      await AdminUserModel.create({
        username: 'SuperAdmin',
        email: 'admin@veloop.io',
        passwordHash: adminPasswordHash,
        role: 'super_admin'
      });
      console.log('Seeded default Admin: admin@veloop.io / Admin@123');
    }

    const userExists = await UserModel.findOne({ email: 'alex@veloop.io' });
    let demoUser;
    if (!userExists) {
      const userPasswordHash = await bcrypt.hash('password123', 10);
      demoUser = await UserModel.create({
        username: 'Alex Vance',
        email: 'alex@veloop.io',
        passwordHash: userPasswordHash,
        referralCode: 'ALEX2026',
        status: 'active',
        emailVerified: true
      });

      await WalletModel.create({
        userId: demoUser._id,
        veBalance: 2450,
        sveBalance: 480,
        gemsBalance: 125,
        tokensBalance: 890,
        xpBalance: 6420,
        currentLevel: 4
      });

      await WalletTransactionModel.create([
        {
          userId: demoUser._id,
          assetType: 'VE',
          amount: 500,
          type: 'earn',
          description: 'Daily login bonus & activity reward'
        },
        {
          userId: demoUser._id,
          assetType: 'Gems',
          amount: 25,
          type: 'earn',
          description: 'Completed weekly challenge'
        },
        {
          userId: demoUser._id,
          assetType: 'XP',
          amount: 1200,
          type: 'earn',
          description: 'Referral bonus reward'
        }
      ]);

      await ActivityLogModel.create([
        {
          userId: demoUser._id,
          actionType: 'REWARD_EARNED',
          description: 'Earned 500 VEs from daily activity bonus',
          metadata: { amount: 500, asset: 'VE' }
        },
        {
          userId: demoUser._id,
          actionType: 'LEVEL_UP',
          description: 'Advanced to Level 04 – Reward Explorer',
          metadata: { level: 4 }
        },
        {
          userId: demoUser._id,
          actionType: 'WITHDRAWAL_REQUEST',
          description: 'Requested withdrawal of 250 VEs to external wallet',
          metadata: { amount: 250, asset: 'VE' }
        }
      ]);

      await WithdrawalModel.create([
        {
          userId: demoUser._id,
          assetType: 'VE',
          amount: 250,
          status: 'pending',
          payoutDetails: '0x71C...392A'
        },
        {
          userId: demoUser._id,
          assetType: 'Tokens',
          amount: 100,
          status: 'approved',
          payoutDetails: '0x71C...392A'
        }
      ]);

      const achievement1 = await AchievementModel.create({
        title: 'Reward Explorer',
        description: 'Collect your first 1,000 VEs across the platform',
        xpReward: 500,
        criteriaType: 'VE_EARNED',
        criteriaValue: 1000
      });

      await UserAchievementModel.create({
        userId: demoUser._id,
        achievementId: achievement1._id,
        progress: 100
      });

      console.log('Seeded demo User: alex@veloop.io / password123');
    }

    const levelsCount = await LevelConfigModel.countDocuments();
    if (levelsCount === 0) {
      await LevelConfigModel.create([
        { levelNumber: 1, levelName: 'Novice Recruiter', xpThreshold: 1000 },
        { levelNumber: 2, levelName: 'Asset Scout', xpThreshold: 2500 },
        { levelNumber: 3, levelName: 'Token Pioneer', xpThreshold: 5000 },
        { levelNumber: 4, levelName: 'Reward Explorer', xpThreshold: 8000 },
        { levelNumber: 5, levelName: 'Elite Vanguard', xpThreshold: 12000 },
        { levelNumber: 6, levelName: 'Master Collector', xpThreshold: 18000 },
      ]);
      console.log('Seeded Level configurations');
    }

    const achievementsCount = await AchievementModel.countDocuments();
    if (achievementsCount <= 1) {
      await AchievementModel.create([
        { title: 'Gem Hunter', description: 'Collect 50 Gems from daily chests', xpReward: 300, criteriaType: 'GEMS_EARNED', criteriaValue: 50 },
        { title: 'Referral Master', description: 'Successfully refer 5 active members', xpReward: 1000, criteriaType: 'REFERRALS_COUNT', criteriaValue: 5 },
        { title: 'Token Titan', description: 'Hold 500+ Tokens in wallet', xpReward: 750, criteriaType: 'TOKENS_HOLDING', criteriaValue: 500 }
      ]);
      console.log('Seeded Achievement configurations');
    }

  } catch (error: any) {
    console.log('Database seeding note:', error?.message || error);
  }
}
