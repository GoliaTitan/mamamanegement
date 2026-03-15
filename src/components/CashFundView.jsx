import React, { useState } from 'react';
import { Wallet, ArrowRight, Coins } from 'lucide-react';

export default function CashFundView({ user, onComplete, t }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onComplete(parseFloat(amount));
      setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-100 bg-mamy-dark flex items-center justify-center p-6">
      <div className="blur-overlay w-[600px] h-[600px] bg-emerald-500 bottom-[-100px] right-[-200px] opacity-10" />
      
      <div className="w-full max-w-lg glass-panel p-12 flex flex-col items-center">
        <div className="w-20 h-20 bg-mamy-green/10 rounded-3xl flex items-center justify-center text-mamy-green mb-8 shadow-[0_0_30px_rgba(57,211,83,0.1)]">
          <Wallet size={40} />
        </div>

        <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter text-center">{t('reports')}</h1>
        <p className="text-white/40 font-medium mb-12 text-center max-w-xs">
          Ciao <span className="text-white">{user.name}</span>, indica l'importo iniziale presente in cassa oggi.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          <div className="relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-mamy-green/50">
              <Coins size={28} />
            </div>
            <input
              autoFocus
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-8 pl-20 pr-12 text-4xl font-black outline-none focus:border-mamy-green/40 focus:bg-white/10 transition-all placeholder:text-white/5 text-white"
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20">
              EUR
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount || loading}
            className={`w-full py-6 rounded-3xl flex items-center justify-center gap-4 text-xl font-black transition-all active:scale-95 ${
              amount 
              ? 'bg-mamy-green text-black shadow-[0_20px_40px_rgba(57,211,83,0.2)]' 
              : 'bg-white/5 text-white/10 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-black"></div>
            ) : (
              <>
                {t('start_session')}
                <ArrowRight size={24} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-[10px] text-white/20 uppercase font-black tracking-widest">
          Sessione: 12 ore • Sicurezza Attiva
        </p>
      </div>
    </div>
  );
}
