import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Package, Search, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function InventoryView({ t }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const all = await db.products.toArray();
    setProducts(all);
    setLoading(false);
  };

  const handleUpdateStock = async (id, delta) => {
    const product = await db.products.get(id);
    if (!product) return;
    
    const newStock = Math.max(0, (product.stock || 0) + delta);
    await db.products.update(id, { 
      stock: newStock,
      needsSync: true 
    });
    
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    
    setStatus(`Giacenza aggiornata per ${product.name}`);
    setTimeout(() => setStatus(''), 3000);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mamy-gradient-text italic">{t('inventory')}</h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Gestione giacenze e carichi</p>
        </div>

        {status && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 size={14} /> {status}
          </div>
        )}

        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder={t('search_product')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-mamy-green/40 focus:bg-white/10 transition-all font-bold text-xs uppercase tracking-tight"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div key={p.id} className="glass-panel p-6 flex items-center gap-6 group hover:border-white/20 transition-all">
              <div className="w-20 h-20 rounded-2xl bg-white/5 p-3 shrink-0 relative">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                {p.stock <= 5 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                    <AlertTriangle size={12} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-black text-white/90 uppercase tracking-tight truncate leading-tight">{p.name}</h3>
                <p className="text-[10px] font-bold text-white/20 uppercase mb-4">{p.category}</p>
                
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-black ${p.stock <= 5 ? 'text-red-500' : 'text-emerald-400'}`}>
                    {p.stock || 0}
                    <span className="text-[10px] ml-1 opacity-50 uppercase">{p.unit || 'un'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleUpdateStock(p.id, -1)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                    >
                      <Minus size={14} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStock(p.id, 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStock(p.id, 10)}
                      className="ml-2 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black text-white/30 hover:bg-white/10 hover:text-white transition-all"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
