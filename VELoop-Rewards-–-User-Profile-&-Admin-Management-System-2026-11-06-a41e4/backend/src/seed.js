import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminUser } from './models/AdminUser.js';
import { LevelConfig } from './models/LevelConfig.js';
import { Achievement } from './models/Achievement.js';

/**
 * Seed initial database records (admin account, default levels, achievements).
 */
export const seedDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@veloop.io';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await AdminUser.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      await AdminUser.create({
        username: 'SuperAdmin',
        email: adminEmail,
        passwordHash,
        role: 'super_admin'
      });
      console.log(`Seeded admin account: ${adminEmail}`);
    }

    const levelCount = await LevelConfig.countDocuments();
    if (levelCount === 0) {
      await LevelConfig.insertMany([
        { levelNumber: 1, levelName: 'Novice Recruiter', xpThreshold: 1000 },
        { levelNumber: 2, levelName: 'Asset Scout', xpThreshold: 2500 },
        { levelNumber: 3, levelName: 'Token Pioneer', xpThreshold: 5000 },
        { levelNumber: 4, levelName: 'Reward Explorer', xpThreshold: 8000 },
        { levelNumber: 5, levelName: 'Elite Vanguard', xpThreshold: 12000 }
      ]);
      console.log('Seeded default level configurations.');
    }

    const achievementCount = await Achievement.countDocuments();
    if (achievementCount === 0) {
      await Achievement.insertMany([
        { title: 'Reward Explorer', description: 'Collect your first 1,000 VEs', xpReward: 500, criteriaType: 'VE_EARNED', criteriaValue: 1000 },
        { title: 'Gem Hunter', description: 'Collect 50 Gems from daily chests', xpReward: 300, criteriaType: 'GEMS_EARNED', criteriaValue: 50 },
        { title: 'Referral Master', description: 'Successfully refer 5 active members', xpReward: 1000, criteriaType: 'REFERRALS_COUNT', criteriaValue: 5 }
      ]);
      console.log('Seeded default achievements.');
    }
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
  }
};
