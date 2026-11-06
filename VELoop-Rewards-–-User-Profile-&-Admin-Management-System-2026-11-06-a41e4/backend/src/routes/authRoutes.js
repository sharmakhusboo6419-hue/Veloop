import express from 'express';
import { registerUser, loginUser, getCurrentUser, loginAdmin } from '../controllers/authController.js';
import { verifyUserToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyUserToken, getCurrentUser);
router.post('/admin/login', loginAdmin);

export default router;
