import React from 'react';

export default function Header({ activeTab }) {
  return (
    <header className="h-16 bg-[#1E293B]/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">
          {activeTab.replace('-', ' ')}
        </h2>
        <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700">
          Currency: PKR (Rs.)
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white">Bilafon Mobile Shop</p>
          <p className="text-xs text-slate-400">Admin Account</p>
        </div>
      </div>
    </header>
  );
}
