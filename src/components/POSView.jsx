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
      <div className="flex flex-col gap-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative flex-1 flex items-center gap-4">
            <div className="relative flex-1 group">
              <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-mamy-green transition-colors" />
              <input 
                type="text" 
                placeholder={t('search_product')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-lg outline-none focus:border-mamy-green/40 focus:bg-white/[0.05] transition-all font-medium placeholder:text-white/10"
              />
            </div>
            <button 
              onClick={() => setShowScanner(true)}
              className="shrink-0 w-[68px] h-[68px] flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-[1.8rem] text-white/30 hover:text-white hover:bg-white/10 active:scale-95 transition-all shadow-2xl glass-panel"
            >
              <Camera size={26} />
            </button>
          </div>
          
          {/* Categories Selector - Refined for iPad */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic border transition-all duration-500 ${
                  activeCategory === cat
                  ? 'bg-mamy-green text-black border-mamy-green shadow-[0_10px_25px_rgba(57,211,83,0.3)]'
                  : 'bg-white/[0.03] text-white/40 border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Best Sellers Section - Enhanced Luxury */}
        {bestSellers.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-6 bg-mamy-green rounded-full shadow-[0_0_15px_rgba(57,211,83,0.5)]" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 italic">{t('best_sellers')} • Fast Selection</h2>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
              {bestSellers.map(p => (
                <button 
                  key={`best-${p.id}`}
                  onClick={() => handleAddToCart(p)}
                  className="shrink-0 flex items-center gap-5 p-5 glass-card group active:scale-[0.98] w-72"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] p-2 shrink-0 group-hover:bg-white/10 transition-colors border border-white/5">
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain drop-shadow-lg" />
                  </div>
                  <div className="flex flex-col items-start truncate overflow-hidden">
                    <span className="text-[10px] font-black text-mamy-green uppercase tracking-widest mb-1 italic">{p.category}</span>
                    <span className="text-base font-black text-white/90 truncate w-full text-left">{p.name}</span>
                    <span className="text-sm font-bold text-white/40">{p.on_sale ? p.sale_price : p.price}€</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Luxury Product Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-2 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="glass-card group flex flex-col">
              {/* Product Image Area - Refined background */}
              <div className="h-72 relative bg-gradient-to-br from-white/[0.05] to-transparent flex items-center justify-center p-8 rounded-t-[2rem] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]" />
                
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5">
                    <Package size={80} strokeWidth={1} />
                  </div>
                )}
                
                {product.on_sale && (
                  <div className="absolute top-6 left-6 px-4 py-2 bg-amber-400 text-black text-[9px] font-black uppercase tracking-[0.2em] italic rounded-xl shadow-2xl shadow-amber-400/20 animate-pulse">
                    Special Offer
                  </div>
                )}

                <button className="absolute top-6 right-6 p-3 bg-white/5 backdrop-blur-md rounded-2xl text-white/20 hover:text-mamy-green hover:bg-white/10 border border-white/10 transition-all">
                  <Info size={18} />
                </button>
              </div>

              {/* Product Details - Premium Typography */}
              <div className="p-8 pt-4 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-mamy-green text-[10px] font-black tracking-[0.3em] uppercase italic">{product.category || 'COLLECTION'}</span>
                  <div className="h-px flex-1 bg-white/10"></div>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 line-clamp-2 tracking-tight leading-tight">{product.name}</h3>
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">{product.type}</p>
                
                <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/10">
                  <div className="flex flex-col">
                    {product.on_sale ? (
                      <>
                        <span className="text-2xl font-black text-amber-400">{product.sale_price}€</span>
                        <span className="text-xs text-white/20 font-bold uppercase tracking-widest line-through decoration-white/40">{product.price}€</span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-white/90 tracking-tighter">{product.price}€</span>
                    )}
                    <span className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mt-1 italic">/ {product.unit}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-16 h-16 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-[1.5rem] text-mamy-green hover:bg-mamy-green hover:text-black hover:scale-105 transition-all duration-500 shadow-2xl active:scale-90"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
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
