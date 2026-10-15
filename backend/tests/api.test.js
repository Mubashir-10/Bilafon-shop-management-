// Integration tests. Needs a running MongoDB. Uses a SEPARATE database
// (bilafon_test) and wipes it, so it never touches your shop data.
//   npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test-secret';
const TEST_URI = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/bilafon_test';

const { default: app } = await import('../app.js');
const { formatDay, shiftDay } = await import('../utils/helpers.js');
const { default: StockPurchase } = await import('../models/StockPurchase.js');

let server, base, token;

const call = async (method, url, body, auth = true) => {
  const res = await fetch(base + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
};

before(async () => {
  await mongoose.connect(TEST_URI);
  await mongoose.connection.dropDatabase();
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  server.close();
});

// ---------- Auth ----------
test('health check is public', async () => {
  const r = await call('GET', '/api/health', undefined, false);
  assert.equal(r.status, 200);
});

test('protected routes reject requests without a token (401)', async () => {
  for (const url of ['/api/products', '/api/categories', '/api/expenses', '/api/sales', '/api/dashboard/stats', '/api/purchases']) {
    assert.equal((await call('GET', url, undefined, false)).status, 401, url);
  }
  const bad = await fetch(base + '/api/products', { headers: { Authorization: 'Bearer nonsense' } });
  assert.equal(bad.status, 401);
});

test('login auto-creates the default admin when no user exists', async () => {
  const r = await call('POST', '/api/auth/login', { email: 'admin@bilafon.com', password: 'admin' }, false);
  assert.equal(r.status, 200);
  assert.ok(r.data.token);
  assert.equal(r.data.user.password, undefined, 'hash must not leak');
});

test('seed-admin creates admin once (201 then 200)', async () => {
  await mongoose.connection.collection('users').deleteMany({});
  const a = await call('POST', '/api/auth/seed-admin', {}, false);
  assert.equal(a.status, 201);
  assert.equal(a.data.user.email, 'admin@bilafon.com');
  assert.equal(a.data.user.password, undefined, 'hash must not leak');
  const b = await call('POST', '/api/auth/seed-admin', {}, false);
  assert.equal(b.status, 200);
});

test('login: 400 missing fields, 401 wrong password, 200 success', async () => {
  assert.equal((await call('POST', '/api/auth/login', {}, false)).status, 400);
  assert.equal((await call('POST', '/api/auth/login', { email: 'admin@bilafon.com', password: 'nope' }, false)).status, 401);
  assert.equal((await call('POST', '/api/auth/login', { email: 'ghost@x.com', password: 'admin' }, false)).status, 401);
  const ok = await call('POST', '/api/auth/login', { email: ' Admin@Bilafon.com ', password: 'admin' }, false);
  assert.equal(ok.status, 200);
  assert.ok(ok.data.token);
  token = ok.data.token;
});

// ---------- Change password ----------
test('change-password: needs login, validates input, checks current password', async () => {
  const body = { email: 'admin@bilafon.com', currentPassword: 'admin', newPassword: 'abcd1234' };
  assert.equal((await call('PUT', '/api/auth/change-password', body, false)).status, 401);
  assert.equal((await call('PUT', '/api/auth/change-password', { currentPassword: 'admin' })).status, 400);
  assert.equal((await call('PUT', '/api/auth/change-password', { ...body, newPassword: 'abc' })).status, 400, 'min 4 chars');
  const wrong = await call('PUT', '/api/auth/change-password', { ...body, currentPassword: 'nope' });
  assert.equal(wrong.status, 400);
  assert.match(wrong.data.message, /Current password is incorrect/);
  assert.equal((await call('PUT', '/api/auth/change-password', { ...body, email: 'someone@else.com' })).status, 403);
  assert.equal((await call('PUT', '/api/auth/change-password', { ...body, newPassword: 'admin' })).status, 400, 'same password');
  // the session must still be valid after all those rejections
  assert.equal((await call('GET', '/api/categories')).status, 200);
});

test('change-password: success stores a bcrypt hash; old password stops working', async () => {
  const ok = await call('PUT', '/api/auth/change-password', {
    email: 'admin@bilafon.com', currentPassword: 'admin', newPassword: 'newpass1'
  });
  assert.equal(ok.status, 200);

  const stored = await mongoose.connection.collection('users').findOne({ email: 'admin@bilafon.com' });
  assert.match(stored.password, /^\$2[aby]\$10\$/, 'bcrypt, 10 salt rounds');
  assert.notEqual(stored.password, 'newpass1');

  assert.equal((await call('POST', '/api/auth/login', { email: 'admin@bilafon.com', password: 'admin' }, false)).status, 401);
  assert.equal((await call('POST', '/api/auth/login', { email: 'admin@bilafon.com', password: 'newpass1' }, false)).status, 200);

  // email is optional (taken from the login token); restore the original password
  const back = await call('PUT', '/api/auth/change-password', { currentPassword: 'newpass1', newPassword: 'admin' });
  assert.equal(back.status, 200);
  assert.equal((await call('POST', '/api/auth/login', { email: 'admin@bilafon.com', password: 'admin' }, false)).status, 200);
});

// ---------- Categories ----------
test('categories: create, list, reject blank + case-insensitive duplicate', async () => {
  const c = await call('POST', '/api/categories', { name: 'Power Banks' });
  assert.equal(c.status, 201);
  assert.equal(c.data.status, 'Active');
  assert.equal((await call('POST', '/api/categories', { name: 'power banks' })).status, 400);
  assert.equal((await call('POST', '/api/categories', { name: '   ' })).status, 400);
  await call('POST', '/api/categories', { name: 'Data Cables' });
  const list = await call('GET', '/api/categories');
  assert.equal(list.status, 200);
  assert.deepEqual(list.data.map((x) => x.name), ['Power Banks', 'Data Cables']);
});

test('categories: delete (200), then 404; bad id 400; gone from list', async () => {
  const c = await call('POST', '/api/categories', { name: 'Temp Cat' });
  assert.equal(c.status, 201);
  const del = await call('DELETE', `/api/categories/${c.data.id}`);
  assert.equal(del.status, 200);
  assert.equal(del.data.id, c.data.id);
  assert.equal((await call('DELETE', `/api/categories/${c.data.id}`)).status, 404);
  assert.equal((await call('DELETE', '/api/categories/not-an-id')).status, 400);
  assert.equal((await call('DELETE', '/api/categories/64b000000000000000000000')).status, 404);
  const names = (await call('GET', '/api/categories')).data.map((x) => x.name);
  assert.ok(!names.includes('Temp Cat'));
  // the name can be created again after deletion
  assert.equal((await call('POST', '/api/categories', { name: 'Temp Cat' })).status, 201);
  const again = (await call('GET', '/api/categories')).data.find((x) => x.name === 'Temp Cat');
  assert.equal((await call('DELETE', `/api/categories/${again.id}`)).status, 200);
});

// ---------- Products ----------
let charger, cable;

test('products: create returns 201 with id, auto-generates SKU', async () => {
  const r = await call('POST', '/api/products', {
    name: 'Samsung Charger', sku: 'CHG-1', category: 'Power Banks', brand: 'Samsung',
    purchasePrice: '1200', sellingPrice: '1800', stockQuantity: '10', minStockLevel: '3', supplier: 'X'
  });
  assert.equal(r.status, 201);
  assert.ok(r.data.id);
  assert.equal(r.data.stockQuantity, 10);
  assert.equal(typeof r.data.sellingPrice, 'number');
  charger = r.data;

  const auto = await call('POST', '/api/products', { name: 'USB Cable', category: 'Data Cables', sellingPrice: 300, stockQuantity: 5, purchasePrice: 100 });
  assert.equal(auto.status, 201);
  assert.match(auto.data.sku, /^BLF-\d+$/);
  assert.equal(auto.data.brand, 'Generic');
  cable = auto.data;
});

test('products: validation (400) and duplicate SKU (400)', async () => {
  assert.equal((await call('POST', '/api/products', { category: 'x', sellingPrice: 1 })).status, 400);
  assert.equal((await call('POST', '/api/products', { name: 'n', category: 'x' })).status, 400);
  assert.equal((await call('POST', '/api/products', { name: 'n', category: 'x', sellingPrice: -5 })).status, 400);
  assert.equal((await call('POST', '/api/products', { name: 'Dup', sku: 'CHG-1', category: 'x', sellingPrice: 5 })).status, 400);
});

test('products: search + category filter', async () => {
  const all = await call('GET', '/api/products');
  assert.equal(all.status, 200);
  assert.equal(all.data.length, 2);
  assert.equal((await call('GET', '/api/products?search=samsung')).data.length, 1);
  assert.equal((await call('GET', '/api/products?search=chg-1')).data.length, 1);
  assert.equal((await call('GET', '/api/products?category=Data%20Cables')).data.length, 1);
  assert.equal((await call('GET', '/api/products?category=All')).data.length, 2);
  assert.equal((await call('GET', '/api/products?search=zzz')).data.length, 0);
  // regex characters in search must not crash
  assert.equal((await call('GET', '/api/products?search=(')).status, 200);
});

test('products: update details, absolute stock, relative stock (clamped at 0)', async () => {
  let r = await call('PUT', `/api/products/${charger.id}`, { sellingPrice: 1900, supplier: 'New' });
  assert.equal(r.status, 200);
  assert.equal(r.data.sellingPrice, 1900);

  r = await call('PUT', `/api/products/${charger.id}`, { stockQuantity: 20 });
  assert.equal(r.data.stockQuantity, 20);

  r = await call('PUT', `/api/products/${charger.id}`, { stockAdjustment: 10 });
  assert.equal(r.data.stockQuantity, 30);
  r = await call('PUT', `/api/products/${charger.id}`, { stockAdjustment: -1 });
  assert.equal(r.data.stockQuantity, 29);
  r = await call('PUT', `/api/products/${charger.id}`, { stockAdjustment: -100 });
  assert.equal(r.data.stockQuantity, 0, 'never negative');
  await call('PUT', `/api/products/${charger.id}`, { stockQuantity: 10, sellingPrice: 1800 });

  assert.equal((await call('PUT', `/api/products/${charger.id}`, { stockAdjustment: 1.5 })).status, 400);
  assert.equal((await call('PUT', `/api/products/${charger.id}`, { sellingPrice: -1 })).status, 400);
  assert.equal((await call('PUT', '/api/products/not-an-id', {})).status, 400);
  assert.equal((await call('PUT', '/api/products/64b000000000000000000000', { name: 'x' })).status, 404);
});

// ---------- Sales ----------
test('sales: validation errors (400/404)', async () => {
  assert.equal((await call('POST', '/api/sales', { items: [] })).status, 400);
  assert.equal((await call('POST', '/api/sales', {})).status, 400);
  assert.equal((await call('POST', '/api/sales', { items: [{ productId: 'bad', qty: 1 }] })).status, 400);
  assert.equal((await call('POST', '/api/sales', { items: [{ productId: charger.id, qty: 0 }] })).status, 400);
  assert.equal((await call('POST', '/api/sales', { items: [{ productId: charger.id, qty: 1 }], paymentMethod: 'Bitcoin' })).status, 400);
  assert.equal((await call('POST', '/api/sales', { items: [{ productId: charger.id, qty: 1 }], discount: 999999 })).status, 400);
  assert.equal((await call('POST', '/api/sales', { items: [{ productId: '64b000000000000000000000', qty: 1 }] })).status, 404);
});

test('sales: success deducts stock, computes profit server-side, ignores client prices', async () => {
  const r = await call('POST', '/api/sales', {
    customerName: 'Ali',
    paymentMethod: 'Easypaisa',
    discount: 50,
    items: [{ productId: charger.id, qty: 2 }, { productId: cable.id, qty: 1, price: 1, cost: 999 }],
    subtotal: 1, total: 1, profit: 99999 // forged values must be ignored
  });
  assert.equal(r.status, 201);
  const s = r.data;
  assert.match(s.id, /^INV-\d{4}-\d+$/);
  assert.equal(s.id, s.invoiceId);
  assert.equal(s.subtotal, 1800 * 2 + 300);
  assert.equal(s.discount, 50);
  assert.equal(s.total, 3850);
  assert.equal(s.profit, 3850 - (1200 * 2 + 100));
  assert.equal(s.customerName, 'Ali');
  assert.equal(s.items.length, 2);
  assert.ok(s.items[0].id, 'items expose id for the React receipt');

  const prods = (await call('GET', '/api/products')).data;
  assert.equal(prods.find((p) => p.id === charger.id).stockQuantity, 8);
  assert.equal(prods.find((p) => p.id === cable.id).stockQuantity, 4);
});

test('sales: insufficient stock -> 400 and NOTHING is deducted (rollback)', async () => {
  const before = (await call('GET', '/api/products')).data;
  const r = await call('POST', '/api/sales', {
    items: [{ productId: cable.id, qty: 1 }, { productId: charger.id, qty: 9999 }]
  });
  assert.equal(r.status, 400);
  assert.match(r.data.message, /Insufficient stock/);
  const after = (await call('GET', '/api/products')).data;
  assert.deepEqual(after.map((p) => p.stockQuantity), before.map((p) => p.stockQuantity));
  assert.equal((await call('GET', '/api/sales')).data.length, 1, 'no sale saved');
});

test('sales: concurrent sales can never oversell', async () => {
  const r = await call('POST', '/api/products', { name: 'Last Piece', sku: 'LAST-1', category: 'x', sellingPrice: 100, purchasePrice: 50, stockQuantity: 1 });
  const body = { items: [{ productId: r.data.id, qty: 1 }] };
  const results = await Promise.all([call('POST', '/api/sales', body), call('POST', '/api/sales', body), call('POST', '/api/sales', body)]);
  const codes = results.map((x) => x.status).sort();
  assert.deepEqual(codes, [201, 400, 400]);
  const p = (await call('GET', '/api/products')).data.find((x) => x.sku === 'LAST-1');
  assert.equal(p.stockQuantity, 0);
  const ids = (await call('GET', '/api/sales')).data.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'invoice ids unique');
});

