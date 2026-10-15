import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import PurchaseLedger from '../components/PurchaseLedger';

export default function Products({
  products,
  categories,
  onOpenAddModal,
  onAdjustStock,
  onDeleteProduct
}) {
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-1 items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Doosri Dukan / Wholesale Stock Add Karein</span>
        </button>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">SKU / Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Purchase Price</th>
                <th className="p-4">Selling Price</th>
                <th className="p-4">Stock Qty</th>
                <th className="p-4">Supplier</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(p => {
                const isLow = p.stockQuantity <= p.minStockLevel && p.stockQuantity > 0;
                const isOut = p.stockQuantity === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-4">
                      <div>
                        <span className="font-mono text-cyan-400 font-medium">{p.sku}</span>
                        <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                        <span className="text-slate-400 text-[11px]">{p.brand} • {p.model}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{p.category}</td>
                    <td className="p-4 text-slate-400 font-mono">Rs. {p.purchasePrice}</td>
                    <td className="p-4 text-emerald-400 font-mono font-bold">Rs. {p.sellingPrice}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold px-2 py-0.5 rounded-md ${
                          isOut ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          isLow ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-slate-800 text-white'
                        }`}>
                          {p.stockQuantity} pcs
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onAdjustStock(p.id, 1)}
                            className="w-6 h-6 bg-slate-800 hover:bg-cyan-600 text-white rounded flex items-center justify-center font-bold"
                            title="Quick Add 1 Stock"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onAdjustStock(p.id, -1)}
                            className="w-6 h-6 bg-slate-800 hover:bg-rose-600 text-white rounded flex items-center justify-center font-bold"
                            title="Minus 1 Stock"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{p.supplier}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PurchaseLedger refreshKey={products} />
    </div>
  );
}
