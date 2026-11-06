import mongoose from 'mongoose';

const levelConfigSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true, unique: true },
  levelName: { type: String, required: true },
  xpThreshold: { type: Number, required: true },
  badgeUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const LevelConfig = mongoose.model('LevelConfig', levelConfigSchema);
