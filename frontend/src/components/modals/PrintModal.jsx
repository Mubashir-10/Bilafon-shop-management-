import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer } from 'lucide-react';

// Shared shell for printable documents (expense slip, purchase bill).
// Rendered in a portal so a long document can print across several pages.
export default function PrintModal({ onClose, children, widthClass = 'max-w-md' }) {
  useEffect(() => {
    document.body.classList.add('printing-slip');
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('printing-slip');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto flex items-start justify-center p-4 print:static print:block print:bg-white print:p-0 print:overflow-visible">
      <div
        className={`print-doc bg-white text-slate-900 rounded-2xl w-full ${widthClass} p-6 space-y-4 shadow-2xl font-mono text-xs my-4 print:my-0 print:max-w-none print:p-0 print:shadow-none print:rounded-none`}
      >
        <div className="space-y-3">{children}</div>

        <div className="flex space-x-2 pt-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
