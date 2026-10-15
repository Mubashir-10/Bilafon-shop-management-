import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { getStats } from '../controllers/dashboardController.js';

const r = Router();
r.get('/stats', asyncHandler(getStats));
export default r;
