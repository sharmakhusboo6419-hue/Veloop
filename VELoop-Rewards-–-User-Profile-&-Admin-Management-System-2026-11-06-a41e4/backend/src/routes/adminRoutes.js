import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUserStatus,
  adjustAdminRewards,
  getAdminWithdrawals,
  updateAdminWithdrawalStatus,
  getAdminLevels,
  getAdminAchievements,
  getAdminReferrals,
  getAdminActivityLogs,
  getAdminAuditLogs
} from '../controllers/adminController.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyAdminToken);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserDetail);
router.patch('/users/:id/status', updateAdminUserStatus);
router.post('/rewards/adjust', adjustAdminRewards);
router.get('/withdrawals', getAdminWithdrawals);
router.patch('/withdrawals/:id/status', updateAdminWithdrawalStatus);
router.get('/levels', getAdminLevels);
router.get('/achievements', getAdminAchievements);
router.get('/referrals', getAdminReferrals);
router.get('/activity', getAdminActivityLogs);
router.get('/audit-logs', getAdminAuditLogs);

export default router;
