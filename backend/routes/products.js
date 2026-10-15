import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';

const r = Router();
r.get('/', asyncHandler(getProducts));
r.post('/', asyncHandler(createProduct));
r.put('/:id', asyncHandler(updateProduct));
r.delete('/:id', asyncHandler(deleteProduct));
export default r;
