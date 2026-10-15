import React from 'react';
import { X } from 'lucide-react';

export default function AddProductModal({
  show,
  onClose,
  newProduct,
  setNewProduct,
  categories,
  onSubmit
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-base">Product / Stock Add Karein</h3>
            <p className="text-xs text-slate-400">Doosri dukan ya wholesale market se laya gaya saman enter karein</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Product Ka Naam *</label>
            <input
              type="text"
              placeholder="e.g. Type-C Fast Cable 65W"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Brand / Company</label>
              <input
                type="text"
                placeholder="e.g. Ronin, Samsung, Faster"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Kharid Price (Purchase Cost PKR)</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={newProduct.purchasePrice}
                onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Bechnay Ki Price (Retail Price PKR) *</label>
              <input
                type="number"
                placeholder="e.g. 300"
                value={newProduct.sellingPrice}
                onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Kitni Quantity (Pcs) *</label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={newProduct.stockQuantity}
                onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Kahan Se Laye (Supplier / Dukan)</label>
              <input
                type="text"
                placeholder="Doosri Dukan / Wholesale Shop"
                value={newProduct.supplier}
                onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
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
              Stock Save Karein
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
