import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actionType: { type: String, required: true },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
