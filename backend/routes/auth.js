import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import protect from '../middleware/auth.js';
import { login, seedAdmin, changePassword } from '../controllers/authController.js';

const r = Router();
r.post('/login', asyncHandler(login));
r.put('/change-password', protect, asyncHandler(changePassword));
r.post('/seed-admin', asyncHandler(seedAdmin));
export default r;
