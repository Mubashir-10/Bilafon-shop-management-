import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import Product from './models/Product.js';
import Category from './models/Category.js';
import Expense from './models/Expense.js';
import Sale from './models/Sale.js';
import User from './models/User.js';
import StockPurchase from './models/StockPurchase.js';
import { formatDay, formatDateTime } from './utils/helpers.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bilafon';
const force = process.argv.includes('--force');

const CATEGORIES = [
  'Data Cables', 'Chargers & Adapters', 'Earbuds & TWS', 'Handsfree & Earphones',
  'Headphones', 'Power Banks', 'Mobile Covers & Cases', 'Screen & Glass Protectors',
  'Phone Holders & Stands', 'OTG & Connectors', 'Memory Cards & USB Drives',
  'Speakers', 'Other Mobile Accessories'
];

const PRODUCTS = [
  { name: 'Samsung 25W Type-C Fast Charger', sku: 'CHG-SAM-25W', category: 'Chargers & Adapters', brand: 'Samsung', model: 'Type-C Devices', purchasePrice: 1200, sellingPrice: 1800, stockQuantity: 18, minStockLevel: 5, supplier: 'Lahore Wholesale Market' },
  { name: 'Ronin R-9 TWS Earbuds', sku: 'EAR-RON-R9', category: 'Earbuds & TWS', brand: 'Ronin', model: 'Universal Bluetooth', purchasePrice: 2800, sellingPrice: 3950, stockQuantity: 8, minStockLevel: 3, supplier: 'Local Mobile Plaza Shop #12' },
  { name: 'Infinix Hot 30 9D Glass Protector', sku: 'GLS-INF-H30', category: 'Screen & Glass Protectors', brand: 'Generic 9D', model: 'Infinix Hot 30', purchasePrice: 60, sellingPrice: 250, stockQuantity: 35, minStockLevel: 10, supplier: 'Direct Local Import' },
  { name: 'Faster 10000mAh Power Bank (PB-60)', sku: 'PWR-FAS-10K', category: 'Power Banks', brand: 'Faster', model: 'Universal Fast Charge', purchasePrice: 2100, sellingPrice: 3200, stockQuantity: 2, minStockLevel: 4, supplier: 'Local Partner Shop' },
  { name: 'Redmi Note 12 Silicone Matte Case (Black)', sku: 'COV-RDM-N12', category: 'Mobile Covers & Cases', brand: 'Silicone Premium', model: 'Redmi Note 12', purchasePrice: 120, sellingPrice: 400, stockQuantity: 12, minStockLevel: 5, supplier: 'Karachi Accessories Hub' },
  { name: 'Type-C Fast Data Cable 65W (1m)', sku: 'CBL-TYC-65W', category: 'Data Cables', brand: 'Generic', model: 'Type-C to Type-C', purchasePrice: 180, sellingPrice: 450, stockQuantity: 40, minStockLevel: 10, supplier: 'Lahore Wholesale Market' },
  { name: 'Audionic Handsfree with Mic', sku: 'HFR-AUD-01', category: 'Handsfree & Earphones', brand: 'Audionic', model: '3.5mm Universal', purchasePrice: 220, sellingPrice: 500, stockQuantity: 0, minStockLevel: 5, supplier: 'Local Mobile Plaza Shop #12' },
  { name: 'SanDisk 64GB MicroSD Card', sku: 'MEM-SAN-64', category: 'Memory Cards & USB Drives', brand: 'SanDisk', model: 'Class 10', purchasePrice: 900, sellingPrice: 1300, stockQuantity: 14, minStockLevel: 4, supplier: 'Karachi Accessories Hub' }
];

const EXPENSES_TEMPLATE = [
  { title: 'Shop Monthly Rent', category: 'Rent', amount: 25000, daysAgo: 12, description: 'Monthly shop rent' },
  { title: 'Electricity Bill', category: 'Utilities', amount: 6400, daysAgo: 8, description: 'Electricity bill payment' },
  { title: 'Shop Tea & Refreshment', category: 'Tea & Refreshment', amount: 1200, daysAgo: 3, description: 'Weekly tea bill for staff/guests' },
  { title: 'Transport / Freight', category: 'Transport', amount: 1500, daysAgo: 1, description: 'Cargo charges for stock from Lahore' }
];

