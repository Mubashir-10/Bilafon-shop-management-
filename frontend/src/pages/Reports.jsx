import React from 'react';
import { Trash2 } from 'lucide-react';

export default function Reports({ stats, sales, onViewReceipt, onDeleteSale }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</p>
          <h3 className="text-2xl font-bold text-white mt-1">Rs. {stats.todayTotal.toLocaleString()}</h3>
        </div>
        <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Shop Expenses</p>
          <h3 className="text-2xl font-bold text-rose-400 mt-1">Rs. {stats.totalExpenses.toLocaleString()}</h3>
        </div>
        <div className="bg-[#1E293B] border border-slate-800 p-5 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">Estimated Net Profit</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">
            Rs. {stats.netProfit.toLocaleString()}
          </h3>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold text-white text-base mb-4">Complete Sales History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Count</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Profit</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sales.map(s => (
                <tr key={s._id || s.id} className="hover:bg-slate-800/40">
                  <td className="p-4 font-mono font-semibold text-cyan-400">{s.id || s.invoiceId}</td>
                  <td className="p-4 text-slate-400">{s.date}</td>
                  <td className="p-4 text-slate-200">{s.customerName}</td>
                  <td className="p-4 text-slate-300">{s.items.length} items</td>
                  <td className="p-4 font-bold text-white font-mono">Rs. {s.total}</td>
                  <td className="p-4 font-bold text-emerald-400 font-mono">+Rs. {s.profit}</td>
                  <td className="p-4 text-right flex items-center justify-end space-x-3">
                    <button
                      onClick={() => onViewReceipt(s)}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      Print
                    </button>
                    <button
                      onClick={() => onDeleteSale(s)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete Sale"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}