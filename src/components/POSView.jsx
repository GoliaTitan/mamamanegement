import React, { useState } from 'react';
import { Search, Plus, Info, Camera, Package } from 'lucide-react';
import Scanner from './Scanner';
import { usePOSData } from '../hooks/usePOSData';

const categories = ['FLOWERS', 'OILS', 'EDIBLES'];

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
    <div className="flex-1 flex flex-col h-full overflow-hidden p-8 gap-8">
      {/* Online/Offline Status Indicator */}
      {!isOnline && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-center text-xs font-bold animate-pulse">
          {t('sync_offline').toUpperCase()} - MODALITÀ STORE LOCAL
        </div>
      )}

      {showScanner && (
        <Scanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}

      {/* Header with quick search and categories */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <div className="relative flex-1 max-w-xl flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                type="text" 
                placeholder={t('search_product')} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-base outline-none focus:border-mamy-green/30 focus:bg-white/10 transition-all font-medium"
              />
            </div>
            <button 
              onClick={() => setShowScanner(true)}
              className="shrink-0 w-[58px] h-[58px] flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg"
            >
              <Camera size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-1.5 bg-white/5 rounded-2xl border border-white/10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-xl text-sm font-black tracking-widest transition-all ${
                  activeCategory === cat 
                  ? 'bg-white/10 text-white border border-white/20' 
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-mamy-green rounded-full shadow-[0_0_10px_rgba(57,211,83,0.5)]" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">{t('best_sellers')} (Fast Add)</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar no-scrollbar-y">
              {bestSellers.map(p => (
                <button 
                  key={`best-${p.id}`}
                  onClick={() => handleAddToCart(p)}
                  className="shrink-0 flex items-center gap-4 p-4 glass-card bg-white/5 border-white/5 hover:border-mamy-green/30 transition-all w-64 group active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/5 p-1 shrink-0 group-hover:bg-mamy-green/10 transition-colors">
                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col items-start truncate overflow-hidden">
                    <span className="text-sm font-black text-white/90 truncate w-full text-left">{p.name}</span>
                    <span className="text-xs font-bold text-mamy-green">{p.on_sale ? p.sale_price : p.price}€</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="glass-card overflow-hidden group">
              {/* Product Image */}
              <div className="h-64 relative bg-[#f8faf8] flex items-center justify-center p-6 rounded-t-2xl">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/10">
                    <Package size={64} />
                  </div>
                )}
                
                {product.on_sale && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-400/20 animate-pulse">
                    Offerta
                  </div>
                )}

                <button className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  <Info size={16} />
                </button>
              </div>

              {/* Product Details */}
              <div className="p-6 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-mamy-green text-[10px] font-black tracking-[0.2em] uppercase">{product.category || 'MATERIA'}</span>
                  <div className="h-px flex-1 bg-white/5"></div>
                </div>
                
                <h3 className="text-xl font-black text-white/90 mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-wide mb-1">{product.type}</p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    {product.on_sale ? (
                      <>
                        <span className="text-2xl font-black text-amber-400">{product.sale_price}€</span>
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest line-through decoration-white/40">{product.price}€</span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-white">{product.price}€</span>
                    )}
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">/ {product.unit}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-12 h-12 flex items-center justify-center bg-mamy-green/10 border border-mamy-green/20 rounded-xl text-mamy-green hover:bg-mamy-green hover:text-black transition-all active:scale-90 shadow-[0_0_20px_rgba(57,211,83,0.1)]"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/20 gap-4">
            <Search size={48} />
            <p className="font-black uppercase tracking-widest text-sm">{t('no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
