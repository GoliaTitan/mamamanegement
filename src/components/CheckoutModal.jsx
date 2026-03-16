import React, { useState } from 'react';
import { CreditCard, Banknote, Gift, Tag, X, ChevronRight, Check } from 'lucide-react';

export default function CheckoutModal({ total, onComplete, onCancel }) {
  const [step, setStep] = useState(1); // 1: Sconto, 2: Regalo, 3: Pagamento
  
  // Step 1 State
  const [applyDiscount, setApplyDiscount] = useState(null); // null, true, false
  const [discountAmount, setDiscountAmount] = useState('');
  
  // Step 2 State
  const [addGift, setAddGift] = useState(null); // null, true, false
  const [giftDesc, setGiftDesc] = useState('');

  const finalDiscount = applyDiscount ? (parseFloat(discountAmount) || 0) : 0;
  const finalTotal = Math.max(0, total - finalDiscount);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const finalizeCheckout = (method) => {
    onComplete({
      discountAmount: finalDiscount,
      giftDesc: addGift && giftDesc ? giftDesc : null,
      paymentMethod: method
    });
  };

  return (
    <div className="fixed inset-0 z-250 bg-mamy-dark/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-panel p-8 relative flex flex-col items-center text-center">
        
        {/* Header Action */}
        <button 
          onClick={onCancel}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <X size={20} />
        </button>

        {/* Step 1: Sconto */}
        {step === 1 && (
          <div className="w-full space-y-8 animate-in slide-in-from-right duration-300">
            <div className="w-20 h-20 bg-mamy-gold/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(252,211,77,0.2)]">
              <Tag size={40} className="text-mamy-gold" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Applicare Sconto?</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Subtotale attuale: {total.toFixed(2)}€</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setApplyDiscount(true)}
                className={`flex-1 py-4 rounded-xl border border-white/10 font-black uppercase transition-all ${applyDiscount === true ? 'bg-mamy-gold text-black shadow-[0_0_15px_rgba(252,211,77,0.4)]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                SÌ
              </button>
              <button 
                onClick={() => {
                  setApplyDiscount(false);
                  setDiscountAmount('');
                  handleNext();
                }}
                className={`flex-1 py-4 rounded-xl border border-white/10 font-black uppercase transition-all ${applyDiscount === false ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                NO
              </button>
            </div>

            {applyDiscount && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom border-t border-white/10 pt-6">
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-mamy-gold">€</span>
                  <input 
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0.00"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-white outline-none focus:border-mamy-gold/50 focus:bg-white/10 transition-all text-center"
                  />
                </div>
                <button 
                  onClick={handleNext}
                  disabled={!discountAmount || parseFloat(discountAmount) <= 0}
                  className="w-full py-4 bg-mamy-gold text-black font-black uppercase rounded-2xl shadow-lg disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                >
                  Prosegui <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Regalo */}
        {step === 2 && (
          <div className="w-full space-y-8 animate-in slide-in-from-right duration-300">
             <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <Gift size={40} className="text-indigo-400" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Omaggio?</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Vuoi aggiungere un regalo in busta?</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setAddGift(true)}
                className={`flex-1 py-4 rounded-xl border border-white/10 font-black uppercase transition-all ${addGift === true ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                SÌ
              </button>
              <button 
                onClick={() => {
                  setAddGift(false);
                  setGiftDesc('');
                  handleNext();
                }}
                className={`flex-1 py-4 rounded-xl border border-white/10 font-black uppercase transition-all ${addGift === false ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
              >
                NO
              </button>
            </div>

            {addGift && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom border-t border-white/10 pt-6">
                <input 
                  type="text"
                  autoFocus
                  placeholder="Es. Cartine, Filtri, Accendino..."
                  value={giftDesc}
                  onChange={(e) => setGiftDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all text-center"
                />
                <button 
                  onClick={handleNext}
                  disabled={!giftDesc.trim()}
                  className="w-full py-4 bg-indigo-500 text-white font-black uppercase rounded-2xl shadow-lg disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2"
                >
                  Prosegui <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Pagamento */}
        {step === 3 && (
          <div className="w-full space-y-8 animate-in slide-in-from-right duration-300">
             <div className="w-20 h-20 bg-mamy-green/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(57,211,83,0.2)]">
              <CreditCard size={40} className="text-mamy-green" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Pagamento</h2>
              <div className="text-white/40 text-xs font-bold uppercase tracking-wider space-x-2">
                <span>Da pagare:</span>
                <span className="text-xl font-black text-mamy-green">{finalTotal.toFixed(2)}€</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
              <button 
                onClick={() => finalizeCheckout('cash')}
                className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-mamy-green/50 active:scale-95 transition-all flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest group"
              >
                <Banknote className="text-white/60 group-hover:text-mamy-green transition-colors" />
                Contanti
              </button>
              
              <button 
                onClick={() => finalizeCheckout('card')}
                className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-mamy-green/50 active:scale-95 transition-all flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest group"
              >
                <CreditCard className="text-white/60 group-hover:text-mamy-green transition-colors" />
                Carta / Bancomat
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
