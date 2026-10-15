import React from 'react';
import PrintModal from './PrintModal';

// Printable expense slip for the rows currently shown on the Expenses page.
export default function ExpenseSlipModal({ expenses, periodLabel, onClose }) {
  // Oldest first reads naturally on a slip.
  const rows = [...expenses].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));
  const total = rows.reduce((sum, e) => sum + e.amount, 0);

  return (
    <PrintModal onClose={onClose} widthClass="max-w-md">
      <div className="text-center border-b border-dashed border-slate-300 pb-3">
        <h2 className="text-base font-bold uppercase tracking-wider">BILAFON MOBILE SHOP</h2>
        <p className="text-[11px] text-slate-600">Expense Slip</p>
        <p className="text-[11px] font-bold mt-1">{periodLabel}</p>
        <p className="text-[10px] text-slate-500">Printed: {new Date().toLocaleString()}</p>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-300">
            <th className="py-1 pr-2">Date</th>
            <th className="py-1 pr-2">Title</th>
            <th className="py-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="border-b border-dashed border-slate-200 align-top">
              <td className="py-1.5 pr-2 whitespace-nowrap">{e.date}</td>
              <td className="py-1.5 pr-2">
                {e.title}
                {e.category && <span className="block text-[10px] text-slate-500">{e.category}</span>}
              </td>
              <td className="py-1.5 text-right whitespace-nowrap">Rs. {e.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t-2 border-slate-800 pt-2 space-y-1">
        <div className="flex justify-between text-[11px] text-slate-600">
          <span>Total entries</span>
          <span>{rows.length}</span>
        </div>
        <div className="flex justify-between text-sm font-bold">
          <span>TOTAL EXPENDITURE</span>
          <span>Rs. {total.toLocaleString()}</span>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-500 pt-2">-- End of Expense Slip --</p>
    </PrintModal>
  );
}
