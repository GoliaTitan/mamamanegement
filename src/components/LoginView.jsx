import React, { useState, useEffect } from 'react';
import { Delete, ChevronRight, Store, Mail, ArrowLeft } from 'lucide-react';
import { db } from '../lib/db';

export default function LoginView({ onLogin }) {
  const [step, setStep] = useState(1); // 1: Store, 2: Email, 3: PIN
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStores = async () => {
      const allStores = await db.stores.toArray();
      setStores(allStores);
    };
    loadStores();
  }, []);

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      if (error) setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleNextStep = async () => {
    if (step === 1 && selectedStore) {
      setStep(2);
    } else if (step === 2 && email) {
      // Check if user exists in DB
      const user = await db.users.get(email.toLowerCase());
      if (user) {
        setStep(3);
      } else {
        setError('Email non riconosciuta nel sistema');
      }
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    setError('');
    if (step === 3) setPin('');
  };

  const handleSubmitPIN = async () => {
    const user = await db.users.get(email.toLowerCase());
    if (user && user.pin === pin) {
      onLogin({ ...user, storeId: selectedStore.id });
    } else {
      setError('PIN errato. Riprova.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-mamy-dark flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="blur-overlay w-[600px] h-[600px] bg-mamy-green top-[-200px] left-[-200px] opacity-10" />
      
      <div className="w-full max-w-sm flex flex-col items-center py-8">
        {/* Logo scaled down for better visibility */}
        <div className="w-32 h-32 mb-6">
          <img src="/logo_gold.png" alt="MamaMary Logo" className="w-full h-full object-contain brightness-110 drop-shadow-[0_0_20px_rgba(218,165,32,0.3)]" />
        </div>

        <div className="w-full glass-panel p-6 sm:p-8 flex flex-col items-center">
          {step > 1 && (
            <button 
              onClick={handlePrevStep}
              className="self-start mb-4 text-white/40 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Indietro
            </button>
          )}

          <h1 className="text-xl font-black mb-1 uppercase tracking-tighter mamy-gradient-text text-center">
            {step === 1 ? 'Seleziona Sede' : step === 2 ? 'Sviluppatore' : 'Accesso Root'}
          </h1>
          <p className="text-white/30 text-[9px] font-bold mb-6 uppercase tracking-widest text-center">
            {step === 1 ? 'Inizializzazione terminale' : step === 2 ? 'Inserisci mail sviluppatore' : 'Digita il PIN di sicurezza'}
          </p>

          {/* Step 1: Store Selection */}
          {step === 1 && (
            <div className="w-full space-y-3">
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedStore?.id === store.id 
                    ? 'bg-mamy-green/10 border-mamy-green text-white shadow-[0_0_20px_rgba(57,211,83,0.1)]' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Store size={20} className={selectedStore?.id === store.id ? 'text-mamy-green' : ''} />
                    <div>
                      <div className="font-black text-xs uppercase tracking-tight">{store.name}</div>
                      <div className="text-[9px] font-bold opacity-30 uppercase">{store.address}</div>
                    </div>
                  </div>
                </button>
              ))}
              <button 
                onClick={handleNextStep}
                disabled={!selectedStore}
                className={`w-full mt-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  selectedStore ? 'bg-mamy-green text-black shadow-lg' : 'bg-white/5 text-white/10 cursor-not-allowed'
                }`}
              >
                Continua
              </button>
            </div>
          )}

          {/* Step 2: Email Entry */}
          {step === 2 && (
            <div className="w-full space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dev@mamamary.io"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-mamy-green/40 focus:bg-white/10 transition-all font-bold text-sm"
                />
              </div>
              <button 
                onClick={handleNextStep}
                disabled={!email}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  email ? 'bg-mamy-green text-black shadow-lg' : 'bg-white/5 text-white/10 cursor-not-allowed'
                }`}
              >
                Verifica Dev
              </button>
            </div>
          )}

          {/* Step 3: PIN Keypad */}
          {step === 3 && (
            <div className="w-full flex flex-col items-center">
              <div className="flex gap-3 mb-6">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                      pin.length > i 
                      ? 'bg-mamy-green border-mamy-green shadow-[0_0_10px_rgba(57,211,83,0.5)] scale-110' 
                      : error ? 'border-red-500 bg-red-500/20' : 'border-white/20'
                    }`} 
                  />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleKeyPress(num.toString())}
                    className="aspect-square flex items-center justify-center text-lg font-black bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-90 transition-all text-white/90"
                  >
                    {num}
                  </button>
                ))}
                <button onClick={handleDelete} className="aspect-square flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all"><Delete size={20} /></button>
                <button onClick={() => handleKeyPress('0')} className="aspect-square flex items-center justify-center text-lg font-black bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-white/90">0</button>
                <button 
                  onClick={handleSubmitPIN}
                  disabled={pin.length < 6}
                  className={`aspect-square flex items-center justify-center rounded-xl transition-all ${
                    pin.length === 6 ? 'bg-mamy-green text-black' : 'bg-white/5 text-white/10 border border-white/5'
                  }`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-red-500 font-bold text-[9px] tracking-widest uppercase bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-center w-full">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
