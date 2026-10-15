import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import { HttpError, isValidId, formatDateTime, isNonNegNumber } from '../utils/helpers.js';

const PAYMENT_METHODS = ['Cash', 'Easypaisa', 'JazzCash', 'Bank Transfer'];

// GET /api/sales
export const getSales = async (req, res) => {
  const sales = await Sale.find().sort({ createdAt: -1, _id: -1 });
  res.json(sales);
};

const lastInvoiceNumber = async () => {
  const last = await Sale.findOne().sort({ createdAt: -1, _id: -1 }).select('invoiceId');
  const m = last && /^INV-\d{4}-(\d+)$/.exec(last.invoiceId);
  return m ? Number(m[1]) : 100;
};

const rollbackStock = async (deducted) => {
  for (const { id, qty } of deducted) {
    if (id) await Product.updateOne({ _id: id }, { $inc: { stockQuantity: qty } });
  }
};

// POST /api/sales
export const createSale = async (req, res) => {
  const b = req.body || {};
  const paymentMethod = b.paymentMethod || 'Cash';

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw new HttpError(400, `paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}`);
  }
  if (!Array.isArray(b.items) || b.items.length === 0) {
    throw new HttpError(400, 'Cart is empty: at least one item is required');
  }

  const discount = b.discount === undefined || b.discount === '' ? 0 : b.discount;
  if (!isNonNegNumber(discount)) throw new HttpError(400, 'Discount must be 0 or more');

  const wanted = new Map();
  for (const line of b.items) {
    const productId = String(line?.productId ?? line?.id ?? '');
    const qty = Number(line?.qty);
    if (!isValidId(productId)) throw new HttpError(400, 'Each item needs a valid productId');
    if (!Number.isInteger(qty) || qty <= 0) throw new HttpError(400, 'Each item qty must be a whole number above 0');
    wanted.set(productId, (wanted.get(productId) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...wanted.keys()] } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const problems = [];
  for (const [id, qty] of wanted) {
    const p = byId.get(id);
    if (!p) throw new HttpError(404, `Product not found (id ${id}); it may have been deleted`);
    if (p.stockQuantity < qty) {
      problems.push(`${p.name} (available ${p.stockQuantity}, requested ${qty})`);
    }
  }
  if (problems.length) throw new HttpError(400, `Insufficient stock: ${problems.join('; ')}`);

  const items = [];
  let subtotal = 0;
  let cost = 0;
  for (const [id, qty] of wanted) {
    const p = byId.get(id);
    items.push({ productId: p._id, name: p.name, price: p.sellingPrice, qty, cost: p.purchasePrice });
    subtotal += p.sellingPrice * qty;
    cost += p.purchasePrice * qty;
  }
  const disc = Number(discount);
  if (disc > subtotal) throw new HttpError(400, 'Discount cannot be more than the subtotal');
  const total = subtotal - disc;
  const profit = total - cost;

  const deducted = [];
  try {
    for (const [id, qty] of wanted) {
      const ok = await Product.findOneAndUpdate(
        { _id: id, stockQuantity: { $gte: qty } },
        { $inc: { stockQuantity: -qty } },
        { new: true }
      );
      if (!ok) {
        throw new HttpError(400, `Insufficient stock: ${byId.get(id).name} was just sold by someone else`);
      }
      deducted.push({ id, qty });
    }

    const base = await lastInvoiceNumber();
    const year = new Date().getFullYear();
    let sale;
    for (let attempt = 1; attempt <= 5 && !sale; attempt++) {
      try {
        sale = await Sale.create({
          invoiceId: `INV-${year}-${base + attempt}`,
          date: formatDateTime(),
          customerName: String(b.customerName || '').trim() || 'Walk-in Customer',
          items,
          subtotal,
          discount: disc,
          total,
          profit,
          paymentMethod
        });
      } catch (err) {
        if (err.code !== 11000 || attempt === 5) throw err;
      }
    }

    res.status(201).json(sale);
  } catch (err) {
    await rollbackStock(deducted);
    throw err;
  }
};

// DELETE /api/sales/:id (Delete Sale & Restore Stock)
export const deleteSale = async (req, res) => {
  const { id } = req.params;

  // Search by Mongo _id OR invoiceId (e.g., INV-2026-101)
  const query = isValidId(id) ? { _id: id } : { invoiceId: id };
  const sale = await Sale.findOne(query);

  if (!sale) throw new HttpError(404, 'Sale record not found');

  // Restore stock back to products
  for (const item of sale.items) {
    if (item.productId) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stockQuantity: item.qty } }
      );
    }
  }

  await Sale.deleteOne({ _id: sale._id });
  res.json({ message: 'Sale deleted and stock restored', id: String(sale._id) });
};