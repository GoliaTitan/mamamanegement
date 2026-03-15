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
import { Bell, User, Search, MapPin, BookUser, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { initLocalDB, db } from './lib/db';
import { useSync } from './hooks/useSync';
import { translations } from './lib/translations';

export default function App() {
  const { isOnline, syncStatus, performFullSync } = useSync();
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  const currentLang = user?.language || 'it';
  const t = (key) => translations[currentLang][key] || key;
  const [cashFund, setCashFund] = useState(null);
  const [activePage, setActivePage] = useState('pos');
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
    };
    
    initialize();
    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedFund = localStorage.getItem('mamy_cash_fund');
    if (savedFund) setCashFund(parseFloat(savedFund));

    return () => clearInterval(timer);
  }, []);

  const checkDailyOpeningStatus = async (userData) => {
    if (userData.role !== 'cashier' && userData.role !== 'manager') return;
    
    const today = new Date().toISOString().split('T')[0];
    const storeId = userData.store?.id || 'roma_centro';
    
    const existingCheck = await db.daily_checks.where({
      date: today,
      userId: userData.email,
      storeId: storeId,
      type: 'opening_check'
    }).first();

    if (!existingCheck) {
      setShowOpeningCheck(true);
    }
  };

  const handleCheckout = async (paymentMethod = 'cash') => {
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
      paymentMethod, // Uses the value passed from Cart
      storeId: user.store?.id || 'roma_centro',
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

  const handleUpdateDevPIN = (newPin) => {
    const updatedUser = { ...user, pin: newPin };
    setUser(updatedUser);
    localStorage.setItem('mamy_session', JSON.stringify(updatedUser)); // Current session
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
        store={user.store || { id: 'roma_centro', name: 'Roma Centro' }} 
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
      case 'pos':
        return (
          <div className="flex-1 flex overflow-hidden">
            <POSView onAddToCart={(p) => {
              addToCart(p);
              if (window.innerWidth < 1024) setShowCart(true);
            }} t={t} />
            <div className={`cart-container ${showCart ? 'cart-open' : 'cart-closed'}`}>
              {/* Mobile Cart Overlay */}
              {showCart && (
                <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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
        return <InventoryView t={t} />;
      case 'directory':
        return <DirectoryView t={t} />;
      case 'settings':
        if (user.role === 'developer' || user.role === 'admin' || user.role === 'manager' || user.role === 'warehouse') {
          return <DeveloperSettings user={user} onUpdatePIN={handleUpdateDevPIN} onLogout={handleLogout} onSync={performFullSync} syncStatus={syncStatus} t={t} />;
        }
        setActivePage('pos');
        return <POSView onAddToCart={addToCart} t={t} />;
      default:
        console.warn('Unknown page, defaulting to POS');
        return (
          <div className="flex-1 flex overflow-hidden">
            <POSView onAddToCart={addToCart} t={t} />
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
            />
          </div>
        );
    }
  };

  const toggleMobileMenu = () => setShowMobileMenu(!showMobileMenu);

  console.log('Rendering App with user:', user?.name, 'page:', activePage);

  return (
    <div className="flex h-screen overflow-hidden text-white font-outfit relative">
      {/* Premium Background Layer */}
      <div className="custom-bg" style={{ backgroundImage: 'url("/bg_mamy.jpg")' }} />
      
      {/* Background blobs for depth */}
      <div className="blur-overlay w-[600px] h-[600px] bg-mamy-green top-[-200px] left-[-200px]" />
      <div className="blur-overlay w-[400px] h-[400px] bg-emerald-500 bottom-[-100px] right-[20%] opacity-10" />

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
        {/* Header matching mockup */}
        <header className="h-[80px] md:h-[100px] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 bg-white/5 rounded-2xl border border-white/10 text-white/60 active:scale-95 transition-all"
            >
              <div className="w-5 h-0.5 bg-current mb-1 rounded-full" />
              <div className="w-5 h-0.5 bg-current mb-1 rounded-full" />
              <div className="w-3 h-0.5 bg-current rounded-full" />
            </button>
            
            {activePage === 'pos' && (
              <div className="flex flex-col">
                <h2 className="text-xl md:text-2xl font-black text-white/90">MamaMary</h2>
                <span className="text-[8px] md:text-[10px] font-black text-mamy-green/60 uppercase tracking-widest italic">
                  Terminal ID: MM-001 • {user.role === 'developer' ? 'Root Mode' : `Fondo: ${cashFund}€`}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activePage === 'pos' && (
              <button 
                onClick={() => setShowCart(true)}
                className="lg:hidden relative p-3 bg-white/5 rounded-2xl border border-white/10 text-white/60 active:scale-95 transition-all"
              >
                <ShoppingBag size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-mamy-green text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            )}
            
            {/* Location Selector */}
            <div className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <span className="text-sm font-bold text-white/60 text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">{user.store?.name || 'Roma Centro'}</span>
            </div>

            {/* Sync Status - Only for Manager+ */}
            {user && ['manager', 'admin', 'developer'].includes(user.role) && (
              <div className={`px-4 py-3 rounded-2xl backdrop-blur-md flex items-center gap-2 border transition-all ${
                syncStatus === 'syncing' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                syncStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                !isOnline ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' :
                'bg-mamy-green/10 border-mamy-green/20 text-mamy-green'
              }`}>
                {syncStatus === 'syncing' ? <RefreshCw size={16} className="animate-spin" /> :
                 syncStatus === 'error' ? <CloudOff size={16} /> :
                 !isOnline ? <CloudOff size={16} /> :
                 <Cloud size={16} />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">
                  {syncStatus === 'syncing' ? 'Sincronizzazione...' :
                   syncStatus === 'error' ? 'Errore Sync' :
                   !isOnline ? 'Offline' : 'Online'}
                </span>
              </div>
            )}

            {/* Time */}
            <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md font-mono text-sm font-bold text-white/60 min-w-[80px] text-center">
              {formatTime(time)}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2 ml-4">
              <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <Bell size={20} />
              </button>
              <div className="flex items-center gap-3 pl-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-white/90">{user.name}</span>
                  <span className="text-[9px] font-bold text-mamy-green uppercase tracking-tighter">{user.role}</span>
                </div>
                <button 
                  onClick={() => setActivePage('settings')}
                  className={`w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all ring-2 ${activePage === 'settings' ? 'ring-mamy-green' : 'ring-transparent'}`}
                >
                  <User size={24} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
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
