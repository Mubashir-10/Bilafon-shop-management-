// backend/routes/sales.js

import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { getSales, createSale, deleteSale } from '../controllers/saleController.js';

const r = Router();
r.get('/', asyncHandler(getSales));
r.post('/', asyncHandler(createSale));
r.delete('/:id', asyncHandler(deleteSale));

export default r;