import mongoose from 'mongoose';

const userAchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
  unlockedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 100 }
}, { timestamps: true });

export const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);
