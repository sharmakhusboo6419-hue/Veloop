import express from 'express';
import {
  getProfileMe,
  updateProfileMe,
  getRewards,
  getLevelProgress,
  getAchievements,
  getWithdrawalSummary,
  requestWithdrawal,
  getReferrals,
  getActivity
} from '../controllers/profileController.js';
import { verifyUserToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyUserToken);

router.get('/me', getProfileMe);
router.patch('/me', updateProfileMe);
router.get('/rewards', getRewards);
router.get('/level-progress', getLevelProgress);
router.get('/achievements', getAchievements);
router.get('/withdrawal-summary', getWithdrawalSummary);
router.post('/withdraw', requestWithdrawal);
router.get('/referrals', getReferrals);
router.get('/activity', getActivity);

export default router;
