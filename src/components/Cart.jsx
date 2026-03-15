import React, { useState } from 'react';
import { Plus, Minus, Trash2, Gift, Tag, ShoppingBag, CreditCard, Banknote } from 'lucide-react';

export default function Cart({ items, onUpdateQty, onRemove, onToggleOmaggio, manualDiscount, onSetDiscount, onCheckout, user, t, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, card, satispay
  const canDiscount = ['developer', 'admin', 'manager', 'cashier'].includes(user.role);
  
  const subtotal = items.reduce((acc, item) => acc + (item.currentPrice * item.qty), 0);
  const totalGross = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  // Total logic: subtotal from current prices minus manual discount (capped at subtotal)
  const finalTotal = Math.max(0, subtotal - manualDiscount);
  const totalDiscounts = totalGross - finalTotal;

  return (
    <div className="w-full lg:w-[450px] h-full flex flex-col p-8 bg-white/1 backdrop-blur-[60px] border-l border-white/10 relative">
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/40 active:scale-95 transition-all"
      >
        <Plus size={24} className="rotate-45" />
      </button>

      <div className="flex items-center justify-between mb-12 pr-12 lg:pr-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-mamy-green/10 flex items-center justify-center text-mamy-green border border-mamy-green/20 shadow-[0_0_15px_rgba(57,211,83,0.1)]">
            <ShoppingBag size={22} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white/90">{t('cart')}</h2>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">Order Selection</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-black text-white/90 italic">{items.length}</span>
          <span className="text-[8px] font-black uppercase tracking-widest text-mamy-green">Items</span>
        </div>
      </div>

      {/* Cart Items - Premium List */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-2 no-scrollbar">
        {items.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/5 gap-6">
            <div className="w-24 h-24 flex items-center justify-center bg-white/2 rounded-full border border-white/5">
              <ShoppingBag size={48} strokeWidth={1} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{t('empty_cart')}</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={`${item.id}-${item.isOmaggio}`} className={`glass-card p-5 flex flex-col gap-5 border-white/10 group relative transition-all duration-500 hover:bg-white/5 ${item.isOmaggio ? 'bg-indigo-500/5 border-indigo-500/20 shadow-[0_10px_30px_rgba(99,102,241,0.1)]' : ''}`}>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white/5 shrink-0 p-3 border border-white/5 relative group-hover:scale-105 transition-transform">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                  {item.isOmaggio && (
                    <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center rounded-3xl">
                      <Gift size={20} className="text-indigo-400 animate-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 italic">{item.category || 'PRODUCT'}</span>
                    {item.isOmaggio && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-400/20">Omaggio</span>
                    )}
                  </div>
                  <h4 className="text-lg font-black truncate text-white uppercase tracking-tight leading-tight">{item.name}</h4>
                  
                  <div className="flex items-center gap-3 mt-3">
                    {item.isOmaggio ? (
                      <span className="text-xl font-black text-indigo-400 italic">0.00€</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-mamy-green italic">{item.currentPrice}€</span>
                        {item.on_sale && <span className="text-xs text-white/10 line-through font-bold">{item.price}€</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Qty Controls - iPad First */}
                <div className="flex flex-col items-center bg-white/3 rounded-2xl p-1 border border-white/5">
                  <button 
                    onClick={() => onUpdateQty(item.id, item.isOmaggio, 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all active:scale-90"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                  <span className="text-base font-black py-1 text-white italic">{item.qty}</span>
                  <button 
                    onClick={() => onUpdateQty(item.id, item.isOmaggio, -1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-white/30 hover:text-white transition-all active:scale-90"
                  >
                    <Minus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-1">
                <button 
                  onClick={() => onToggleOmaggio(item.id, item.isOmaggio)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] italic transition-all duration-500 border ${
                    item.isOmaggio 
                    ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg' 
                    : 'bg-white/3 text-white/20 border-white/5 hover:text-white hover:bg-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  <Gift size={12} className={item.isOmaggio ? 'animate-bounce' : ''} />
                  Set Omaggio
                </button>
                <button 
                  onClick={() => onRemove(item.id, item.isOmaggio)}
                  className="w-11 h-11 flex items-center justify-center text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Summary - Premium Glass Block */}
      <div className="mt-8 space-y-6 bg-white/2 p-8 rounded-[2.5rem] border border-white/10 shadow-3xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
        
        {canDiscount && items.length > 0 && (
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic flex items-center gap-2">
                <Tag size={12} className="text-mamy-gold" />
                Special Discount
              </span>
            </div>
            <div className="relative group">
              <input 
                type="number"
                value={manualDiscount || ''}
                onChange={(e) => onSetDiscount(parseFloat(e.target.value) || 0)}
                placeholder="PROMO AMOUNT"
                className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-xl outline-none focus:border-mamy-gold/40 focus:bg-white/5 text-right pr-12 font-black tracking-tighter transition-all"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm text-mamy-gold font-black italic">€</span>
            </div>
          </div>
        )}

        {/* Payment Methods - Redefined UI */}
        {items.length > 0 && (
          <div className="flex gap-3 relative z-10">
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-2xl border transition-all duration-500 ${
                paymentMethod === 'cash' 
                ? 'bg-mamy-green text-black border-mamy-green shadow-[0_10px_25px_rgba(57,211,83,0.3)]' 
                : 'bg-white/3 border-white/10 text-white/30 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Banknote size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest italic">{t('cash')}</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 flex flex-col items-center gap-3 py-5 rounded-2xl border transition-all duration-500 ${
                paymentMethod === 'card' 
                ? 'bg-blue-400 text-black border-blue-400 shadow-[0_10px_25px_rgba(96,165,250,0.3)]' 
                : 'bg-white/3 border-white/10 text-white/30 hover:bg-white/10 hover:text-white'
              }`}
            >
              <CreditCard size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest italic">{t('card')}</span>
            </button>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t border-white/5 relative z-10">
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">Subtotal Gross</span>
            <span className="text-sm font-bold text-white/50">{totalGross.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] font-black text-red-500/60 uppercase tracking-[0.2em] italic">Credits & Promo</span>
            <span className="text-sm font-bold text-red-500/60">-{totalDiscounts.toFixed(2)}€</span>
          </div>
          
          <div className="mt-6 flex justify-between items-end px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 italic">Total to Pay</span>
              <span className="text-5xl font-black text-white tracking-tighter italic">{finalTotal.toFixed(2)}€</span>
            </div>
            
            <div className={`w-16 h-16 flex items-center justify-center rounded-[1.8rem] transition-all duration-700 shadow-2xl ${
              paymentMethod === 'cash' ? 'bg-mamy-green/10 text-mamy-green border border-mamy-green/20' : 
              'bg-blue-400/10 text-blue-400 border border-blue-400/20'
            }`}>
              {paymentMethod === 'cash' ? <Banknote size={28} /> : <CreditCard size={28} />}
            </div>
          </div>
        </div>

        {/* Checkout Button - Super Premium */}
        <button 
          onClick={() => onCheckout(paymentMethod)}
          disabled={items.length === 0}
          className={`w-full relative overflow-hidden group py-7 rounded-4xl flex items-center justify-center gap-4 transition-all duration-500 active:scale-95 disabled:opacity-30 disabled:grayscale ${
            paymentMethod === 'cash' ? 'bg-mamy-green shadow-[0_20px_60px_rgba(57,211,83,0.3)]' : 'bg-blue-400 shadow-[0_20px_60px_rgba(96,165,250,0.3)]'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <div className="bg-black/10 p-3 rounded-2xl group-hover:scale-110 transition-transform relative z-10">
            <ShoppingBag size={24} className="text-black" />
          </div>
          <span className="text-xl font-black tracking-widest uppercase italic text-black relative z-10">
            {t('pay_now')} • {paymentMethod.toUpperCase()}
          </span>
        </button>
      </div>
    </div>
  );
}
