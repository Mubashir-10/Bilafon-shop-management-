import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';

const r = Router();
r.get('/', asyncHandler(getCategories));
r.post('/', asyncHandler(createCategory));
r.delete('/:id', asyncHandler(deleteCategory));
export default r;
