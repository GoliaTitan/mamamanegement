import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Package, Search, Plus, Minus, AlertTriangle, CheckCircle2, X, Camera, Trash2, Barcode } from 'lucide-react';

export default function InventoryView({ t, user }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', barcode: '', price: '', category: 'FLOWERS',
    unit: '1g', description: '', image: '', stock: 100
  });

  const canManageProducts = user && ['developer', 'admin', 'manager', 'warehouse'].includes(user.role);

  async function loadProducts() {
    const all = await db.products.toArray();
    setProducts(all);
    setLoading(false);
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
    
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    
    setStatus(`Giacenza aggiornata per ${product.name}`);
    setTimeout(() => setStatus(''), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      setStatus('Nome e Prezzo sono obbligatori');
      setTimeout(() => setStatus(''), 3000);
      return;
    }

    try {
      // Generate next available ID
      const allProducts = await db.products.toArray();
      const maxId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) : 0;

      const productToAdd = {
        id: maxId + 1,
        name: newProduct.name,
        barcode: newProduct.barcode || '',
        price: parseFloat(newProduct.price) || 0,
        on_sale: false,
        sale_price: 0,
        is_best_seller: false,
        stock: parseInt(newProduct.stock) || 100,
        unit: newProduct.unit || 'un',
        image: newProduct.image || '',
        category: newProduct.category || 'FLOWERS',
        description: newProduct.description || '',
        type: 'Materia',
        needsSync: true
      };

      await db.products.add(productToAdd);
      
      setNewProduct({ name: '', barcode: '', price: '', category: 'FLOWERS', unit: '1g', description: '', image: '', stock: 100 });
      setShowAddForm(false);
      loadProducts();
      setStatus(`Prodotto "${productToAdd.name}" aggiunto con successo!`);
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Errore durante l\'aggiunta del prodotto');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Sei sicuro di voler eliminare "${name}"?`)) return;
    try {
      await db.products.delete(id);
      loadProducts();
      setStatus(`"${name}" rimosso dal catalogo`);
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus('Errore durante l\'eliminazione');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(search.toLowerCase())
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
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg ${
              status.includes('successo') || status.includes('aggiornata') || status.includes('aggiunto') || status.includes('rimosso')
              ? 'bg-mamy-green/10 border border-mamy-green/20 text-mamy-green shadow-mamy-green/5'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <CheckCircle2 size={16} className="animate-pulse" /> {status}
            </div>
          )}

          {canManageProducts && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-3 px-8 py-4 bg-mamy-green text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-mamy-green/20 shrink-0"
            >
              <Plus size={16} strokeWidth={3} /> Nuovo Prodotto
            </button>
          )}

          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-0 bg-mamy-gold/5 blur-xl group-focus-within:bg-mamy-gold/10 transition-all rounded-3xl" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-mamy-gold transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="SEARCH ASSET / BARCODE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/3 border border-white/10 rounded-[1.8rem] py-5 pl-16 pr-6 outline-none focus:border-mamy-gold/40 focus:bg-white/5 transition-all font-black text-sm uppercase tracking-tighter text-white relative z-10 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* ======================== ADD PRODUCT MODAL ======================== */}
      {showAddForm && (
        <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all">
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-mamy-green/10 flex items-center justify-center text-mamy-green border border-mamy-green/20">
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">Nuovo Prodotto</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Inserisci i dati del nuovo articolo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Nome Prodotto *</label>
                <input 
                  type="text" placeholder="Es: Amnesia Haze Premium"
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-mamy-green/40 focus:bg-white/8 transition-all font-bold text-white"
                />
              </div>

              {/* Barcode */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Barcode size={10} /> Barcode / EAN</label>
                <input 
                  type="text" placeholder="8001234567890"
                  value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-mamy-green/40 focus:bg-white/8 transition-all font-bold text-white tracking-widest"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Prezzo (€) *</label>
                <input 
                  type="number" step="0.01" placeholder="0.00"
                  value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-mamy-green/40 focus:bg-white/8 transition-all font-black text-mamy-gold text-lg"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Categoria</label>
                <select 
                  value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-mamy-green/40 transition-all font-bold text-white appearance-none cursor-pointer"
                >
                  {['FLOWERS', 'OILS', 'EDIBLES', 'VAPE KIT CBD', 'HEMP CARE', 'SEEDS'].map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Unità</label>
                <input 
                  type="text" placeholder="es: 1g, 10ml, 5 semi"
                  value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-mamy-green/40 focus:bg-white/8 transition-all font-bold text-white"
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Stock Iniziale</label>
                <input 
                  type="number" placeholder="100"
                  value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-mamy-green/40 focus:bg-white/8 transition-all font-black text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Descrizione</label>
                <textarea 
                  placeholder="Descrizione breve del prodotto..."
                  value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-mamy-green/40 focus:bg-white/8 transition-all font-medium text-white/80 min-h-[80px] resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Immagine Prodotto</label>
                <label className={`flex items-center justify-center gap-4 py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  newProduct.image ? 'bg-mamy-green/10 border-mamy-green/40' : 'bg-white/3 border-white/10 hover:border-white/20'
                }`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {newProduct.image ? (
                    <div className="flex items-center gap-4">
                      <img src={newProduct.image} alt="Preview" className="w-16 h-16 object-contain rounded-xl" />
                      <span className="text-[10px] font-black text-mamy-green uppercase tracking-widest">Foto Caricata — Clicca per cambiare</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-white/30">
                      <Camera size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Carica foto prodotto</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit */}
            <button 
              onClick={handleAddProduct}
              className="w-full mt-8 py-5 bg-mamy-green text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-mamy-green/20 flex items-center justify-center gap-3"
            >
              <Plus size={20} /> Aggiungi al Catalogo
            </button>
          </div>
        </div>
      )}

      {/* ======================== PRODUCT LIST ======================== */}
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
                  {p.barcode && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{p.barcode}</span>
                    </>
                  )}
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
                    {canManageProducts && (
                      <button 
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-95"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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