test('sales: list is newest first and default customer name applies', async () => {
  await call('POST', '/api/sales', { customerName: '  ', items: [{ productId: cable.id, qty: 1 }] });
  const list = (await call('GET', '/api/sales')).data;
  assert.equal(list[0].customerName, 'Walk-in Customer');
  assert.equal(list[0].paymentMethod, 'Cash');
  assert.ok(list[0].date.startsWith(formatDay()));
});

// ---------- Expenses ----------
let expense;
test('expenses: create / list / validation / delete', async () => {
  const r = await call('POST', '/api/expenses', { title: 'Rent', category: 'Rent', amount: '25000', date: formatDay(), description: 'm' });
  assert.equal(r.status, 201);
  assert.equal(r.data.amount, 25000);
  expense = r.data;

  assert.equal((await call('POST', '/api/expenses', { amount: 5, date: formatDay() })).status, 400);
  assert.equal((await call('POST', '/api/expenses', { title: 't', amount: 0, date: formatDay() })).status, 400);
  assert.equal((await call('POST', '/api/expenses', { title: 't', amount: 5, date: '13/10/2026' })).status, 400);

  const list = await call('GET', '/api/expenses');
  assert.equal(list.status, 200);
  assert.equal(list.data.length, 1);

  assert.equal((await call('DELETE', '/api/expenses/bad')).status, 400);
  assert.equal((await call('DELETE', '/api/expenses/64b000000000000000000000')).status, 404);
});

