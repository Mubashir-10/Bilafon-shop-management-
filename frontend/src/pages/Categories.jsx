import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function Categories({ categoryItems, onAddCategory, onDeleteCategory }) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 h-fit">
        <h3 className="font-bold text-white text-base mb-4">Add New Category</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Category Name (e.g. Chargers, Covers)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAdd}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl font-semibold text-xs shadow transition"
          >
            + Category Add Karein
          </button>
        </div>
      </div>

      <div className="md:col-span-2 bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
        <h3 className="font-bold text-white text-base mb-4">Manage Active Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryItems.map((cat) => (
            <div key={cat.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">{cat.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{cat.status || 'Active'}</span>
                <button
                  onClick={() => onDeleteCategory(cat)}
                  className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 p-1 rounded transition"
                  title="Delete Category"
                  aria-label={`Delete category ${cat.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
