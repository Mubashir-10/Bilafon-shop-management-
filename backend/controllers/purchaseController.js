import StockPurchase from '../models/StockPurchase.js';
import { HttpError, formatDay, shiftDay, isValidDay, monthBounds } from '../utils/helpers.js';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// Called whenever stock is ADDED to a product (new product with stock, or a
// positive stock adjustment). Never throws: a ledger problem must not undo or
// fail a stock change that already succeeded.
export const recordPurchase = async (product, quantity, date = formatDay()) => {
  const qty = Number(quantity);
  if (!product || !(qty > 0)) return;

  const rate = Number(product.purchasePrice) || 0;
  const filter = {
    productId: product._id,
    date,
    purchasePrice: rate,
    supplier: product.supplier || ''
  };
  const update = {
    $inc: { quantity: qty, totalCost: qty * rate },
    $setOnInsert: { productName: product.name, sku: product.sku }
  };

  try {
    try {
      await StockPurchase.updateOne(filter, update, { upsert: true });
    } catch (err) {
      // Two requests inserted the same row at once: the 2nd one just adds to it.
      if (err.code !== 11000) throw err;
      await StockPurchase.updateOne(filter, update);
    }
  } catch (err) {
    console.error('[purchase ledger] could not record purchase:', err.message);
  }
};

// Turns ?range=today|15days|month|custom (&from=&to=) into concrete dates.
const resolveRange = (query) => {
  const range = String(query.range || 'month');
  const today = formatDay();

  switch (range) {
    case 'today':
      return { range, from: today, to: today, label: 'Today (1 Day)' };
    case '15days':
      return { range, from: shiftDay(-14), to: today, label: 'Last 15 Days' };
    case 'month': {
      const b = monthBounds(today.slice(0, 7));
      const [y, m] = today.split('-').map(Number);
      return { range, from: b.from, to: b.to, label: `This Month (${MONTH_NAMES[m - 1]} ${y})` };
    }
    case 'custom': {
      const { from, to } = query;
      if (!isValidDay(String(from || '')) || !isValidDay(String(to || ''))) {
        throw new HttpError(400, 'Custom range needs valid from and to dates (YYYY-MM-DD)');
      }
      if (from > to) throw new HttpError(400, 'from cannot be after to');
      return { range, from: String(from), to: String(to), label: 'Custom Range' };
    }
    default:
      throw new HttpError(400, 'range must be one of: today, 15days, month, custom');
  }
};

// GET /api/purchases?range=today|15days|month|custom&from=&to=
export const getPurchases = async (req, res) => {
  const { range, from, to, label } = resolveRange(req.query);

  const items = await StockPurchase.find({ date: { $gte: from, $lte: to } })
    .sort({ date: -1, createdAt: -1, _id: -1 });

  res.json({
    range,
    label,
    from,
    to,
    count: items.length,
    totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
    totalCost: items.reduce((s, i) => s + i.totalCost, 0),
    items
  });
};
