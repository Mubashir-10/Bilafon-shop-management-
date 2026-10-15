import Expense from '../models/Expense.js';
import { HttpError, isValidId, isValidDay, isValidMonth, monthBounds } from '../utils/helpers.js';

const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/expenses  (newest first)
// Optional date filters (dates are stored as 'YYYY-MM-DD' text):
//   ?month=2026-03                 -> that whole month
//   ?from=2026-03-01&to=2026-03-15 -> inclusive range (either end may be left out)
export const getExpenses = async (req, res) => {
  const { month, from, to } = req.query;
  const filter = {};

  if (month !== undefined) {
    if (from !== undefined || to !== undefined) {
      throw new HttpError(400, 'Use either month or from/to, not both');
    }
    if (!isValidMonth(String(month))) throw new HttpError(400, 'month must be in YYYY-MM format');
    const b = monthBounds(String(month));
    filter.date = { $gte: b.from, $lte: b.to };
  } else if (from !== undefined || to !== undefined) {
    if (from !== undefined && !isValidDay(String(from))) throw new HttpError(400, 'from must be a valid date (YYYY-MM-DD)');
    if (to !== undefined && !isValidDay(String(to))) throw new HttpError(400, 'to must be a valid date (YYYY-MM-DD)');
    if (from !== undefined && to !== undefined && from > to) throw new HttpError(400, 'from cannot be after to');
    filter.date = {};
    if (from !== undefined) filter.date.$gte = String(from);
    if (to !== undefined) filter.date.$lte = String(to);
  }

  const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1, _id: -1 });
  res.json(expenses);
};

// POST /api/expenses
export const createExpense = async (req, res) => {
  const b = req.body || {};

  if (!String(b.title || '').trim()) throw new HttpError(400, 'Expense title is required');

  const amount = Number(b.amount);
  if (b.amount === undefined || b.amount === '' || !Number.isFinite(amount) || amount <= 0) {
    throw new HttpError(400, 'Amount must be a number greater than 0');
  }

  if (!b.date || !DATE_RX.test(String(b.date))) {
    throw new HttpError(400, 'Date is required in YYYY-MM-DD format');
  }

  const expense = await Expense.create({
    title: b.title,
    category: b.category || 'General',
    amount,
    date: b.date,
    description: b.description || ''
  });

  res.status(201).json(expense);
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid expense id');
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) throw new HttpError(404, 'Expense not found');
  res.json({ message: 'Expense deleted', id: String(expense._id) });
};
