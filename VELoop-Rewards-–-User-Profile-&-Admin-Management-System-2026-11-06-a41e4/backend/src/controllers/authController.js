import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AdminUser } from '../models/AdminUser.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';

/**
 * Register a new user
 */
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, referralCode } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide username, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const generatedReferralCode = username.substring(0, 4).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    const newUser = await User.create({
      username,
      email,
      passwordHash,
      referralCode: generatedReferralCode,
      referredBy: referralCode || undefined,
      status: 'active'
    });

    await Wallet.create({
      userId: newUser._id,
      veBalance: 100, // configurable welcome reward
      sveBalance: 0,
      gemsBalance: 5,
      tokensBalance: 10,
      xpBalance: 100,
      currentLevel: 1
    });

    await ActivityLog.create({
      userId: newUser._id,
      actionType: 'ACCOUNT_CREATED',
      description: 'Account registered successfully.'
    });

    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        referralCode: newUser.referralCode,
        status: newUser.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Account is suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await ActivityLog.create({
      userId: user._id,
      actionType: 'USER_LOGIN',
      description: 'User logged in successfully.'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user session
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin login
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password.' });
    }

    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const adminToken = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    await AdminAuditLog.create({
      adminId: admin._id,
      action: 'ADMIN_LOGIN',
      targetModel: 'AdminUser',
      targetId: admin._id.toString(),
      changesSummary: `Admin ${admin.email} logged in successfully.`
    });

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token: adminToken,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};
