import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';

const r = Router();
r.get('/', asyncHandler(getExpenses));
r.post('/', asyncHandler(createExpense));
r.delete('/:id', asyncHandler(deleteExpense));
export default r;