// [daysAgo, hour, minute, customer, payment, discount, [[sku, qty], ...]]
const SALES_TEMPLATE = [
  [2, 11, 30, 'Walk-in Customer', 'Cash', 50, [['CHG-SAM-25W', 1]]],
  [2, 15, 15, 'Ali Raza', 'Easypaisa', 0, [['GLS-INF-H30', 2], ['COV-RDM-N12', 1]]],
  [1, 12, 5, 'Walk-in Customer', 'JazzCash', 0, [['CBL-TYC-65W', 2]]],
  [0, 10, 20, 'Walk-in Customer', 'Cash', 100, [['EAR-RON-R9', 1]]],
  [0, 13, 45, 'Usman Khan', 'Bank Transfer', 0, [['MEM-SAN-64', 1], ['CBL-TYC-65W', 1]]]
];

// Stock purchase history: sku -> [[daysAgo, qty | 'rest'], ...]
// 'rest' = whatever is needed so that purchased = current stock + sold in the demo sales.
const PURCHASE_PLAN = {
  'CHG-SAM-25W': [[24, 'rest'], [4, 10]],
  'EAR-RON-R9': [[20, 'rest']],
  'GLS-INF-H30': [[26, 'rest'], [9, 15]],
  'PWR-FAS-10K': [[13, 'rest']],
  'COV-RDM-N12': [[17, 'rest']],
  'CBL-TYC-65W': [[21, 'rest'], [2, 20]],
  'HFR-AUD-01': [[11, 'rest']],
  'MEM-SAN-64': [[6, 'rest']]
};

const daysAgoDate = (n, h = 12, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d;
};

async function run() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to ${MONGO_URI}`);

  const existing =
    (await Product.countDocuments()) + (await Sale.countDocuments()) +
    (await Expense.countDocuments()) + (await Category.countDocuments()) +
    (await StockPurchase.countDocuments());

  if (existing > 0 && !force) {
    console.error(
      'Database already contains data. Seeding would ERASE products, categories, expenses, sales and purchase history.\n' +
      'If that is really what you want, run:  npm run seed:reset'
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  await Promise.all([Product.deleteMany({}), Category.deleteMany({}), Expense.deleteMany({}), Sale.deleteMany({}), StockPurchase.deleteMany({})]);

  await Category.insertMany(CATEGORIES.map((name) => ({ name })));
  const products = await Product.insertMany(PRODUCTS);
  const bySku = new Map(products.map((p) => [p.sku, p]));

  await Expense.insertMany(
    EXPENSES_TEMPLATE.map(({ daysAgo, ...e }) => ({ ...e, date: formatDay(daysAgoDate(daysAgo)) }))
  );

  let n = 100;
  for (const [daysAgo, h, m, customerName, paymentMethod, discount, lines] of SALES_TEMPLATE) {
    const when = daysAgoDate(daysAgo, h, m);
    const items = lines.map(([sku, qty]) => {
      const p = bySku.get(sku);
      return { productId: p._id, name: p.name, price: p.sellingPrice, qty, cost: p.purchasePrice };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const cost = items.reduce((s, i) => s + i.cost * i.qty, 0);
    const total = subtotal - discount;
    await Sale.create({
      invoiceId: `INV-${when.getFullYear()}-${++n}`,
      date: formatDateTime(when),
      customerName, items, subtotal, discount, total, profit: total - cost, paymentMethod
    });
  }

  // Purchase history (Khareed ledger)
  const soldBySku = new Map();
  for (const [, , , , , , lines] of SALES_TEMPLATE) {
    for (const [sku, qty] of lines) soldBySku.set(sku, (soldBySku.get(sku) || 0) + qty);
  }
  let purchaseRows = 0;
  for (const [sku, entries] of Object.entries(PURCHASE_PLAN)) {
    const p = bySku.get(sku);
    const total = p.stockQuantity + (soldBySku.get(sku) || 0);
    const fixed = entries.reduce((sum, [, q]) => sum + (q === 'rest' ? 0 : q), 0);
    for (const [daysAgo, q] of entries) {
      const quantity = q === 'rest' ? Math.max(total - fixed, 1) : q;
      await StockPurchase.create({
        productId: p._id,
        productName: p.name,
        sku: p.sku,
        supplier: p.supplier,
        purchasePrice: p.purchasePrice,
        quantity,
        totalCost: quantity * p.purchasePrice,
        date: formatDay(daysAgoDate(daysAgo))
      });
      purchaseRows++;
    }
  }

  // Admin login used by the React login screen (prefilled there).
  if (!(await User.findOne({ email: 'admin@bilafon.com' }))) {
    await User.create({ email: 'admin@bilafon.com', password: await bcrypt.hash('admin', 10) });
  }

  console.log(
    `Seeded: ${CATEGORIES.length} categories, ${PRODUCTS.length} products, ` +
    `${EXPENSES_TEMPLATE.length} expenses, ${SALES_TEMPLATE.length} sales, ${purchaseRows} purchase entries.\n` +
    'Login: admin@bilafon.com / admin'
  );
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
