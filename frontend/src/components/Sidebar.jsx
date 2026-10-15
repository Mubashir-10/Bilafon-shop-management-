import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, AlertTriangle, Wallet,
  BarChart3, Settings, LogOut, Plus, Store, ChevronRight
} from 'lucide-react';

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  lowStockCount,
  onOpenAddModal,
  onLogout
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart },
    { id: 'products', label: 'Products & Stock', icon: Package },
    { id: 'stock-alerts', label: 'Low Stock Alerts', icon: AlertTriangle, badge: lowStockCount },
    { id: 'categories', label: 'Categories', icon: Store },
    { id: 'expenses', label: 'Shop Expenses', icon: Wallet },
    { id: 'reports', label: 'Sales & Profit', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1E293B] border-r border-slate-800 flex flex-col transition-all duration-300 z-30`}>
      <div className="h-16 flex items-center px-4 border-b border-slate-800 justify-between">
        {sidebarOpen ? (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight leading-tight">
              Bilafon<span className="text-cyan-400 text-xs block font-normal">Mobile Shop</span>
            </span>
          </div>
        ) : (
          <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center text-cyan-400 mx-auto">
            <Store className="w-5 h-5" />
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white p-1 rounded-lg">
          <ChevronRight className={`w-5 h-5 transform transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl p-3 flex items-center justify-center space-x-2 font-medium text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          {sidebarOpen && <span>+ Stock Add Karein</span>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </div>
              {sidebarOpen && item.badge > 0 && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
