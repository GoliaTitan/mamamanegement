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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-mamy-gold/10 flex items-center justify-center text-mamy-gold border border-mamy-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
              <Package size={20} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mamy-gradient-text italic leading-none">{t('inventory')}</h1>
          </div>
          <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[9px] ml-14 italic">Real-time Stock Management</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-20">
          {filtered.map(p => (
            <div key={p.id} className="glass-card p-5 md:p-6 flex flex-col sm:flex-row items-center gap-6 group hover:bg-white/5 hover:border-white/20 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-white/5 to-transparent rounded-bl-[4rem] pointer-events-none" />
              
              <div className="w-24 h-24 rounded-3xl bg-white/5 p-4 shrink-0 relative group-hover:scale-105 transition-transform duration-700 border border-white/5">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-contain filter drop-shadow-md" 
                  onError={(e) => { e.target.src = '/logo.png'; e.target.classList.add('opacity-50'); }}
                />
                {p.stock <= 5 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg animate-bounce">
                    <AlertTriangle size={14} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 opacity-80">
                  <span className="text-[8px] font-bold text-white uppercase tracking-[0.2em]">{p.category}</span>
                  <div className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-[8px] font-bold text-mamy-gold/80 uppercase tracking-widest">SKU-{(p.id % 1000).toString().padStart(3, '0')}</span>
                </div>
                
                <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight line-clamp-2 mb-4">{p.name}</h3>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-auto w-full">
                  <div className="flex flex-col items-center sm:items-start shrink-0">
                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mb-0.5">Stock</span>
                    <div className={`text-2xl font-black italic tracking-tighter ${p.stock <= 5 ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-mamy-green'}`}>
                      {p.stock || 0}
                      <span className="text-[10px] ml-1 opacity-50 uppercase font-bold not-italic">{p.unit || 'un'}</span>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-white/10 hidden sm:block shrink-0" />

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleUpdateStock(p.id, -1)}
                      className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white hover:border-red-500/30 transition-all active:scale-95"
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStock(p.id, 1)}
                      className="w-10 h-10 rounded-xl bg-mamy-green/10 border border-mamy-green/30 flex items-center justify-center text-mamy-green hover:bg-mamy-green/20 transition-all active:scale-95 shadow-md"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleUpdateStock(p.id, 10)}
                      className="px-3 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/50 hover:bg-white/10 hover:text-white hover:border-mamy-gold/30 transition-all active:scale-95"
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
