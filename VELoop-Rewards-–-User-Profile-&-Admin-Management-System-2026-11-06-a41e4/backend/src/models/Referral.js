import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'successful'], default: 'successful' },
  rewardEarned: { type: Number, default: 50 },
  xpEarned: { type: Number, default: 250 }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Referral = mongoose.model('Referral', referralSchema);
