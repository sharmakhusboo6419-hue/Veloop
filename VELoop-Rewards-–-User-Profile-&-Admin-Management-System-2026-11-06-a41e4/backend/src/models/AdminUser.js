import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'moderator'], default: 'super_admin' },
  lastLogin: { type: Date }
}, { timestamps: true });

export const AdminUser = mongoose.model('AdminUser', adminUserSchema);
