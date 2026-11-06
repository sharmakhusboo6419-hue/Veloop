import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  veBalance: { type: Number, default: 0 },
  sveBalance: { type: Number, default: 0 },
  gemsBalance: { type: Number, default: 0 },
  tokensBalance: { type: Number, default: 0 },
  xpBalance: { type: Number, default: 0 },
  currentLevel: { type: Number, default: 1 }
}, { timestamps: true });

export const Wallet = mongoose.model('Wallet', walletSchema);
