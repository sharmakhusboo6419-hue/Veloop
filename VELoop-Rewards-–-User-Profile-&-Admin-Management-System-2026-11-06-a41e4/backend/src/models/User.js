import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: String },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
