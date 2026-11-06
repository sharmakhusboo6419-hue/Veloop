import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assetType: { type: String, enum: ['VE', 'SVE', 'Gems', 'Tokens'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'failed'], default: 'pending' },
  payoutDetails: { type: String, required: true },
  rejectionReason: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

export const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
