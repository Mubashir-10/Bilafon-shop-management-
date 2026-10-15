import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AddProductModal from './components/modals/AddProductModal';
import AddExpenseModal from './components/modals/AddExpenseModal';
import ReceiptModal from './components/modals/ReceiptModal';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import StockAlerts from './pages/StockAlerts';
import Categories from './pages/Categories';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import {
  productService,
  categoryService,
  salesService,
  expenseService,
  dashboardService,
  tokenStore,
  getErrorMessage
} from './services/api';

const EMPTY_STATS = {
  todayTotal: 0,
  todayProfit: 0,
  totalRevenue: 0,
  totalProfit: 0,
  totalActiveProducts: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  totalExpenses: 0,
  netProfit: 0
};

const EMPTY_PRODUCT_FORM = (category) => ({
  name: '',
  category,
  brand: '',
  model: '',
  purchasePrice: '',
  sellingPrice: '',
  stockQuantity: '',
  minStockLevel: '3',
  supplier: 'Doosri Dukan / Wholesale Market',
  sku: ''
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!tokenStore.get());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Core States (now loaded from MongoDB through the API)
  const [categories, setCategories] = useState([]); // names only (used by POS / Products / forms)
  const [categoryItems, setCategoryItems] = useState([]); // full records {id, name, status} for the Categories page
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);

  // Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Form States
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT_FORM('Data Cables'));

  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'General',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Guards: stop double-clicks creating duplicate records, and stop slow,
  // older responses from overwriting fresher data.
  const loadSeq = useRef(0);
  const busy = useRef({ product: false, expense: false, checkout: false });
  const backendAlerted = useRef(false);

  // ---------- Data loading ----------
  const loadAll = useCallback(async () => {
    const seq = ++loadSeq.current;
    try {
      const [p, c, e, s, st] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        expenseService.getAll(),
        salesService.getAll(),
        dashboardService.getStats()
      ]);
      if (seq !== loadSeq.current) return; // a newer change happened meanwhile
      setProducts(p.data);
      setCategories(c.data.map((cat) => cat.name));
      setCategoryItems(c.data);
      setExpenses(e.data);
      setSales(s.data);
      setStats(st.data);
      backendAlerted.current = false;
    } catch (err) {
      if (err.response?.status === 401) return; // handled by the unauthorized listener
      console.error('Failed to load data', err);
      if (!backendAlerted.current) {
        backendAlerted.current = true;
        alert(getErrorMessage(err));
      }
    }
  }, []);

  // Refresh only the lists that changed (+ dashboard numbers) after an action.
  const FETCHERS = {
    products: () => productService.getAll().then((r) => setProducts(r.data)),
    categories: () =>
      categoryService.getAll().then((r) => {
        setCategories(r.data.map((c) => c.name));
        setCategoryItems(r.data);
      }),
    expenses: () => expenseService.getAll().then((r) => setExpenses(r.data)),
    sales: () => salesService.getAll().then((r) => setSales(r.data))
  };
  const refreshData = async (parts) => {
    loadSeq.current++; // invalidate any older in-flight full load
    await Promise.all([
      ...parts.map((k) => FETCHERS[k]()),
      dashboardService.getStats().then((r) => setStats(r.data))
    ]);
  };
  const safeRefresh = async (parts) => {
    try {
      await refreshData(parts);
    } catch (err) {
      console.error('Refresh failed', err);
    }
  };

  // Load on login and whenever the user switches page (keeps data fresh).
  useEffect(() => {
    if (isLoggedIn) loadAll();
  }, [isLoggedIn, activeTab, loadAll]);

  // Token expired/invalid -> back to login
  useEffect(() => {
    const onUnauthorized = () => setIsLoggedIn(false);
    window.addEventListener('bilafon:unauthorized', onUnauthorized);
    return () => window.removeEventListener('bilafon:unauthorized', onUnauthorized);
  }, []);

  // Make sure the "new product" form starts on a category that exists.
  useEffect(() => {
    if (categories.length && !categories.includes(newProduct.category)) {
      setNewProduct((prev) => ({ ...prev, category: categories[0] }));
    }
  }, [categories]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Handlers ----------
  // Login page calls authService.login() itself and hands over the result.
  const handleLogin = (data) => {
    tokenStore.set(data.token);
    tokenStore.setUser(data.user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    tokenStore.clear();
    setIsLoggedIn(false);
    setProducts([]);
    setSales([]);
    setExpenses([]);
    setStats(EMPTY_STATS);
    setActiveTab('dashboard');
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sellingPrice || !newProduct.stockQuantity) {
      alert("Meharbani karke Product Ka Naam, Selling Price aur Stock Quantity zaroor bharen!");
      return;
    }
    if (busy.current.product) return;
    busy.current.product = true;

    try {
      await productService.create({
        name: newProduct.name,
        sku: newProduct.sku || undefined, // server generates one if blank
        category: newProduct.category,
        brand: newProduct.brand || 'Generic',
        model: newProduct.model || 'Universal',
        purchasePrice: Number(newProduct.purchasePrice) || 0,
        sellingPrice: Number(newProduct.sellingPrice),
        stockQuantity: Number(newProduct.stockQuantity),
        minStockLevel: Number(newProduct.minStockLevel) || 3,
        supplier: newProduct.supplier || 'Local Market'
      });
    } catch (err) {
      alert(getErrorMessage(err));
      busy.current.product = false;
      return;
    }

    setShowAddProductModal(false);
    setNewProduct(EMPTY_PRODUCT_FORM(categories[0] || 'Data Cables'));
    busy.current.product = false;
    await safeRefresh(['products']);
  };

  const handleAdjustStock = async (productId, delta) => {
    try {
      const { data } = await productService.update(productId, { stockAdjustment: delta });
      loadSeq.current++;
      setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      await safeRefresh([]); // dashboard / sidebar low-stock numbers
    } catch (err) {
      alert(getErrorMessage(err));
      if (err.response?.status === 404) await safeRefresh(['products']);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Kya aap waqai is product ko delete karna chahte hain?")) return;
    try {
      await productService.delete(id);
    } catch (err) {
      if (err.response?.status !== 404) {
        alert(getErrorMessage(err));
        return;
      }
    }
    loadSeq.current++;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await safeRefresh([]);
  };

  const handleAddCategory = async (categoryName) => {
    if (!categoryName) return;
    if (categories.some((c) => c.toLowerCase() === categoryName.toLowerCase())) return;
    try {
      await categoryService.create(categoryName);
      await safeRefresh(['categories']);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDeleteCategory = async (category) => {
    const used = products.filter((p) => p.category === category.name).length;
    const warning = used
      ? `\n\nNote: ${used} product(s) is category mein hain. Wo products delete nahi honge, bas category list se hat jayegi.`
      : '';
    if (!window.confirm(`Kya aap category "${category.name}" ko hamesha ke liye delete karna chahte hain?${warning}`)) return;

    try {
      await categoryService.delete(category.id);
    } catch (err) {
      if (err.response?.status !== 404) {
        alert(getErrorMessage(err));
        return;
      }
      // 404 = already deleted elsewhere; just refresh below
    }
    await safeRefresh(['categories']);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Kya aap waqai is expense ko delete karna chahte hain?")) return;
    try {
      await expenseService.delete(id);
    } catch (err) {
      if (err.response?.status !== 404) {
        alert(getErrorMessage(err));
        return;
      }
    }
    await safeRefresh(['expenses']);
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    if (busy.current.expense) return;
    busy.current.expense = true;

    try {
      await expenseService.create({ ...newExpense, amount: Number(newExpense.amount) });
    } catch (err) {
      alert(getErrorMessage(err));
      busy.current.expense = false;
      return;
    }

    setShowAddExpenseModal(false);
    setNewExpense({ title: '', category: 'General', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    busy.current.expense = false;
    await safeRefresh(['expenses']);
  };

  // Returns true when the sale was saved (POS clears the cart only then).
  const handlePOSCheckout = async (saleData) => {
    if (busy.current.checkout) return false;
    busy.current.checkout = true;

    let sale;
    try {
      // Only ids + quantities are sent. The server looks up prices, checks
      // stock, deducts it and calculates the profit itself.
      const res = await salesService.create({
        customerName: saleData.customerName,
        paymentMethod: saleData.paymentMethod,
        discount: saleData.discount,
        items: saleData.cart.map((i) => ({ productId: i.id, qty: i.qty }))
      });
      sale = res.data;
    } catch (err) {
      alert(getErrorMessage(err, 'Sale save nahi ho saki'));
      busy.current.checkout = false;
      await safeRefresh(['products']); // show the real stock numbers
      return false;
    }

    setActiveReceipt(sale);
    busy.current.checkout = false;
    await safeRefresh(['products', 'sales']);
    return true;
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  // frontend/src/App.jsx ni andar handlers jya chhe tya add karo:

const handleDeleteSale = async (sale) => {
  if (!window.confirm(`Kya aap Invoice ${sale.id || sale.invoiceId} ko delete karna chahte hain? Is se stock wapas add ho jayega.`)) return;

  try {
    const saleId = sale._id || sale.id;
    await salesService.delete(saleId);
    await safeRefresh(['sales', 'products']);
  } catch (err) {
    alert(getErrorMessage(err, 'Sale delete nahi ho saki'));
  }
};
  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-100 overflow-hidden font-sans">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={stats.lowStockCount}
        onOpenAddModal={() => setShowAddProductModal(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto flex flex-col bg-[#0F172A]">
        <Header activeTab={activeTab} />

        <div className="p-6 space-y-6 flex-1">
       {activeTab === 'dashboard' && (
  <Dashboard
    stats={stats}
    sales={sales}
    onOpenAddModal={() => setShowAddProductModal(true)}
    onNavigate={setActiveTab}
    onViewReceipt={setActiveReceipt}
    onDeleteSale={handleDeleteSale} // <-- Pass delete prop
  />
)}

          {activeTab === 'pos' && (
            <POS
              products={products}
              categories={categories}
              onCheckout={handlePOSCheckout}
            />
          )}

          {activeTab === 'products' && (
            <Products
              products={products}
              categories={categories}
              onOpenAddModal={() => setShowAddProductModal(true)}
              onAdjustStock={handleAdjustStock}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'stock-alerts' && (
            <StockAlerts
              products={products}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeTab === 'categories' && (
            <Categories
              categoryItems={categoryItems}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'expenses' && (
            <Expenses
              expenses={expenses}
              onOpenExpenseModal={() => setShowAddExpenseModal(true)}
              onDeleteExpense={handleDeleteExpense}
            />
          )}
          

    {activeTab === 'reports' && (
  <Reports
    stats={{ ...stats, todayTotal: stats.totalRevenue }}
    sales={sales}
    onViewReceipt={setActiveReceipt}
    onDeleteSale={handleDeleteSale}
  />
)}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      {/* Modals */}
      <AddProductModal
        show={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
        onSubmit={handleAddProductSubmit}
      />

      <AddExpenseModal
        show={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        newExpense={newExpense}
        setNewExpense={setNewExpense}
        onSubmit={handleAddExpenseSubmit}
      />

      <ReceiptModal
        activeReceipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
}
