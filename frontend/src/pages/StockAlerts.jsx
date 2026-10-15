import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function StockAlerts({ products, onAdjustStock }) {
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minStockLevel);

  return (
    <div className="space-y-6">
      <div className="bg-[#1E293B] border border-amber-500/30 rounded-2xl p-5 flex items-center space-x-4">
        <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base">Low Stock Warning & Reorder List</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Niche wo tamam products maujood hain jin ka stock khatam hone wala hai ya khatam ho chuka hai.
          </p>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Min Stock Limit</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {lowStockProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-semibold text-white">{p.name}</td>
                <td className="p-4 text-slate-300">{p.category}</td>
                <td className="p-4 font-bold text-rose-400">{p.stockQuantity} pcs</td>
                <td className="p-4 text-slate-400">{p.minStockLevel} pcs</td>
                <td className="p-4">
                  {p.stockQuantity === 0 ? (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      OUT OF STOCK
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                      LOW STOCK
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onAdjustStock(p.id, 10)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition"
                  >
                    + 10 Stock Add Karein
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
