import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Lock, LogOut, CheckCircle2, TrendingUp, Wallet, ShoppingCart, MessageSquare, Camera } from 'lucide-react';

export default function ClosingSessionView({ user, onLogout, t }) {
  const [salesData, setSalesData] = useState({ gross: 0, discount: 0, net: 0, count: 0 });
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState('review'); // review -> counting -> complete
  const [openingFund, setOpeningFund] = useState(0);

  useEffect(() => {
    loadEndOfDayReport();
    const savedFund = localStorage.getItem('mamy_cash_fund');
    if (savedFund) setOpeningFund(parseFloat(savedFund));
  }, []);

  const loadEndOfDayReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    const dailySales = await db.sales
      .where('timestamp')
      .aboveOrEqual(today)
      .toArray();

    const totals = dailySales.reduce((acc, s) => ({
      gross: acc.gross + (s.totalGross || 0),
      discount: acc.discount + (s.totalDiscount || 0),
      net: acc.net + (s.totalNet || 0),
      count: acc.count + 1
    }), { gross: 0, discount: 0, net: 0, count: 0 });

    setSalesData(totals);
  };

  const handleCapturePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalize = async () => {
    const today = new Date().toISOString().split('T')[0];
    const expectedCash = openingFund + salesData.net;
    const difference = (parseFloat(actualCash) || 0) - expectedCash;

    const closingData = {
      date: today,
      userId: user.email,
      storeId: user.store?.id || 'roma_centro',
      type: 'closing_report',
      openingFund,
      salesNet: salesData.net,
      totalExpected: expectedCash,
      actualCash: parseFloat(actualCash) || 0,
      difference,
      notes,
      photo,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    try {
      await db.daily_checks.add(closingData);
      setStatus('complete');
      setTimeout(() => onLogout(), 3000);
    } catch (err) {
      alert('Errore durante il salvataggio della chiusura');
    }
  };

  if (status === 'complete') {
    return (
      <div className="fixed inset-0 z-200 bg-mamy-dark flex items-center justify-center p-6">
        <div className="glass-panel p-12 text-center max-w-md animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-mamy-green/10 rounded-full flex items-center justify-center text-mamy-green mx-auto mb-8 shadow-[0_0_30px_rgba(57,211,83,0.2)]">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mamy-gradient-text mb-4 italic">{t('logout')}</h2>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-8">{t('sync_offline')}</p>
          <div className="text-white/20 text-[9px] font-black uppercase">Chiusura terminale in corso...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-200 bg-mamy-dark/95 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Statistics Section */}
        <div className="space-y-6">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black uppercase tracking-tighter mamy-gradient-text italic">{t('logout')}</h1>
            <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Riepilogo attività del {new Date().toLocaleDateString('it-IT')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6">
              <div className="text-white/20 mb-1"><TrendingUp size={16} /></div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Totale Vendite</div>
              <div className="text-2xl font-black text-white/90">{salesData.count} <span className="text-[10px] opacity-30 italic">Transazioni</span></div>
            </div>
            <div className="glass-panel p-6 border-mamy-green/10">
              <div className="text-mamy-green mb-1"><ShoppingCart size={16} /></div>
              <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Incasso Netto</div>
              <div className="text-2xl font-black text-emerald-400">{salesData.net.toFixed(2)}€</div>
            </div>
          </div>

          <div className="glass-panel p-8 bg-white/5">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Wallet size={14} className="text-mamy-green" /> Bilancio Cassa
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 font-bold uppercase">Fondo Cassa Iniziale</span>
                <span className="font-black text-white/80">{openingFund.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 font-bold uppercase">Incasso Totale</span>
                <span className="font-black text-emerald-400">+{salesData.net.toFixed(2)}€</span>
              </div>
              <div className="h-px bg-white/5 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white uppercase tracking-wider">Teorico in Cassa</span>
                <span className="text-xl font-black text-mamy-green">{(openingFund + salesData.net).toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Action Section */}
        <div className="glass-panel p-8 flex flex-col">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-8">Conteggio Finale</h3>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Contante Reale in Cassa</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-mamy-green">€</span>
                <input 
                  type="number" 
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 outline-none focus:border-mamy-green/40 focus:bg-white/10 transition-all font-black text-3xl text-white/90"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Note / Discrepanze</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Inserisci eventuali note sulla chiusura..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 h-32 outline-none focus:border-mamy-green/40 focus:bg-white/10 transition-all font-medium text-sm text-white/70 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Foto Chiusura (Opzionale)</label>
              <label className="flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-mamy-green/40 hover:bg-white/5 cursor-pointer transition-all group">
                {photo ? (
                  <div className="flex items-center gap-3">
                    <img src={photo} alt="Chiusura" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-xs font-black text-mamy-green uppercase">Foto Caricata</span>
                  </div>
                ) : (
                  <>
                    <Camera size={20} className="text-white/20 group-hover:text-mamy-green" />
                    <span className="text-xs font-black text-white/40 uppercase group-hover:text-white">Allega scatto cassa</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapturePhoto} />
              </label>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => onLogout(false)} // Just exit without closing? No, let's keep it safe.
              className="flex-1 py-4 rounded-2xl border border-white/10 font-black text-xs uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all"
            >
              Annulla
            </button>
            <button 
              onClick={handleFinalize}
              disabled={!actualCash}
              className={`flex-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                actualCash ? 'bg-mamy-green text-black hover:scale-[1.02]' : 'bg-white/5 text-white/10 cursor-not-allowed'
              }`}
            >
              {t('logout')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
