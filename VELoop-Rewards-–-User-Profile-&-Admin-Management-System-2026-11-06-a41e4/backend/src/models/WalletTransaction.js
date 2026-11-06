import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assetType: { type: String, enum: ['VE', 'SVE', 'Gems', 'Tokens', 'XP'], required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['earn', 'spend', 'adjust', 'withdrawal'], required: true },
  referenceId: { type: String },
  description: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);