// ---------- Dashboard ----------
test('dashboard stats match the data', async () => {
  const r = await call('GET', '/api/dashboard/stats');
  assert.equal(r.status, 200);
  const sales = (await call('GET', '/api/sales')).data;
  const revenue = sales.reduce((a, s) => a + s.total, 0);
  const profit = sales.reduce((a, s) => a + s.profit, 0);
  assert.equal(r.data.totalRevenue, revenue);
  assert.equal(r.data.todayTotal, revenue, 'all test sales happened today');
  assert.equal(r.data.todayProfit, profit);
  assert.equal(r.data.totalExpenses, 25000);
  assert.equal(r.data.netProfit, profit - 25000);
  assert.equal(r.data.totalActiveProducts, 3);
  assert.equal(r.data.outOfStockCount, 1); // "Last Piece"
});

// ---------- Expense date filters ----------
test('expenses: month and from/to filters, validation, delete', async () => {
  const mk = (title, date, amount) => call('POST', '/api/expenses', { title, amount, date });
  const a = (await mk('Mar-A', '2026-03-05', 100)).data;
  const b = (await mk('Mar-B', '2026-03-20', 200)).data;
  const c = (await mk('Apr-A', '2026-04-02', 300)).data;
  const titles = (r) => r.data.map((x) => x.title);

  const mar = await call('GET', '/api/expenses?month=2026-03');
  assert.equal(mar.status, 200);
  assert.deepEqual(titles(mar), ['Mar-B', 'Mar-A'], 'newest first');
  assert.deepEqual(titles(await call('GET', '/api/expenses?month=2026-04')), ['Apr-A']);
  assert.equal((await call('GET', '/api/expenses?month=2026-02')).data.length, 0);
  assert.deepEqual(titles(await call('GET', '/api/expenses?from=2026-03-10&to=2026-04-30')), ['Apr-A', 'Mar-B']);
  assert.deepEqual(titles(await call('GET', '/api/expenses?to=2026-03-31')), ['Mar-B', 'Mar-A']);
  assert.deepEqual(titles(await call('GET', '/api/expenses?from=2026-03-20&to=2026-03-20')), ['Mar-B'], 'inclusive ends');

  for (const bad of ['month=2026-13', 'month=abc', 'from=2026-02-31', 'to=hello',
    'from=2026-05-01&to=2026-04-01', 'month=2026-03&from=2026-03-01']) {
    assert.equal((await call('GET', `/api/expenses?${bad}`)).status, 400, bad);
  }

  for (const x of [a, b, c]) assert.equal((await call('DELETE', `/api/expenses/${x.id}`)).status, 200);
  assert.equal((await call('GET', '/api/expenses?month=2026-03')).data.length, 0);
});

