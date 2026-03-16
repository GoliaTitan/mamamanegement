import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import POSView from './components/POSView';
import Cart from './components/Cart';
import LoginView from './components/LoginView';
import CashFundView from './components/CashFundView';
import OpeningCheckView from './components/OpeningCheckView';
import DirectoryView from './components/DirectoryView';
import InventoryView from './components/InventoryView';
import ClosingSessionView from './components/ClosingSessionView';
import DashboardView from './components/DashboardView';
import DeveloperSettings from './components/DeveloperSettings';
import { Bell, User, MapPin, BookUser, Cloud, CloudOff, RefreshCw, ShoppingBag, ShoppingCart, Search } from 'lucide-react';
import { initLocalDB, db } from './lib/db';
import { useSync } from './hooks/useSync';
import { translations } from './lib/translations';

export default function App() {
  const { isOnline, syncStatus, performFullSync } = useSync();
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [currentStore, setCurrentStore] = useState(null);
  
  const currentLang = user?.language || 'it';
  const t = (key) => translations[currentLang][key] || key;
  const [cashFund, setCashFund] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [time, setTime] = useState(new Date());
  const [showOpeningCheck, setShowOpeningCheck] = useState(false);
  const [showClosingSession, setShowClosingSession] = useState(false);
  const [cart, setCart] = useState([]);
  const [manualDiscount, setManualDiscount] = useState(0);

  // Cart functions (simplified for integration)
  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id && !item.isOmaggio);
      if (exists) {
        return prev.map(item => item.id === product.id && !item.isOmaggio ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1, currentPrice: product.on_sale ? product.sale_price : product.price, isOmaggio: false }];
    });
  };

  const updateCartQty = (id, isOmaggio, delta) => {
    setCart(prev => prev.map(item => 
      item.id === id && item.isOmaggio === isOmaggio 
      ? { ...item, qty: Math.max(0, item.qty + delta) } 
      : item
    ).filter(item => item.qty > 0));
  };

  const removeFromCart = (id, isOmaggio) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.isOmaggio === isOmaggio)));
  };

  const toggleOmaggio = (id, currentIsOmaggio) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id && i.isOmaggio === currentIsOmaggio);
      if (!item) return prev;
      
      const otherTypeExists = prev.find(i => i.id === id && i.isOmaggio === !currentIsOmaggio);
      if (otherTypeExists) {
        return prev.map(i => {
          if (i.id === id && i.isOmaggio === !currentIsOmaggio) return { ...i, qty: i.qty + item.qty };
          return i;
        }).filter(i => !(i.id === id && i.isOmaggio === currentIsOmaggio));
      }

      return prev.map(i => i.id === id && i.isOmaggio === currentIsOmaggio 
        ? { ...i, isOmaggio: !currentIsOmaggio, currentPrice: !currentIsOmaggio ? 0 : (i.on_sale ? i.sale_price : i.price) } 
        : i
      );
    });
  };

  async function resolveStore() {
    if (user?.storeId) {
      const store = await db.stores.get(user.storeId);
      setCurrentStore(store || { id: user.storeId, name: 'Sede Sconosciuta' });
    } else if (user?.store) {
      setCurrentStore(user.store);
    }
  }

  async function checkDailyOpeningStatus(userData) {
    if (userData.role !== 'cashier' && userData.role !== 'manager') return;
    
    const today = new Date().toISOString().split('T')[0];
    const storeId = userData.storeId || userData.store?.id || 'roma_centro';
    
    const existingCheck = await db.daily_checks.where({
      date: today,
      userId: userData.email,
      storeId: storeId,
      type: 'opening_check'
    }).first();

    if (!existingCheck) {
      setShowOpeningCheck(true);
    }
  }

  useEffect(() => {
    const initialize = async () => {
      await initLocalDB([]); 
      const savedUser = localStorage.getItem('mamy_session');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        checkDailyOpeningStatus(parsedUser);
      }
      setInitializing(false);

      // Request camera permission for barcode scanning
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          // Stop all tracks immediately — we only needed to trigger the permission prompt
          stream.getTracks().forEach(track => track.stop());
          console.log('Camera permission granted for barcode scanning');
        }
      } catch (err) {
        console.warn('Camera permission not granted:', err.message);
      }
    };
    
    initialize();
    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedFund = localStorage.getItem('mamy_cash_fund');
    if (savedFund) setCashFund(parseFloat(savedFund));

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    resolveStore();
  }, [user?.storeId, user?.store]);


  async function handleCheckout(paymentMethod = 'cash') {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((acc, item) => acc + (item.currentPrice * item.qty), 0);
    const totalGross = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const finalTotal = Math.max(0, subtotal - manualDiscount);
    const totalDiscount = totalGross - finalTotal;

    const saleData = {
      items: cart,
      totalGross,
      totalDiscount,
      totalNet: finalTotal,
      paymentMethod,
      storeId: user.storeId || user.store?.id || 'roma_centro',
      userId: user.email,
      timestamp: new Date().toISOString()
    };

    try {
      await db.sales.add({ ...saleData, status: 'pending' });
      
      // Update inventory (decrement stock)
      for (const item of cart) {
        const product = await db.products.get(item.id);
        if (product) {
          await db.products.update(item.id, { 
            stock: Math.max(0, (product.stock || 0) - item.qty),
            needsSync: true
          });
        }
      }

      // Clear cart
      setCart([]);
      setManualDiscount(0);
      alert('Vendita completata con successo!');
    } catch (err) {
      console.error(err);
      alert('Errore durante il salvataggio della vendita');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('mamy_session', JSON.stringify(userData));
    checkDailyOpeningStatus(userData);
  };

  const handleLogout = (forceClose = true) => {
    if (forceClose) {
      setUser(null);
      setCashFund(null);
      setShowOpeningCheck(false);
      setShowClosingSession(false);
      localStorage.removeItem('mamy_session');
      localStorage.removeItem('mamy_cash_fund');
    } else {
      setShowClosingSession(false);
    }
  };

  const handleCashFundSet = (amount) => {
    setCashFund(amount);
    localStorage.setItem('mamy_cash_fund', amount.toString());
  };

  const handleUpdateSessionUser = (updates) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('mamy_session', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  // Auth Guard
  if (initializing) {
    return (
      <div className="fixed inset-0 bg-mamy-dark flex flex-col items-center justify-center">
        <div className="w-24 h-24 mb-6">
          <img src="/logo_gold.png" alt="Logo" className="w-full h-full object-contain animate-pulse" />
        </div>
        <div className="flex items-center gap-3 text-mamy-green/60 uppercase font-black text-[10px] tracking-[0.3em]">
          <RefreshCw size={16} className="animate-spin" />
          Inizializzazione Sistema...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Opening Check Guard
  if (showOpeningCheck && (user.role === 'manager' || user.role === 'cashier')) {
    return (
      <OpeningCheckView 
        user={user} 
        store={currentStore || { id: 'roma_centro', name: 'Roma Centro' }} 
        onComplete={() => setShowOpeningCheck(false)} 
        t={t}
      />
    );
  }

  // Cash Fund Guard (for Manager and Cashier)
  if ((user.role === 'manager' || user.role === 'cashier') && cashFund === null) {
    return <CashFundView user={user} onComplete={handleCashFundSet} t={t} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardView user={user} t={t} />;
      case 'pos':
        return (
          <div className="flex-1 flex overflow-hidden lg:pl-4 lg:pr-8 gap-6 h-full pb-4 items-stretch">
            <POSView onAddToCart={(p) => {
              addToCart(p);
              if (window.innerWidth < 1024) setShowCart(true);
            }} t={t} />
            <div className={`fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-auto transition-transform duration-500 ${showCart ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 w-full lg:w-[320px] xl:w-[380px] shrink-0 h-full`}>
               {/* Mobile Cart Overlay */}
               {showCart && (
                 <div 
                   className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10 lg:hidden"
                   onClick={() => setShowCart(false)}
                 />
               )}
               <Cart 
                 items={cart} 
                 onUpdateQty={updateCartQty} 
                 onRemove={removeFromCart}
                 onToggleOmaggio={toggleOmaggio}
                 manualDiscount={manualDiscount}
                 onSetDiscount={setManualDiscount}
                 onCheckout={handleCheckout}
                 user={user}
                 t={t}
                 onClose={() => setShowCart(false)}
               />
            </div>
          </div>
        );
      case 'inventory':
        return <InventoryView t={t} user={user} />;
      case 'directory':
        return <DirectoryView t={t} />;
      case 'settings':
        if (user.role === 'developer' || user.role === 'admin' || user.role === 'manager' || user.role === 'warehouse') {
          return <DeveloperSettings user={user} onUpdateUser={handleUpdateSessionUser} onLogout={handleLogout} onSync={performFullSync} syncStatus={syncStatus} t={t} />;
        }
        setActivePage('dashboard');
        return <DashboardView user={user} t={t} />;
      default:
        console.warn('Unknown page, defaulting to Dashboard');
        return <DashboardView user={user} t={t} />;
    }
  };

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  console.log('Rendering App with user:', user?.name, 'page:', activePage);

  return (
    <div className="flex h-screen overflow-hidden text-white relative bg-transparent p-2 md:p-4 gap-2 md:gap-4">

      {/* Main Layout */}
      <Sidebar 
        activePage={activePage} 
        onNavigate={(page) => {
          setActivePage(page);
          setShowMobileMenu(false);
        }} 
        onLogout={handleLogout} 
        onRequestClose={() => setShowClosingSession(true)}
        user={user} 
        t={t}
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 transition-all duration-300">
        {/* Modern Floating Top Bar */}
        <header className="flex items-center justify-between shrink-0 mb-4 px-2">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-white bg-white/5 rounded-full backdrop-blur-md border border-white/10"
            >
              <div className="w-5 h-0.5 bg-current mb-1 rounded-full" />
              <div className="w-5 h-0.5 bg-current mb-1 rounded-full" />
              <div className="w-4 h-0.5 bg-current rounded-full" />
            </button>
            
            <div className="hidden lg:flex items-center gap-3">
               <img src="/logo_gold.png" alt="MamaMary Logo" className="w-8 h-8 object-contain drop-shadow-lg" />
               <span className="text-xl font-bold tracking-wide text-white">MamaMary <span className="font-normal text-white/60">Gestionale</span></span>
            </div>
            
            {/* Contextual Title for mobile */}
            {activePage === 'pos' && (
              <span className="lg:hidden text-lg font-semibold tracking-tight text-white">Vendita</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activePage === 'pos' && (
              <button 
                onClick={() => setShowCart(true)}
                className="lg:hidden relative p-3 text-white bg-white/5 rounded-full border border-white/10 backdrop-blur-md"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-mamy-glow text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
            
            {/* Floating Status & User Pill */}
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 backdrop-blur-2xl rounded-full px-4 py-2 shadow-lg divide-x divide-white/10">
              
              {/* Store Name */}
              <div className="flex items-center gap-2 text-sm font-medium text-white/80 pr-4">
                <MapPin size={14} className="text-white/40" />
                {user?.store?.name || 'Roma Centro'}
              </div>
              
              {/* Time */}
              <div className="text-sm font-medium text-white/80 px-4">
                {formatTime(time)}
              </div>

              {/* Sync Status */}
              <div className="px-4 flex items-center">
                {syncStatus === 'syncing' ? <RefreshCw size={14} className="animate-spin text-blue-300" strokeWidth={1.5} /> :
                 syncStatus === 'error' ? <CloudOff size={14} className="text-red-300" strokeWidth={1.5} /> :
                 !isOnline ? <CloudOff size={14} className="text-amber-300" strokeWidth={1.5} /> :
                 <Cloud size={14} className="text-white/50" strokeWidth={1.5} />}
              </div>

              {/* User Profile */}
              <button 
                onClick={() => setActivePage('settings')}
                className="flex items-center gap-2 hover:bg-white/10 transition-colors pl-4 rounded-r-full"
              >
                <div className="w-6 h-6 rounded-full bg-mamy-forest border border-white/20 flex items-center justify-center text-white/90">
                  <User size={12} strokeWidth={2.5}/>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden bg-transparent rounded-[32px]">
          {renderContent()}
        </div>

        {showClosingSession && (
          <ClosingSessionView 
            user={user} 
            onLogout={handleLogout} 
            t={t}
          />
        )}
      </main>
    </div>
  );
}
