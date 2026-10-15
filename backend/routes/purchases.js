import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { getPurchases } from '../controllers/purchaseController.js';

const r = Router();
r.get('/', asyncHandler(getPurchases));
export default r;
