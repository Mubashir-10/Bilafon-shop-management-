import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';
import ExpenseSlipModal from '../components/modals/ExpenseSlipModal';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

// '2026-03' -> 'March 2026'
const monthName = (ym) => {
  const [y, m] = ym.split('-');
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
};

export default function Expenses({ expenses, onOpenExpenseModal, onDeleteExpense }) {
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 'YYYY-MM'
  const [showSlip, setShowSlip] = useState(false);

  // Months that actually have expenses, newest first (e.g. 2026-04, 2026-03)
  const months = useMemo(
    () => [...new Set(expenses.map((e) => String(e.date).slice(0, 7)))].sort().reverse(),
    [expenses]
  );

  // If the chosen month has no entries any more (e.g. last one deleted) fall back to all.
  const activeMonth = selectedMonth === 'all' || months.includes(selectedMonth) ? selectedMonth : 'all';

  const visible = useMemo(
    () => (activeMonth === 'all' ? expenses : expenses.filter((e) => String(e.date).startsWith(activeMonth))),
    [expenses, activeMonth]
  );
  const visibleTotal = visible.reduce((sum, e) => sum + e.amount, 0);
  const periodLabel = activeMonth === 'all' ? 'All Expenses' : `Month: ${monthName(activeMonth)} (${activeMonth})`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="font-bold text-white text-base">Shop Expense Tracker</h3>
          <p className="text-xs text-slate-400">Rent, WAPDA Bills, Tea, Freight, Transport etc.</p>
        </div>
        <button
          onClick={onOpenExpenseModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Naya Expense Add Karein</span>
        </button>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 bg-[#1E293B] border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3 text-xs">
          <label htmlFor="expense-month" className="text-slate-400 font-medium">Month:</label>
          <select
            id="expense-month"
            value={activeMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>{m} — {monthName(m)}</option>
            ))}
          </select>
          <span className="text-slate-400">
            {visible.length} entries · Total:{' '}
            <strong className="text-rose-400 font-mono">Rs. {visibleTotal.toLocaleString()}</strong>
          </span>
        </div>

        <button
          onClick={() => setShowSlip(true)}
          disabled={visible.length === 0}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          <span>Print Month Slip</span>
        </button>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {visible.map((e) => (
              <tr key={e.id} className="hover:bg-slate-800/40">
                <td className="p-4 font-semibold text-white">{e.title}</td>
                <td className="p-4 text-slate-300">{e.category}</td>
                <td className="p-4 text-slate-400">{e.date}</td>
                <td className="p-4 font-bold text-rose-400 font-mono">Rs. {e.amount.toLocaleString()}</td>
                <td className="p-4 text-slate-400">{e.description || '-'}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onDeleteExpense(e.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Expense"
                    aria-label={`Delete expense ${e.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">Is month mein koi expense nahi hai.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showSlip && (
        <ExpenseSlipModal expenses={visible} periodLabel={periodLabel} onClose={() => setShowSlip(false)} />
      )}
    </div>
  );
}
