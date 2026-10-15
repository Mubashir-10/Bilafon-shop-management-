import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

export default function POS({ products, categories, onCheckout }) {
  const [posSearch, setPosSearch] = useState('');
  const [posCategoryFilter, setPosCategoryFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerName, setCustomerName] = useState('Walk-in Customer');

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      alert("Yeh product Out of Stock hai!");
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stockQuantity) {
        alert("Aap is se zyada stock add nahi kar sakte!");
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateCartQty = (productId, qty) => {
    if (qty <= 0) {
      setCart(cart.filter(item => item.id !== productId));
      return;
    }
    const prod = products.find(p => p.id === productId);
    if (prod && qty > prod.stockQuantity) {
      alert("Aap ke pas itna stock maujood nahi hai!");
      return;
    }
    setCart(cart.map(item => item.id === productId ? { ...item, qty } : item));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);
  const cartCostTotal = cart.reduce((sum, item) => sum + (item.purchasePrice * item.qty), 0);
  const cartFinalTotal = Math.max(0, cartSubtotal - posDiscount);
  const cartProfit = Math.max(0, cartFinalTotal - cartCostTotal);

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert("Cart khali hai! Pehle product add karein.");
      return;
    }

    const saleData = {
      cart,
      customerName,
      paymentMethod,
      subtotal: cartSubtotal,
      discount: Number(posDiscount),
      total: cartFinalTotal,
      profit: cartProfit
    };

    const saved = await onCheckout(saleData);
    if (saved) {
      setCart([]);
      setPosDiscount(0);
    }
  };

  const posFilteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
    const matchesCategory = posCategoryFilter === 'All' || p.category === posCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-7 flex flex-col bg-[#1E293B] border border-slate-800 rounded-2xl p-4 overflow-hidden">
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product by name or SKU..."
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setPosCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                posCategoryFilter === 'All'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              All Items
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setPosCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  posCategoryFilter === c
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
          {posFilteredProducts.map(p => {
            const isOut = p.stockQuantity <= 0;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={isOut}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                  isOut
                    ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                    : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    {p.category}
                  </span>
                  <h4 className="font-semibold text-white text-xs mt-2 line-clamp-2">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{p.brand}</p>
                </div>

                <div className="mt-3 flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-white">Rs. {p.sellingPrice}</p>
                    <p className={`text-[10px] ${isOut ? 'text-rose-400' : 'text-slate-400'}`}>
                      Stock: {p.stockQuantity}
                    </p>
                  </div>
                  <div className="w-7 h-7 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-5 bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-base">Customer Cart</h3>
              <p className="text-slate-400 text-xs">Bilafon POS Terminal</p>
            </div>
            <button
              onClick={() => setCart([])}
              className="text-xs text-rose-400 hover:underline"
            >
              Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
              >
                <option value="Cash">Cash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Cart khali hai. Left side se items click karke add karein.
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="flex-1 pr-2">
                    <h5 className="text-xs font-semibold text-white truncate">{item.name}</h5>
                    <p className="text-[11px] text-cyan-400 font-mono">Rs. {item.sellingPrice}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-slate-700 rounded-lg bg-slate-800">
                      <button
                        onClick={() => updateCartQty(item.id, item.qty - 1)}
                        className="px-2 py-0.5 text-xs text-slate-300 hover:text-white"
                      >
                        -
                      </button>
                      <span className="px-2 py-0.5 text-xs font-bold text-white">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.id, item.qty + 1)}
                        className="px-2 py-0.5 text-xs text-slate-300 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => updateCartQty(item.id, 0)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal:</span>
            <span className="font-semibold text-white">Rs. {cartSubtotal}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Discount (Rs.):</span>
            <input
              type="number"
              value={posDiscount}
              onChange={(e) => setPosDiscount(Number(e.target.value))}
              className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-white"
            />
          </div>

          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800/80">
            <span>Final Bill:</span>
            <span className="text-cyan-400 text-lg">Rs. {cartFinalTotal.toLocaleString()}</span>
          </div>

          <button
            onClick={handleCompleteSale}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition"
          >
            Complete Sale & Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
