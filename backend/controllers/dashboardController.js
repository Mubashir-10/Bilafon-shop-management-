import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import { formatDay } from '../utils/helpers.js';

const sum = (arr, key) => arr.reduce((acc, x) => acc + (Number(x[key]) || 0), 0);

// GET /api/dashboard/stats
// today*  -> sales made today (server local date)
// total*  -> all-time (used by the Reports page)
export const getStats = async (req, res) => {
  const today = formatDay();

  const [products, sales, expenses] = await Promise.all([
    Product.find().select('stockQuantity minStockLevel').lean(),
    Sale.find().select('date total profit').lean(),
    Expense.find().select('amount').lean()
  ]);

  const todaySales = sales.filter((s) => String(s.date).startsWith(today));
  const totalRevenue = sum(sales, 'total');
  const totalProfit = sum(sales, 'profit');
  const totalExpenses = sum(expenses, 'amount');

  res.json({
    todayTotal: sum(todaySales, 'total'),
    todayProfit: sum(todaySales, 'profit'),
    todaySalesCount: todaySales.length,
    totalRevenue,
    totalProfit,
    totalActiveProducts: products.length,
    lowStockCount: products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel).length,
    outOfStockCount: products.filter((p) => p.stockQuantity === 0).length,
    totalExpenses,
    netProfit: totalProfit - totalExpenses
  });
};
