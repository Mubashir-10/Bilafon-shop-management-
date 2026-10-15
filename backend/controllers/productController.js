import Product from '../models/Product.js';
import { HttpError, isValidId, escapeRegex, isNonNegNumber } from '../utils/helpers.js';
import { recordPurchase } from './purchaseController.js';

const EDITABLE = [
  'name', 'sku', 'category', 'brand', 'model',
  'purchasePrice', 'sellingPrice', 'stockQuantity', 'minStockLevel', 'supplier'
];
const NUMERIC = ['purchasePrice', 'sellingPrice', 'stockQuantity', 'minStockLevel'];

const checkId = (id) => {
  if (!isValidId(id)) throw new HttpError(400, 'Invalid product id');
};

const checkNumbers = (body) => {
  for (const f of NUMERIC) {
    if (body[f] !== undefined && !isNonNegNumber(body[f])) {
      throw new HttpError(400, `${f} must be a number that is 0 or more`);
    }
  }
};

const generateSku = async () => {
  for (let i = 0; i < 20; i++) {
    const sku = `BLF-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!(await Product.exists({ sku }))) return sku;
  }
  return `BLF-${Date.now()}`;
};

// GET /api/products?search=&category=
export const getProducts = async (req, res) => {
  const { search, category } = req.query;
  const filter = {};

  if (category && category !== 'All') filter.category = String(category);

  if (search && String(search).trim()) {
    const rx = new RegExp(escapeRegex(String(search).trim()), 'i');
    filter.$or = [{ name: rx }, { sku: rx }, { brand: rx }, { model: rx }];
  }

  const products = await Product.find(filter).sort({ createdAt: -1, _id: -1 });
  res.json(products);
};

// POST /api/products  (add new product / stock)
export const createProduct = async (req, res) => {
  const b = req.body || {};

  if (!String(b.name || '').trim()) throw new HttpError(400, 'Product name is required');
  if (!String(b.category || '').trim()) throw new HttpError(400, 'Category is required');
  if (b.sellingPrice === undefined || b.sellingPrice === '') {
    throw new HttpError(400, 'Selling price is required');
  }
  checkNumbers(b);

  const product = await Product.create({
    name: b.name,
    sku: String(b.sku || '').trim() || (await generateSku()),
    category: b.category,
    brand: b.brand || 'Generic',
    model: b.model || 'Universal',
    purchasePrice: Number(b.purchasePrice) || 0,
    sellingPrice: Number(b.sellingPrice),
    stockQuantity: Number(b.stockQuantity) || 0,
    minStockLevel: b.minStockLevel === undefined || b.minStockLevel === '' ? 3 : Number(b.minStockLevel),
    supplier: b.supplier || 'Local Market'
  });

  await recordPurchase(product, product.stockQuantity); // opening stock is a purchase

  res.status(201).json(product);
};

// PUT /api/products/:id
// Body may contain any editable field. For stock changes you can either send an
// absolute `stockQuantity`, or a relative `stockAdjustment` (e.g. +10 / -1).
// The relative form is applied atomically so two cashiers can't overwrite each other.
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  checkId(id);
  const b = req.body || {};
  checkNumbers(b);

  const hasAdjustment = b.stockAdjustment !== undefined;
  const delta = Number(b.stockAdjustment);
  if (hasAdjustment && !Number.isInteger(delta)) {
    throw new HttpError(400, 'stockAdjustment must be a whole number');
  }

  const changes = {};
  for (const key of EDITABLE) {
    if (b[key] !== undefined) changes[key] = NUMERIC.includes(key) ? Number(b[key]) : b[key];
  }

  let product;
  if (Object.keys(changes).length) {
    product = await Product.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true });
  } else {
    product = await Product.findById(id);
  }
  if (!product) throw new HttpError(404, 'Product not found');

  if (hasAdjustment && delta !== 0) {
    let updated;
    if (delta > 0) {
      updated = await Product.findByIdAndUpdate(id, { $inc: { stockQuantity: delta } }, { new: true });
    } else {
      // Enough stock -> subtract. Otherwise clamp to 0 (stock never goes negative).
      updated = await Product.findOneAndUpdate(
        { _id: id, stockQuantity: { $gte: -delta } },
        { $inc: { stockQuantity: delta } },
        { new: true }
      );
      if (!updated) {
        updated = await Product.findOneAndUpdate(
          { _id: id, stockQuantity: { $lt: -delta } },
          { $set: { stockQuantity: 0 } },
          { new: true }
        );
      }
    }
    product = updated || (await Product.findById(id));
    if (!product) throw new HttpError(404, 'Product not found');
    if (delta > 0) await recordPurchase(product, delta); // stock added = purchase
  }

  res.json(product);
};

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  checkId(req.params.id);
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ message: 'Product deleted', id: String(product._id) });
};