// ---------- Stock purchase ledger ----------
let ledgerProduct;
test('purchases: opening stock + added stock are recorded and merged per day/rate', async () => {
  const p = await call('POST', '/api/products', {
    name: 'Ledger Item', sku: 'LED-1', category: 'x', sellingPrice: 300, purchasePrice: 100, stockQuantity: 4, supplier: 'Ali Traders'
  });
  ledgerProduct = p.data;
  const id = p.data.id;
  await call('PUT', `/api/products/${id}`, { stockAdjustment: 5 });
  await call('PUT', `/api/products/${id}`, { stockAdjustment: 1 });
  await call('PUT', `/api/products/${id}`, { stockAdjustment: -2 });  // removing stock is NOT a purchase
  await call('PUT', `/api/products/${id}`, { stockQuantity: 50 });    // absolute correction is NOT a purchase

  const r = await call('GET', '/api/purchases?range=today');
  assert.equal(r.status, 200);
  assert.equal(r.data.range, 'today');
  assert.equal(r.data.from, formatDay());
  assert.equal(r.data.to, formatDay());
  let rows = r.data.items.filter((i) => i.productId === id);
  assert.equal(rows.length, 1, 'same day + rate + supplier -> one row');
  assert.equal(rows[0].quantity, 10); // 4 opening + 5 + 1
  assert.equal(rows[0].purchasePrice, 100);
  assert.equal(rows[0].totalCost, 1000);
  assert.equal(rows[0].supplier, 'Ali Traders');
  assert.equal(rows[0].productName, 'Ledger Item');
  assert.equal(rows[0].date, formatDay());
  assert.ok(rows[0].id);

  // a different buying rate becomes its own row
  await call('PUT', `/api/products/${id}`, { purchasePrice: 120 });
  await call('PUT', `/api/products/${id}`, { stockAdjustment: 2 });
  rows = (await call('GET', '/api/purchases?range=today')).data.items.filter((i) => i.productId === id);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((x) => [x.purchasePrice, x.quantity, x.totalCost]).sort(), [[100, 10, 1000], [120, 2, 240]]);

  // totals add up
  const all = (await call('GET', '/api/purchases?range=today')).data;
  assert.equal(all.totalQuantity, all.items.reduce((s, i) => s + i.quantity, 0));
  assert.equal(all.totalCost, all.items.reduce((s, i) => s + i.totalCost, 0));
  assert.equal(all.count, all.items.length);

  // zero opening stock records nothing
  const z = await call('POST', '/api/products', { name: 'No Stock Yet', sku: 'ZERO-1', category: 'x', sellingPrice: 10, stockQuantity: 0 });
  const zr = (await call('GET', '/api/purchases?range=today')).data.items.filter((i) => i.productId === z.data.id);
  assert.equal(zr.length, 0);
  await call('DELETE', `/api/products/${z.data.id}`);
});

