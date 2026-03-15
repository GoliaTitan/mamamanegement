import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, Gift, Tag, ShoppingBag, CreditCard, Banknote, Smartphone } from 'lucide-react';

export default function Cart({ items, onUpdateQty, onRemove, onToggleOmaggio, manualDiscount, onSetDiscount, onCheckout, user, t }) {
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, card, satispay
  const canDiscount = ['developer', 'admin', 'manager', 'cashier'].includes(user.role);
  
  const subtotal = items.reduce((acc, item) => acc + (item.currentPrice * item.qty), 0);
  const totalGross = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  // Total logic: subtotal from current prices minus manual discount (capped at subtotal)
  const finalTotal = Math.max(0, subtotal - manualDiscount);
  const totalDiscounts = totalGross - finalTotal;

  return (
    <div className="w-[420px] h-full flex flex-col p-6 glass-panel rounded-none border-y-0 border-r-0 bg-white/5 backdrop-blur-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mamy-green/10 flex items-center justify-center text-mamy-green">
            <ShoppingCart size={20} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white/90">{t('cart')}</h2>
        </div>
        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
          {items.length} {items.length === 1 ? 'Articolo' : 'Articoli'}
        </span>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-white/10 gap-4">
            <ShoppingBag size={48} />
            <span className="text-xs font-black uppercase tracking-widest">{t('empty_cart')}</span>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`glass-card p-4 flex flex-col gap-4 border-white/5 group relative overflow-hidden ${item.isOmaggio ? 'bg-indigo-500/5 border-indigo-500/20' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 shrink-0 p-2">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black truncate text-white/90 uppercase tracking-tight">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {item.isOmaggio ? (
                      <span className="bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">{t('omaggio')}</span>
                    ) : (
                      <>
                        <span className="text-[10px] text-mamy-green font-black">{item.currentPrice}€</span>
                        {item.on_sale && <span className="text-[8px] text-white/20 line-through font-bold">{item.price}€</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1.5 border border-white/5">
                  <button 
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    <Minus size={14}/>
                  </button>
                  <span className="text-xs font-black w-6 text-center">{item.qty}</span>
                  <button 
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                  >
                    <Plus size={14}/>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex gap-2">
                  <button 
                    onClick={() => onToggleOmaggio(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${item.isOmaggio ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    <Gift size={12} />
                    {item.isOmaggio ? t('omaggio') : t('omaggio')}
                  </button>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Discount & Summary */}
      <div className="mt-6 space-y-4 bg-black/20 p-6 rounded-3xl border border-white/5">
        {canDiscount && items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-amber-400" />
                {t('manual_discount')}
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="number"
                  value={manualDiscount || ''}
                  onChange={(e) => onSetDiscount(parseFloat(e.target.value) || 0)}
                  placeholder={t('manual_discount')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400/40 text-right pr-8 font-black"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 font-black">€</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        {items.length > 0 && (
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              {t('payment_method')}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${paymentMethod === 'cash' ? 'bg-mamy-green border-mamy-green text-black' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
              >
                <Banknote size={18} />
                <span className="text-[9px] font-black uppercase">{t('cash')}</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${paymentMethod === 'card' ? 'bg-blue-400 border-blue-400 text-black' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
              >
                <CreditCard size={18} />
                <span className="text-[9px] font-black uppercase">{t('card')}</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
            <span>Prezzo Lordo:</span>
            <span>{totalGross.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase tracking-widest">
            <span>Sconti & Omaggi:</span>
            <span>-{totalDiscounts.toFixed(2)}€</span>
          </div>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Totale Netto</span>
              <span className="text-4xl font-black text-white tracking-tighter">{finalTotal.toFixed(2)}€</span>
            </div>
            <div className={`p-3 rounded-2xl transition-all ${
              paymentMethod === 'cash' ? 'bg-mamy-green/10 text-mamy-green' : 
              paymentMethod === 'card' ? 'bg-blue-400/10 text-blue-400' : 
              'bg-red-400/10 text-red-400'
            }`}>
              {paymentMethod === 'cash' ? <Banknote size={20} /> : 
               paymentMethod === 'card' ? <CreditCard size={20} /> : 
               <Smartphone size={20} />}
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <button 
          onClick={() => onCheckout(paymentMethod)}
          disabled={items.length === 0}
          className={`w-full mt-4 py-5 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] group shadow-lg disabled:opacity-20 disabled:grayscale ${
            paymentMethod === 'cash' ? 'bg-mamy-green text-black shadow-mamy-green/20' : 
            paymentMethod === 'card' ? 'bg-blue-400 text-black shadow-blue-400/20' : 
            'bg-red-400 text-black shadow-red-400/20'
          }`}
        >
          <div className="bg-black/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <ShoppingBag size={20} />
          </div>
          <span className="text-lg font-black tracking-widest uppercase italic">{t('pay_now')} ({paymentMethod === 'cash' ? t('cash') : t('card')})</span>
        </button>
      </div>
    </div>
  );
}
