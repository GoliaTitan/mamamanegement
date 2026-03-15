import React, { useState } from 'react';
import { Search, Plus, Info, Camera, Package } from 'lucide-react';
import Scanner from './Scanner';
import { usePOSData } from '../hooks/usePOSData';

const categories = ['FLOWERS', 'OILS', 'EDIBLES', 'VAPE KIT CBD', 'HEMP CARE', 'SEEDS'];

export default function POSView({ onAddToCart, t }) {
  const [activeCategory, setActiveCategory] = useState('FLOWERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const { products, bestSellers, loading, isOnline } = usePOSData();

  const filteredProducts = products.filter(p => {
    const matchesCategory = p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode?.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleScan = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      onAddToCart(product);
    } else {
      alert(`Prodotto non trovato: ${barcode}`);
    }
  };

  const handleAddToCart = (product) => {
    onAddToCart(product);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamy-green"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-10 gap-8">
      {/* Online/Offline Status Indicator */}
      {!isOnline && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-2xl text-center text-[10px] font-black tracking-[0.2em] animate-pulse">
          {t('sync_offline').toUpperCase()} • MODALITÀ STORE LOCAL
        </div>
      )}

      {showScanner && (
        <Scanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {/* Header with luxury search and categories */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 border-b border-white/10 pb-6 mb-2">
        <div className="relative w-full lg:w-96 group shrink-0">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[rgba(255,255,255,0.8)] transition-colors" />
          <input 
            type="text" 
            placeholder="Cerca o scansiona prodotto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input pl-12 pr-6 py-3 text-sm rounded-full"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto overflow-hidden">
          <button 
            onClick={() => setShowScanner(true)}
            className="shrink-0 w-11 h-11 flex items-center justify-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full text-white/60 hover:text-white hover:bg-[rgba(255,255,255,0.1)] active:scale-95 transition-all shadow-lg"
          >
            <Camera size={18} strokeWidth={2} />
          </button>
          
          {/* Categories Selector */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                  ? 'bg-[rgba(255,255,255,0.15)] text-white border border-[rgba(255,255,255,0.3)] shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                  : 'bg-transparent text-white/40 border border-transparent hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-2 pb-32 flex flex-col gap-10">
        
        {/* Best Sellers Section - Immersive scroll area */}
        {bestSellers.length > 0 && (
          <div className="flex flex-col gap-6 shrink-0">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-5 bg-mamy-green rounded-full shadow-[0_0_15px_rgba(57,211,83,0.5)]" />
                <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-white/50 italic">{t('best_sellers')} • Fast Selection</h2>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar -mx-2">
              {bestSellers.map(p => (
                <button 
                  key={`best-${p.id}`}
                  onClick={() => handleAddToCart(p)}
                  className="shrink-0 flex items-center gap-4 p-4 glass-product-card group active:scale-[0.98] w-64 md:w-72"
                >
                  <div className="w-14 h-14 rounded-xl bg-[rgba(255,255,255,0.05)] p-2 shrink-0 group-hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)]">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-contain drop-shadow-md" 
                      onError={(e) => { e.target.src = '/logo.png'; e.target.classList.add('opacity-50'); }}
                    />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[9px] font-black text-mamy-glow uppercase tracking-widest mb-0.5 italic">{p.category}</span>
                    <span className="text-sm font-bold text-white/90 leading-tight text-left line-clamp-2 w-full">{p.name}</span>
                    <span className="text-sm font-bold text-white/50 mt-1">{p.on_sale ? p.sale_price : p.price}€</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modern Cyberpunk Product Grid (Reference Match) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="relative group flex flex-col rounded-[24px] bg-slate-900/80 backdrop-blur-2xl border border-white/5 hover:border-mamy-green/30 transition-all duration-300 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-[380px]">
                 
                 <div className="relative w-full h-44 bg-linear-to-b from-white/5 to-transparent flex items-center justify-center p-4">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => { e.target.src = '/logo.png'; e.target.classList.add('opacity-50'); }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/10">
                        <Package size={50} strokeWidth={1} />
                      </div>
                    )}

                    {/* Neon Badges (Sconto / Regali) */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 w-full pr-6">
                        {product.on_sale && product.sale_price && (
                          <div className="w-fit px-2 py-0.5 bg-rose-500/20 border border-rose-500/50 rounded-md flex items-center gap-1 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                             <span className="text-[10px] font-black text-rose-300 tracking-wider uppercase">
                                -{Math.round((1 - (parseFloat(product.price) / parseFloat(product.sale_price))) * 100)}%
                             </span>
                          </div>
                        )}
                        {/* Simulating Gift Logic */}
                        {parseFloat(product.price) === 0 && (
                          <div className="w-fit px-2 py-0.5 bg-mamy-green/20 border border-mamy-green/50 rounded-md flex items-center gap-1 backdrop-blur-md shadow-[0_0_15px_rgba(var(--mamy-green),0.4)]">
                            <Gift size={10} className="text-mamy-green" />
                            <span className="text-[10px] font-black text-mamy-green tracking-wider uppercase">Omaggio</span>
                          </div>
                        )}
                    </div>
                 </div>
 
                 {/* Card Body - Structured Data Grid */}
                 <div className="flex flex-col flex-1 p-5 pt-3">
                   {/* Title area */}
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shadow-inner">
                         <img src="/logo_gold.png" className="w-4 h-4 opacity-70" alt="icon" />
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight truncate flex-1">{product.name}</h3>
                   </div>
                   
                   {/* Cyberpunk Status Line */}
                   <div className="flex items-center gap-2 mb-4">
                     <span className="w-1.5 h-1.5 rounded-full bg-mamy-green animate-pulse"></span>
                     <span className="text-[10px] text-white/50 tracking-widest uppercase font-semibold">Available</span>
                     <span className="ml-auto text-[10px] text-white/30 uppercase tracking-widest">{product.category}</span>
                   </div>

                   {/* Data Grid Section (Matched to Reference) */}
                   <div className="grid grid-cols-3 gap-y-3 gap-x-2 mt-auto pb-4 border-b border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase font-semibold tracking-wider">Regular</span>
                        <div className="flex items-baseline gap-1">
                           <span className={`text-xs font-black ${product.on_sale ? 'text-rose-400/80 line-through' : 'text-white/30'}`}>
                             {product.on_sale ? product.sale_price : product.price}€
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase font-semibold tracking-wider">Type</span>
                        <span className="text-xs font-bold text-white/80">{product.unit || 'PZ'}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase font-semibold tracking-wider">Ticker</span>
                        <span className="text-[10px] font-bold text-mamy-green leading-none bg-mamy-green/10 px-1.5 py-0.5 rounded inline-flex self-start mt-0.5">MMY</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase font-semibold tracking-wider">Price</span>
                        <span className="text-sm font-black text-mamy-gold drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]">{product.price}€</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase font-semibold tracking-wider">Stock</span>
                        <span className="text-xs font-medium text-white/50">{product.stock || '100+'}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] text-white/40 uppercase font-semibold tracking-wider">Vested</span>
                        <span className="text-xs font-medium text-white/50">-</span>
                      </div>
                   </div>

                   {/* Footer CTA */}
                   <button 
                     className="mt-4 w-full h-9 rounded-xl bg-white/5 hover:bg-mamy-green hover:text-black hover:shadow-[0_0_15px_rgba(var(--mamy-green),0.5)] text-white/70 text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                     onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                   >
                     Add to Cart <Plus size={14} />
                   </button>
                 </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-white/10 gap-6">
            <div className="w-24 h-24 flex items-center justify-center bg-white/5 rounded-full border border-white/5">
              <Search size={40} strokeWidth={1} />
            </div>
            <p className="font-black uppercase tracking-[0.3em] text-[10px] italic">{t('no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
