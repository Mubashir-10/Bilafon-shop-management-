import Category from '../models/Category.js';
import { HttpError, escapeRegex, isValidId } from '../utils/helpers.js';

// GET /api/categories
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ _id: 1 });
  res.json(categories);
};

// POST /api/categories
export const createCategory = async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) throw new HttpError(400, 'Category name is required');

  // Case-insensitive duplicate check ("chargers" == "Chargers")
  const exists = await Category.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') });
  if (exists) throw new HttpError(400, `Category "${exists.name}" already exists`);

  const category = await Category.create({ name, status: req.body?.status || 'Active' });
  res.status(201).json(category);
};

// DELETE /api/categories/:id  (permanent)
// Products keep their category name text; only the category entry is removed.
export const deleteCategory = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid category id');
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new HttpError(404, 'Category not found');
  res.json({ message: 'Category deleted', id: String(category._id), name: category.name });
};
