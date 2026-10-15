import React from 'react';
import { DollarSign, ArrowUpRight, Package, AlertTriangle, Plus, ShoppingCart, Eye } from 'lucide-react';

export default function Dashboard({ stats, sales, onOpenAddModal, onNavigate, onViewReceipt }) {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Total Sales</p>
              <h3 className="text-2xl font-bold text-white mt-1">Rs. {stats.todayTotal.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Calculated from completed POS bills</p>
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Gross Profit</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">Rs. {stats.todayProfit.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Retail Price - Purchase Cost</p>
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Products</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalActiveProducts} Items</h3>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Available in inventory</p>
        </div>

        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.lowStockCount} Products</h3>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Needs restocking soon</p>
        </div>
      </div>

      {/* Quick Actions & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Dukan Stock Quick Add</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Jab bhi aas-paas ya doosri dukan se koi naya mobile accessory ya saman layen, toh instantly yahan click karke stock mein add karein.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onOpenAddModal}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <Plus className="w-5 h-5" />
              <span>+ Naya Product / Stock Add Karein</span>
            </button>
            <button
              onClick={() => onNavigate('pos')}
              className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Open POS Billing Screen</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Recent Customer Receipts</h3>
            <button onClick={() => onNavigate('reports')} className="text-xs text-cyan-400 hover:underline">
              View All Reports
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Profit</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sales.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-medium text-cyan-400">{s.id}</td>
                    <td className="p-3 text-slate-200">{s.customerName}</td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">Rs. {s.total.toLocaleString()}</td>
                    <td className="p-3 font-semibold text-emerald-400">+Rs. {s.profit.toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewReceipt(s)}
                        className="text-slate-400 hover:text-cyan-400 p-1"
                        title="View Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
