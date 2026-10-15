import React from 'react';
import PrintModal from './PrintModal';

const TITLES = {
  today: '1 Day Khareed Summary',
  '15days': '15 Days Khareed Summary',
  month: 'Monthly Khareed Summary',
  custom: 'Custom Range Khareed Summary'
};

// Official printable stock-purchase (Khareed) bill for the selected range.
export default function PurchaseBillModal({ data, onClose }) {
  const title = TITLES[data.range] || 'Khareed Summary';

  return (
    <PrintModal onClose={onClose} widthClass="max-w-3xl">
      <div className="text-center border-b-2 border-slate-800 pb-3">
        <h2 className="text-lg font-bold uppercase tracking-wider">BILAFON MOBILE SHOP</h2>
        <p className="text-[11px] text-slate-600">Stock Purchase Bill / Khareed Receipt</p>
        <p className="text-sm font-bold mt-2">{title}</p>
        <p className="text-[11px] text-slate-700">
          Period: {data.from}{data.from !== data.to ? ` to ${data.to}` : ''}
        </p>
        <p className="text-[10px] text-slate-500">Printed: {new Date().toLocaleString()}</p>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-400">
            <th className="py-1 pr-2">#</th>
            <th className="py-1 pr-2">Product</th>
            <th className="py-1 pr-2">Supplier</th>
            <th className="py-1 pr-2 text-right">Qty</th>
            <th className="py-1 pr-2 text-right">Rate</th>
            <th className="py-1 text-right">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, idx) => (
            <tr key={it.id} className="border-b border-dashed border-slate-300 align-top">
              <td className="py-1.5 pr-2 text-slate-500">{idx + 1}</td>
              <td className="py-1.5 pr-2">
                {it.productName}
                <span className="block text-[10px] text-slate-500">{it.date}{it.sku ? ` · ${it.sku}` : ''}</span>
              </td>
              <td className="py-1.5 pr-2">{it.supplier || '-'}</td>
              <td className="py-1.5 pr-2 text-right">{it.quantity}</td>
              <td className="py-1.5 pr-2 text-right whitespace-nowrap">Rs. {it.purchasePrice.toLocaleString()}</td>
              <td className="py-1.5 text-right whitespace-nowrap">Rs. {it.totalCost.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t-2 border-slate-800 pt-2 space-y-1">
        <div className="flex justify-between text-[11px] text-slate-600">
          <span>Total items purchased (pieces)</span>
          <span>{data.totalQuantity}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>GRAND TOTAL STOCK PURCHASE</span>
          <span>Rs. {data.totalCost.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-between pt-8 text-[10px] text-slate-500">
        <span className="border-t border-slate-400 pt-1 px-4">Supplier Signature</span>
        <span className="border-t border-slate-400 pt-1 px-4">Shop Signature</span>
      </div>
    </PrintModal>
  );
}
