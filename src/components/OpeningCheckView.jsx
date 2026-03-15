import React, { useState } from 'react';
import { 
  ClipboardCheck, Camera, CheckCircle2, AlertCircle, 
  ChevronRight, Send, Mail, User, Store, Calendar,
  ArrowRight
} from 'lucide-react';
import { db } from '../lib/db';

export default function OpeningCheckView({ user, store, onComplete, t }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    order: null,
    cleaning: null,
    stock: null,
    photos: {
      order: null,
      cleaning: null,
      stock: null
    },
    notes: ''
  });
  const [isSending, setIsSending] = useState(false);

  const checklistItems = [
    { 
      id: 'order', 
      title: 'Ordine Generale', 
      desc: 'Al tuo arrivo il negozio era in ordine?',
      photoLabel: 'Scatta una foto dell\'area vendita'
    },
    { 
      id: 'cleaning', 
      title: 'Pulizia', 
      desc: 'Il negozio è pulito (pavimenti, bancone, specchi)?',
      photoLabel: 'Scatta una foto dell\'ingresso/area principale'
    },
    { 
      id: 'stock', 
      title: 'Allestimento e Scorte', 
      desc: 'Gli scaffali sono pieni e le scorte sono sufficienti?',
      photoLabel: 'Scatta una foto dello scaffale principale'
    }
  ];

  const handlePhotoChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          photos: { ...prev.photos, [id]: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendReport = async () => {
    setIsSending(true);
    try {
      const emailConfig = await db.config.get('reportEmail');
      const targetEmail = emailConfig?.value || 'admin@mamamary.io';

      const report = {
        date: new Date().toISOString(),
        userId: user.email,
        userName: user.name,
        storeId: store.id,
        storeName: store.name,
        answers: {
          order: data.order,
          cleaning: data.cleaning,
          stock: data.stock
        },
        notes: data.notes,
        type: 'opening_check',
        status: 'pending'
      };

      console.log('Sending report to:', targetEmail, report);
      
      await db.daily_checks.add(report);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onComplete();
    } catch (err) {
      alert('Errore durante l\'invio del report: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const currentItem = checklistItems[step - 1];

  return (
    <div className="fixed inset-0 z-100 bg-mamy-dark/95 backdrop-blur-3xl flex items-center justify-center p-4">
      <div className="w-full max-w-xl animate-in zoom-in-95 duration-500">
        
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-mamy-green/10 rounded-3xl flex items-center justify-center text-mamy-green mx-auto mb-4 border border-mamy-green/20 shadow-lg shadow-mamy-green/5">
            <ClipboardCheck size={40} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white/90">{t('reports')}</h1>
          <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Protocollo di eccellenza MamaMary</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
            <User size={14} className="text-white/30" />
            <span className="text-[10px] font-black text-white/80 uppercase truncate w-full text-center">{user.name}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
            <Store size={14} className="text-white/30" />
            <span className="text-[10px] font-black text-white/80 uppercase truncate w-full text-center">{store.name}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
            <Calendar size={14} className="text-white/30" />
            <span className="text-[10px] font-black text-white/80 uppercase">{new Date().toLocaleDateString('it-IT')}</span>
          </div>
        </div>

        {step <= 3 ? (
          <div className="glass-panel p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
              <div 
                className="h-full bg-mamy-green transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-mamy-green uppercase tracking-widest">Passaggio {step} di 3</span>
              <h2 className="text-2xl font-black text-white/90 uppercase tracking-tight leading-none">{currentItem.title}</h2>
              <p className="text-sm text-white/40 font-medium">{currentItem.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setData(prev => ({...prev, [currentItem.id]: true}))}
                className={`flex items-center justify-center gap-3 py-6 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs ${
                  data[currentItem.id] === true
                  ? 'bg-mamy-green/20 border-mamy-green text-mamy-green shadow-lg shadow-mamy-green/10'
                  : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                }`}
              >
                <CheckCircle2 size={20} />
                Sì
              </button>
              <button 
                onClick={() => setData(prev => ({...prev, [currentItem.id]: false}))}
                className={`flex items-center justify-center gap-3 py-6 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs ${
                  data[currentItem.id] === false
                  ? 'bg-red-500/20 border-red-500 text-red-500 shadow-lg shadow-red-500/10'
                  : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                }`}
              >
                <AlertCircle size={20} />
                No
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <div className={`relative group flex items-center justify-center gap-4 py-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  data.photos[currentItem.id] 
                  ? 'bg-mamy-green/10 border-mamy-green/40' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={e => handlePhotoChange(currentItem.id, e)}
                  />
                  {data.photos[currentItem.id] ? (
                    <img 
                      src={data.photos[currentItem.id]} 
                      alt="Preview" 
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-40"
                    />
                  ) : (
                    <Camera size={32} className="text-white/20 group-hover:text-white/40 group-hover:scale-110 transition-transform" />
                  )}
                  <div className="relative z-10 text-center">
                    <p className={`text-xs font-black uppercase tracking-widest ${data.photos[currentItem.id] ? 'text-mamy-green' : 'text-white/40'}`}>
                      {data.photos[currentItem.id] ? 'Foto Scattata' : currentItem.photoLabel}
                    </p>
                    {data.photos[currentItem.id] && <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Clicca per cambiare</p>}
                  </div>
                </div>
              </label>
            </div>

            <button 
              disabled={data[currentItem.id] === null || !data.photos[currentItem.id]}
              onClick={() => setStep(prev => prev + 1)}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3"
            >
              Prosegui
              <ChevronRight size={20} />
            </button>
          </div>
        ) : (
          <div className="glass-panel p-8 space-y-8 animate-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white/90">Note Finali</h2>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Opzionale • Segnala criticità</p>
              </div>
            </div>

            <textarea 
              placeholder="Segnala qui se mancano prodotti critici o se il magazzino richiede un riordino urgente..."
              value={data.notes}
              onChange={e => setData(prev => ({...prev, notes: e.target.value}))}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm outline-none focus:border-white/20 min-h-[150px] resize-none text-white/80 font-medium leading-relaxed"
            />

            <div className="p-4 bg-mamy-green/5 border border-mamy-green/10 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-mamy-green/10 rounded-xl flex items-center justify-center text-mamy-green">
                <CheckCircle2 size={20} />
              </div>
              <p className="text-[10px] text-mamy-green/60 font-black uppercase tracking-widest leading-relaxed">
                Il report verrà inviato istantaneamente alla sede centrale.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(3)}
                className="px-8 py-5 bg-white/5 text-white/40 font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all text-xs"
              >
                Indietro
              </button>
              <button 
                disabled={isSending}
                onClick={handleSendReport}
                className="flex-1 py-5 bg-mamy-green text-black font-black uppercase tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-mamy-green/20"
              >
                {isSending ? (
                  <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    Invia Report Finale
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step <= 3 && (
          <div className="mt-8 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-mamy-green' : 'w-2 bg-white/20'
                }`} 
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
