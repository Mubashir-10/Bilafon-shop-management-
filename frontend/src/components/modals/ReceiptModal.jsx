import React from 'react';
import { Printer } from 'lucide-react';

export default function ReceiptModal({ activeReceipt, onClose }) {
  if (!activeReceipt) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
        <div id="printable-receipt" className="space-y-3">
          <div className="text-center border-b border-dashed border-slate-300 pb-3">
            <h2 className="text-base font-bold uppercase tracking-wider">BILAFON MOBILE SHOP</h2>
            <p className="text-[11px] text-slate-600">Mobile Accessories & Retail Shop</p>
            <p className="text-[10px] text-slate-500">Invoice: {activeReceipt.id}</p>
            <p className="text-[10px] text-slate-500">{activeReceipt.date}</p>
          </div>

          <div>
            <p className="text-[11px]">Customer: <strong>{activeReceipt.customerName}</strong></p>
            <p className="text-[11px]">Payment: <strong>{activeReceipt.paymentMethod}</strong></p>
          </div>

          <table className="w-full text-left border-t border-b border-dashed border-slate-300 py-2">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeReceipt.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-1 font-semibold text-[11px]">{it.name}</td>
                  <td className="py-1 text-center">{it.qty}</td>
                  <td className="py-1 text-right">Rs. {it.price * it.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-1 text-right text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {activeReceipt.subtotal}</span>
            </div>
            {activeReceipt.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-Rs. {activeReceipt.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
              <span>Grand Total:</span>
              <span>Rs. {activeReceipt.total}</span>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
            <p>Shukriya for shopping with Bilafon Mobile!</p>
            <p>Items once sold are exchangeable within 3 days.</p>
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 text-white py-2 rounded-xl font-sans font-semibold flex items-center justify-center space-x-2 text-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="bg-slate-200 text-slate-800 px-4 py-2 rounded-xl font-sans font-semibold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
