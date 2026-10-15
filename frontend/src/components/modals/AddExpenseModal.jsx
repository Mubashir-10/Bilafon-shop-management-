import React from 'react';
import { X } from 'lucide-react';

export default function AddExpenseModal({
  show,
  onClose,
  newExpense,
  setNewExpense,
  onSubmit
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-base">Add Shop Expense</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1">Expense Title *</label>
            <input
              type="text"
              placeholder="e.g. Shop Rent, WAPDA Bill, Tea"
              value={newExpense.title}
              onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Amount (PKR) *</label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Description</label>
            <input
              type="text"
              placeholder="Optional details..."
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl font-semibold shadow"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
