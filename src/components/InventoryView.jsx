import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Package, Search, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function InventoryView({ t }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  async function loadProducts() {
    // setLoading(true);
    const all = await db.products.toArray();
    setProducts(all);
    // setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

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
    <div className="flex-1 flex flex-col p-10 md:p-14 overflow-hidden relative">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-8 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-mamy-gold/10 flex items-center justify-center text-mamy-gold border border-mamy-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              <Package size={24} />
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mamy-gradient-text italic leading-none">{t('inventory')}</h1>
          </div>
          <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] ml-16 italic">Real-time Stock Management</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          {status && (
            <div className="flex items-center gap-3 px-6 py-4 bg-mamy-green/10 border border-mamy-green/20 rounded-2xl text-mamy-green text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg shadow-mamy-green/5">
              <CheckCircle2 size={16} className="animate-pulse" /> {status}
            </div>
          )}

          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-0 bg-mamy-gold/5 blur-xl group-focus-within:bg-mamy-gold/10 transition-all rounded-3xl" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-mamy-gold transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="SEARCH ASSET ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/3 border border-white/10 rounded-[1.8rem] py-5 pl-16 pr-6 outline-none focus:border-mamy-gold/40 focus:bg-white/5 transition-all font-black text-sm uppercase tracking-tighter text-white relative z-10 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 no-scrollbar relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
          {filtered.map(p => (
            <div key={p.id} className="glass-card p-8 flex flex-col sm:flex-row items-center gap-8 group hover:bg-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-white/5 to-transparent rounded-bl-[4rem] pointer-events-none" />
              
              <div className="w-32 h-32 rounded-3xl bg-white/5 p-5 shrink-0 relative group-hover:scale-110 transition-transform duration-700 border border-white/5">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
                {p.stock <= 5 && (
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/40 animate-bounce">
                    <AlertTriangle size={18} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">{p.category}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="text-[9px] font-black text-mamy-gold/60 uppercase tracking-[0.2em] italic">SKU-{(p.id % 1000).toString().padStart(3, '0')}</span>
                </div>
                
                <h3 className="text-xl font-black text-white uppercase tracking-tight truncate leading-tight mb-6">{p.name}</h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Stock Level</span>
                    <div className={`text-4xl font-black italic tracking-tighter ${p.stock <= 5 ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-mamy-green'}`}>
                      {p.stock || 0}
                      <span className="text-xs ml-1 opacity-30 uppercase font-black not-italic">{p.unit || 'un'}</span>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-white/5 hidden sm:block" />

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdateStock(p.id, -1)}
                      className="w-12 h-12 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-red-500/30 transition-all active:scale-90"
                    >
                      <Minus size={20} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStock(p.id, 1)}
                      className="w-12 h-12 rounded-2xl bg-mamy-green/10 border border-mamy-green/30 flex items-center justify-center text-mamy-green hover:bg-mamy-green/20 transition-all active:scale-90 shadow-lg shadow-mamy-green/5"
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStock(p.id, 10)}
                      className="px-5 h-12 rounded-2xl bg-white/3 border border-white/10 flex items-center justify-center text-[11px] font-black text-white/30 hover:bg-white/10 hover:text-white hover:border-mamy-gold/30 transition-all active:scale-95 italic"
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