test('purchases: Today / 15 Days / This Month / Custom range filters', async () => {
  const d3 = shiftDay(-3);
  const d20 = shiftDay(-20);
  const base = { productId: ledgerProduct.id, supplier: 'Old Supplier', purchasePrice: 50, quantity: 3, totalCost: 150 };
  await StockPurchase.create({ ...base, productName: 'Old A', sku: 'OLD-A', date: d3 });
  await StockPurchase.create({ ...base, productName: 'Old B', sku: 'OLD-B', date: d20 });
  const olds = (r) => r.data.items.filter((i) => i.productName.startsWith('Old')).map((i) => i.productName).sort();

  assert.deepEqual(olds(await call('GET', '/api/purchases?range=today')), []);

  const f15 = await call('GET', '/api/purchases?range=15days');
  assert.equal(f15.data.from, shiftDay(-14));
  assert.equal(f15.data.to, formatDay());
  assert.deepEqual(olds(f15), ['Old A'], '20 days ago is outside 15 days');

  const month = await call('GET', '/api/purchases?range=month');
  assert.equal(month.data.from, `${formatDay().slice(0, 7)}-01`);
  const monthStart = month.data.from;
  const expected = [d3, d20].map((d, i) => [d, ['Old A', 'Old B'][i]]).filter(([d]) => d >= monthStart).map(([, n]) => n);
  assert.deepEqual(olds(month), expected.sort());
  assert.match(month.data.label, /This Month/);

  const noParam = await call('GET', '/api/purchases');
  assert.equal(noParam.data.range, 'month', 'default range');

  const custom = await call('GET', `/api/purchases?range=custom&from=${shiftDay(-25)}&to=${shiftDay(-10)}`);
  assert.equal(custom.status, 200);
  assert.deepEqual(olds(custom), ['Old B']);
  assert.equal(custom.data.label, 'Custom Range');
  assert.deepEqual(olds(await call('GET', `/api/purchases?range=custom&from=${d3}&to=${d3}`)), ['Old A'], 'single custom day');
  assert.equal((await call('GET', `/api/purchases?range=custom&from=${shiftDay(-1)}&to=${shiftDay(-1)}`)).data.count, 0);

  for (const bad of ['range=weekly', 'range=custom', 'range=custom&from=2026-01-01', 'range=custom&from=nope&to=2026-01-02',
    'range=custom&from=2026-02-31&to=2026-03-01', 'range=custom&from=2026-05-02&to=2026-05-01']) {
    assert.equal((await call('GET', `/api/purchases?${bad}`)).status, 400, bad);
  }
});

