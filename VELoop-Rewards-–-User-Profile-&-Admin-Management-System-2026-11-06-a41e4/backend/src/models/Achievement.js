import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  badgeUrl: { type: String, default: '' },
  xpReward: { type: Number, default: 100 },
  criteriaType: { type: String, required: true },
  criteriaValue: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Achievement = mongoose.model('Achievement', achievementSchema);
