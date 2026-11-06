import mongoose, { Schema, Document } from 'mongoose';

// 1. User Schema
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  referralCode: string;
  referredBy?: string;
  status: 'active' | 'suspended';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: String },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: true },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// 2. Wallet Schema
export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  veBalance: number;
  sveBalance: number;
  gemsBalance: number;
  tokensBalance: number;
  xpBalance: number;
  currentLevel: number;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  veBalance: { type: Number, default: 1250 },
  sveBalance: { type: Number, default: 340 },
  gemsBalance: { type: Number, default: 85 },
  tokensBalance: { type: Number, default: 520 },
  xpBalance: { type: Number, default: 6420 },
  currentLevel: { type: Number, default: 4 },
}, { timestamps: true });

export const WalletModel = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

// 3. Wallet Transaction Schema
export interface IWalletTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  assetType: 'VE' | 'SVE' | 'Gems' | 'Tokens' | 'XP';
  amount: number;
  type: 'earn' | 'spend' | 'adjust' | 'withdrawal';
  referenceId?: string;
  description: string;
  createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assetType: { type: String, enum: ['VE', 'SVE', 'Gems', 'Tokens', 'XP'], required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['earn', 'spend', 'adjust', 'withdrawal'], required: true },
  referenceId: { type: String },
  description: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const WalletTransactionModel = mongoose.models.WalletTransaction || mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);

// 4. Level Configuration Schema
export interface ILevelConfig extends Document {
  levelNumber: number;
  levelName: string;
  xpThreshold: number;
  badgeUrl: string;
  isActive: boolean;
}

const LevelConfigSchema = new Schema<ILevelConfig>({
  levelNumber: { type: Number, required: true, unique: true },
  levelName: { type: String, required: true },
  xpThreshold: { type: Number, required: true },
  badgeUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
});

export const LevelConfigModel = mongoose.models.LevelConfig || mongoose.model<ILevelConfig>('LevelConfig', LevelConfigSchema);

// 5. Achievement Schema
export interface IAchievement extends Document {
  title: string;
  description: string;
  badgeUrl: string;
  xpReward: number;
  criteriaType: string;
  criteriaValue: number;
  isActive: boolean;
}

const AchievementSchema = new Schema<IAchievement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  badgeUrl: { type: String, default: '' },
  xpReward: { type: Number, default: 100 },
  criteriaType: { type: String, required: true },
  criteriaValue: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
});

export const AchievementModel = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);

// 6. User Achievement Schema
export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  unlockedAt: Date;
  progress: number;
}

const UserAchievementSchema = new Schema<IUserAchievement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  unlockedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 100 },
});

export const UserAchievementModel = mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);

// 7. Referral Schema
export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'successful';
  rewardEarned: number;
  xpEarned: number;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  referredUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'successful'], default: 'successful' },
  rewardEarned: { type: Number, default: 50 },
  xpEarned: { type: Number, default: 250 },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const ReferralModel = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

// 8. Withdrawal Schema
export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  assetType: 'VE' | 'SVE' | 'Gems' | 'Tokens';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  payoutDetails: string;
  rejectionReason?: string;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assetType: { type: String, enum: ['VE', 'SVE', 'Gems', 'Tokens'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'failed'], default: 'pending' },
  payoutDetails: { type: String, required: true },
  rejectionReason: { type: String },
  processedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
}, { timestamps: true });

export const WithdrawalModel = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);

// 9. Activity Log Schema
export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  actionType: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actionType: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

// 10. Admin User Schema
export interface IAdminUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'moderator';
  lastLogin?: Date;
  createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'moderator'], default: 'super_admin' },
  lastLogin: { type: Date },
}, { timestamps: true });

export const AdminUserModel = mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);

// 11. Admin Audit Log Schema
export interface IAdminAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string;
  targetModel: string;
  targetId?: string;
  changesSummary: string;
  ipAddress?: string;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  action: { type: String, required: true },
  targetModel: { type: String, required: true },
  targetId: { type: String },
  changesSummary: { type: String, required: true },
  ipAddress: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const AdminAuditLogModel = mongoose.models.AdminAuditLog || mongoose.model<IAdminAuditLog>('AdminAuditLog', AdminAuditLogSchema);