test('purchases: ledger survives product deletion (snapshot kept)', async () => {
  assert.equal((await call('DELETE', `/api/products/${ledgerProduct.id}`)).status, 200);
  const r = await call('GET', '/api/purchases?range=today');
  assert.ok(r.data.items.some((i) => i.productName === 'Ledger Item'));
});

// ---------- Delete + misc ----------
test('products: delete (200), then 404, bad id 400; old sales keep their lines', async () => {
  assert.equal((await call('DELETE', `/api/products/${cable.id}`)).status, 200);
  assert.equal((await call('DELETE', `/api/products/${cable.id}`)).status, 404);
  assert.equal((await call('DELETE', '/api/products/xyz')).status, 400);
  const sales = (await call('GET', '/api/sales')).data;
  assert.ok(sales.some((s) => s.items.some((i) => i.name === 'USB Cable')));
  assert.equal((await call('DELETE', `/api/expenses/${expense.id}`)).status, 200);
});

test('unknown route -> 404 JSON, bad JSON body -> 400', async () => {
  const r = await call('GET', '/api/nope');
  assert.equal(r.status, 404);
  assert.ok(r.data.message);
  const bad = await fetch(base + '/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: '{oops'
  });
  assert.equal(bad.status, 400);
});

test('CORS allows the Vite dev origin', async () => {
  const res = await fetch(base + '/api/products', {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' }
  });
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const blocked = await fetch(base + '/api/health', { headers: { Origin: 'http://evil.example' } });
  assert.equal(blocked.headers.get('access-control-allow-origin'), null);
});
