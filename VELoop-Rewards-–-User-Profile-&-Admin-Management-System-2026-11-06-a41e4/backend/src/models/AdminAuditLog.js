import mongoose from 'mongoose';

const adminAuditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
  action: { type: String, required: true },
  targetModel: { type: String, required: true },
  targetId: { type: String },
  changesSummary: { type: String, required: true },
  ipAddress: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);
