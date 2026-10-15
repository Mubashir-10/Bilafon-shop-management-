import React, { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { purchaseService, getErrorMessage } from '../services/api';
import PurchaseBillModal from './modals/PurchaseBillModal';

const RANGES = [
  { id: 'today', label: '1 Day (Today)' },
  { id: '15days', label: '15 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Date Range' }
];

// Stock Purchase History & Supplier Billing.
// `refreshKey` changes whenever stock changes (the products list is re-fetched),
// so newly added stock shows up here straight away.
export default function PurchaseLedger({ refreshKey }) {
  const [range, setRange] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBill, setShowBill] = useState(false);

  const customReady = range !== 'custom' || (from && to && from <= to);

  useEffect(() => {
    if (!customReady) {
      setData(null);
      setError(range === 'custom' && from && to && from > to ? 'Start date end date se pehle honi chahiye.' : '');
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    const params = range === 'custom' ? { range, from, to } : { range };

    purchaseService
      .getAll(params)
      .then((res) => !cancelled && setData(res.data))
      .catch((err) => {
        if (cancelled || err.response?.status === 401) return;
        setData(null);
        setError(getErrorMessage(err, 'Purchase history load nahi ho saki.'));
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [range, from, to, customReady, refreshKey]);

  const items = data?.items || [];

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h3 className="font-bold text-white text-base">Stock Purchase History &amp; Supplier Billing</h3>
          <p className="text-xs text-slate-400">Kab, kis supplier se, kitna maal kis rate par khareeda.</p>
        </div>
        <button
          onClick={() => setShowBill(true)}
          disabled={!data || items.length === 0}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          <span>Print Overall Purchase Bill / Khareed Receipt</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`px-3.5 py-2 rounded-xl font-semibold border transition ${
              range === r.id
                ? 'bg-cyan-600 border-cyan-600 text-white'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500'
            }`}
          >
            {r.label}
          </button>
        ))}

        {range === 'custom' && (
          <div className="flex items-center gap-2 ml-1">
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="Start date"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <span className="text-slate-500">se</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
              aria-label="End date"
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </div>

      {error && (
        <div role="alert" className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {range === 'custom' && !customReady && !error && (
        <p className="text-xs text-slate-400">Start aur End date chunein.</p>
      )}

      {data && (
        <>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400">
            <span>{data.label}: <strong className="text-slate-200">{data.from}{data.from !== data.to ? ` → ${data.to}` : ''}</strong></span>
            <span>Entries: <strong className="text-slate-200">{data.count}</strong></span>
            <span>Pieces: <strong className="text-slate-200">{data.totalQuantity}</strong></span>
            <span>Total Khareed: <strong className="text-amber-400 font-mono">Rs. {data.totalCost.toLocaleString()}</strong></span>
          </div>

          <div className={`border border-slate-800 rounded-xl overflow-x-auto ${loading ? 'opacity-60' : ''}`}>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3 text-right">Khareed Rate</th>
                  <th className="p-3 text-right">Qty Added</th>
                  <th className="p-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400 whitespace-nowrap">{it.date}</td>
                    <td className="p-3 font-semibold text-white">
                      {it.productName}
                      {it.sku && <span className="block text-[10px] font-normal text-slate-500">{it.sku}</span>}
                    </td>
                    <td className="p-3 text-slate-300">{it.supplier || '-'}</td>
                    <td className="p-3 text-right font-mono text-slate-300">Rs. {it.purchasePrice.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-white">{it.quantity}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">Rs. {it.totalCost.toLocaleString()}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">Is muddat mein koi stock purchase nahi hui.</td>
                  </tr>
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-slate-900/60 border-t border-slate-700">
                  <tr className="font-bold text-white">
                    <td className="p-3" colSpan="4">Grand Total</td>
                    <td className="p-3 text-right font-mono">{data.totalQuantity}</td>
                    <td className="p-3 text-right font-mono text-amber-400">Rs. {data.totalCost.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      {showBill && data && <PurchaseBillModal data={data} onClose={() => setShowBill(false)} />}
    </div>
  );
}
