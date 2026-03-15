import React, { useState } from 'react';
import { Plus, Minus, Trash2, Gift, Tag, ShoppingBag, CreditCard, Banknote, Search } from 'lucide-react';

export default function Cart({ items, onUpdateQty, onRemove, onToggleOmaggio, manualDiscount, onSetDiscount, onCheckout, user, t, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, card, satispay
  const canDiscount = ['developer', 'admin', 'manager', 'cashier'].includes(user.role);
  
  const subtotal = items.reduce((acc, item) => acc + (item.currentPrice * item.qty), 0);
  const totalGross = items.reduce((acc, item) => {
    const maxPrice = Math.max(item.price || 0, item.currentPrice || 0);
    return acc + (maxPrice * item.qty);
  }, 0);
  
  // Total logic: subtotal from current prices minus manual discount (capped at subtotal)
  const finalTotal = Math.max(0, subtotal - (manualDiscount || 0));
  const totalDiscounts = Math.max(0, totalGross - finalTotal);

  return (
    <div className="w-full h-full flex flex-col p-6 glass-cart-panel relative overflow-hidden shrink-0">
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/40 active:scale-95 transition-all"
      >
        <Plus size={24} className="rotate-45" />
      </button>

      <div className="flex items-center justify-between mb-5 pr-12 lg:pr-0">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black uppercase tracking-widest text-white">CARRELLO</h2>
        </div>
        <button className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full border border-white/10 text-white/50 hover:text-white transition-colors">
          <ShoppingBag size={18} />
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input 
          type="text" 
          placeholder="Cerca..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all placeholder:text-white/30"
        />
      </div>

      {/* Cart Items - Premium List */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 no-scrollbar min-h-[150px]">
        {items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/5 gap-6">
            <div className="w-24 h-24 flex items-center justify-center bg-white/2 rounded-full border border-white/5">
              <ShoppingBag size={48} strokeWidth={1} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{t('empty_cart')}</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={`${item.id}-${item.isOmaggio}`} className={`bg-white/5 backdrop-blur-xl rounded-2xl p-3 flex items-center gap-4 border border-white/10 group relative transition-all duration-300 hover:bg-white/10 ${item.isOmaggio ? 'bg-indigo-500/5 border-indigo-500/20 shadow-lg' : ''}`}>
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 shrink-0 p-2 border border-white/5 relative">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-xs font-bold truncate text-white/90 leading-tight">{item.name}</h4>
                <div className="flex items-center text-[10px] mt-1">
                  <span className="text-white/40 mr-1">{item.qty}x</span>
                  {item.isOmaggio ? (
                    <span className="font-bold text-indigo-400">0.00€</span>
                  ) : (
                    <span className="font-bold text-white/80">{item.currentPrice}€</span>
                  )}
                </div>
              </div>

              {/* Horizontal Qty Controls - Ultra Compact */}
              <div className="flex items-center bg-white/5 rounded-full border border-white/10 p-0.5">
                <button 
                  onClick={() => onUpdateQty(item.id, item.isOmaggio, -1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-white">{item.qty}</span>
                <button 
                  onClick={() => onUpdateQty(item.id, item.isOmaggio, 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
                
                <button 
                  onClick={() => onRemove(item.id, item.isOmaggio)}
                  className="w-7 h-7 ml-1 flex items-center justify-center rounded-full text-white/20 hover:text-red-400 hover:bg-red-400/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Summary - Text only layout like Reference */}
      <div className="mt-6 shrink-0 space-y-2 pb-2 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-medium text-white/60">Subtotale:</span>
          <span className="text-xs font-bold text-white/90">{subtotal.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-medium text-white/60">Tax (22% st.)</span>
          <span className="text-xs font-bold text-white/90">{(finalTotal * 0.22).toFixed(2)}€</span>
        </div>
        
        <div className="flex justify-between items-center px-1 pt-2">
          <span className="text-base font-bold text-white uppercase tracking-widest">TOTAL:</span>
          <span className="text-lg font-black text-white">{finalTotal.toFixed(2)}€</span>
        </div>

        {/* Checkout Button - Glowing Action Paga e Chiudi */}
        <button 
          onClick={() => onCheckout('card')}
          disabled={items.length === 0}
          className="w-full mt-4 btn-glow-primary flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(16,185,129,0.3)] disabled:opacity-30 disabled:grayscale text-sm py-3 px-6"
        >
          <ShoppingBag size={16} />
          <span className="font-bold">PAGA E CHIUDI</span>
        </button>
      </div>
    </div>
  );
}
