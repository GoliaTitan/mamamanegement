import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  UserPlus, 
  Key, 
  LogOut, 
  Save, 
  Store, 
  Mail, 
  User as UserIcon, 
  Trash2, 
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  History,
  Briefcase,
  Camera,
  Phone,
  Package, 
  Tag, 
  RefreshCw,
  TrendingUp,
  Grid
} from 'lucide-react';
import { db } from '../lib/db';

export default function DeveloperSettings({ user, onLogout, onUpdateUser, onSync, syncStatus }) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, staff, stores, reports, system
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [photo, setPhoto] = useState(user.photo || null);
  const [language, setLanguage] = useState(user.language || 'it');
  const [status, setStatus] = useState('');
  
  // Staff State
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', pin: '', role: 'cashier', language: 'it' });
  
  // Stores State
  const [stores, setStores] = useState([]);
  const [newStore, setNewStore] = useState({ id: '', name: '', address: '' });

  // Config State
  const [reportEmail, setReportEmail] = useState('');
  const [products, setProducts] = useState([]);

  // Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [editValues, setEditValues] = useState({ pin: '', role: '', phone: '', language: 'it' });
  const [sales, setSales] = useState([]);
  const [reportTotals, setReportTotals] = useState({ gross: 0, discount: 0, net: 0 });

  async function loadSalesReports() {
    const today = new Date().toISOString().split('T')[0];
    const allSales = await db.sales.orderBy('timestamp').reverse().toArray();
    setSales(allSales);

    // Comprehensive Report Stats
    const totals = allSales.reduce((acc, s) => {
      acc.gross += s.totalGross || 0;
      acc.discount += s.totalDiscount || 0;
      acc.net += s.totalNet || 0;
      if (s.timestamp.startsWith(today)) {
        acc.today += s.totalNet || 0;
      }
      return acc;
    }, { gross: 0, discount: 0, net: 0, today: 0 });

    setReportTotals(totals);
  }

  async function loadProducts() {
    // setLoading(true);
    const all = await db.products.toArray();
    setProducts(all);
    // setLoading(false);
  }

  async function loadData() {
    const allUsers = await db.users.toArray();
    const allStores = await db.stores.toArray();
    // Products are now loaded by loadProducts()
    const emailConfig = await db.config.get('reportEmail');

    setUsers(allUsers);
    setStores(allStores);
    if (emailConfig) setReportEmail(emailConfig.value);
  }

  useEffect(() => {
    loadData();
    loadProducts(); // Call loadProducts here
    if (activeTab === 'reports') {
      loadSalesReports();
    }
  }, [user, activeTab]);

  const handleUpdateProfile = async () => {
    try {
      const updates = { name, phone, photo, language, needsSync: true };
      await db.users.update(user.email, updates);
      setStatus('Profilo aggiornato con successo');
      setTimeout(() => setStatus(''), 3000);
      if (onUpdateUser) onUpdateUser(updates);
    } catch {
      alert('Errore durante l\'aggiornamento del profilo');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePIN = async () => {
    if (newPin.length !== 6 || confirmPin.length !== 6) {
      setStatus('Il PIN deve essere di 6 cifre');
      return;
    }
    if (newPin !== confirmPin) {
      setStatus('I PIN non corrispondono');
      return;
    }

    try {
      await db.users.update(user.email, { pin: newPin });
      setStatus('PIN aggiornato con successo!');
      setNewPin('');
      setConfirmPin('');
      if (onUpdateUser) onUpdateUser({ pin: newPin });
    } catch {
      setStatus('Errore durante l\'aggiornamento');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || newUser.pin.length !== 6) {
      alert('Compila tutti i campi (PIN deve essere di 6 cifre)');
      return;
    }
    try {
      await db.users.add(newUser);
      setNewUser({ name: '', email: '', pin: '', role: 'cashier', language: 'it' });
      loadData();
    } catch (err) {
      alert('Errore: Email già esistente o dati non validi');
    }
  };

  const handleCreateStore = async () => {
    if (!newStore.id || !newStore.name) {
      alert('ID e Nome sede sono obbligatori');
      return;
    }
    try {
      await db.stores.add(newStore);
      setNewStore({ id: '', name: '', address: '' });
      loadData();
      setStatus('Sede creata con successo');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      alert('Errore: ID Sede già esistente');
    }
  };

  const deleteStore = async (id) => {
    if (!confirm(`Sei sicuro di voler eliminare la sede ${id}?`)) return;
    await db.stores.delete(id);
    loadData();
  };

  const deleteUser = async (email) => {
    if (email === user.email) return;
    if (!confirm(`Sei sicuro di voler eliminare l'utente ${email}?`)) return;
    await db.users.delete(email);
    loadData();
  };

  const startEditing = (u) => {
    setEditingUser(u);
    setEditValues({ pin: u.pin, role: u.role, phone: u.phone || '', language: u.language || 'it' });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    if (editValues.pin.length !== 6) {
      alert('Il PIN deve essere di 6 cifre');
      return;
    }
    try {
      await db.users.update(editingUser.email, { 
        pin: editValues.pin, 
        role: editValues.role,
        phone: editValues.phone,
        language: editValues.language,
        needsSync: true
      });
      setEditingUser(null);
      loadData();
    } catch {
      alert('Errore durante l\'aggiornamento dell\'utente');
    }
  };

  const handleUpdateConfig = async () => {
    try {
      await db.config.put({ key: 'reportEmail', value: reportEmail });
      setStatus('Configurazione salvata con successo');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      alert('Errore durante il salvataggio della configurazione');
    }
  };

  const handleUpdateProductCategory = async (productId, newCategory) => {
    try {
      await db.products.update(productId, { 
        category: newCategory,
        needsSync: true
      });
      loadProducts(); // Refresh products after update
    } catch {
      alert('Errore durante l\'aggiornamento della categoria');
    }
  };

  const handleSetProductOffer = async (productId, onSale, salePrice) => {
    try {
      await db.products.update(productId, { 
        on_sale: onSale, 
        sale_price: parseFloat(salePrice) || 0,
        needsSync: true
      });
      loadProducts(); // Refresh products after update
    } catch {
      alert('Errore durante l\'aggiornamento dell\'offerta');
    }
  };

  const handleToggleBestSeller = async (productId, currentStatus) => {
    try {
      await db.products.update(productId, { 
        is_best_seller: !currentStatus,
        needsSync: true
      });
      loadProducts(); // Refresh products after update
    } catch {
      alert('Errore during best seller update');
    }
  };

  const handleProductPhotoUpload = (productId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await db.products.update(productId, { 
            image: reader.result,
            needsSync: true 
          });
          loadProducts(); // Refresh products after update
        } catch {
          alert('Errore caricamento foto prodotto');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Mio Profilo', icon: UserIcon, color: 'text-mamy-green' },
    { id: 'staff', label: 'Personale', icon: UserPlus, color: 'text-blue-400' },
    { id: 'products', label: 'Prodotti', icon: Package, color: 'text-emerald-400' },
    { id: 'stores', label: 'Sedi', icon: Store, color: 'text-purple-400' },
    { id: 'reports', label: 'Report & Vendite', icon: BarChart3, color: 'text-amber-400' },
    { id: 'system', label: 'Sistema', icon: ShieldCheck, color: 'text-red-400' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Settings Navigation */}
      <div className="flex items-center gap-3 px-8 py-8 border-b border-white/5 bg-white/2 backdrop-blur-3xl relative z-20">
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-mamy-gold/20 to-transparent" />
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-tighter text-xs border ${
              activeTab === tab.id 
              ? `bg-white/10 ${tab.color} border-white/20 shadow-2xl shadow-indigo-500/10 scale-105` 
              : 'text-white/20 border-transparent hover:text-white/40 hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'animate-pulse' : ''} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-black/40">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'profile' && (
            <div className="glass-card p-10 space-y-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-mamy-green/5 to-transparent rounded-bl-[8rem] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <label className="relative group/photo cursor-pointer scale-110">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-mamy-green/10 flex items-center justify-center text-mamy-green border-2 border-mamy-green/20 text-4xl font-black overflow-hidden shadow-2xl group-hover/photo:border-mamy-green group-hover/photo:scale-105 transition-all duration-700 relative">
                    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                    {photo ? (
                      <img src={photo} alt="Profile" className="w-full h-full object-cover relative z-10" />
                    ) : (
                      <span className="relative z-10">{user.name?.substring(0,2).toUpperCase() || 'DV'}</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity z-20">
                      <Camera size={32} className="text-white animate-bounce" />
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                
                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="relative group/input flex-1 max-w-md">
                      <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-white/3 border border-mamy-green/20 rounded-2xl py-3 px-6 text-3xl font-black text-white uppercase tracking-tighter italic outline-none focus:border-mamy-green/60 focus:bg-white/5 transition-all"
                      />
                    </div>
                    <span className="bg-mamy-green/10 text-mamy-green px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-mamy-green/20 backdrop-blur-md shrink-0">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-white/30 text-sm font-medium tracking-wide">{user.email}</p>
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] italic">Security Clearance Level 4</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleUpdateProfile}
                    className="px-8 py-4 bg-white/3 border border-white/10 rounded-2xl text-white/60 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white hover:border-mamy-green/40 transition-all flex items-center gap-3 group/save"
                  >
                    <Save size={18} className="group-hover/save:scale-110 transition-transform" />
                    Save Profile
                  </button>
                </div>
              </div>

              <div className="h-px bg-linear-to-r from-transparent via-white/5 to-transparent w-full" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 border border-white/5">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight italic">Contact Hub</h2>
                      <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">Global communications settings</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Phone Identifier</label>
                      <div className="relative group/input">
                        <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-mamy-green transition-colors" />
                        <input 
                          type="tel" 
                          placeholder="+39 333 1234567"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-white/3 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm outline-none focus:border-mamy-green/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">System Language</label>
                      <div className="relative">
                        <select 
                          value={language}
                          onChange={e => setLanguage(e.target.value)}
                          className="w-full bg-white/3 border border-white/10 rounded-2xl py-5 px-6 text-sm outline-none focus:border-mamy-green/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter appearance-none cursor-pointer"
                        >
                          <option value="it" className="bg-mamy-dark">Italiano Core 🇮🇹</option>
                          <option value="en" className="bg-mamy-dark">English Global 🇬🇧</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/10">
                          <Settings size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 p-8 rounded-3xl bg-mamy-green/20 border border-mamy-green/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-mamy-green/5 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 bg-mamy-green/10 rounded-2xl flex items-center justify-center text-mamy-green border border-mamy-green/20 shadow-lg shadow-mamy-green/10">
                      <Key size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight italic">Security Key</h2>
                      <p className="text-[10px] font-black text-mamy-green/40 uppercase tracking-widest">Update your terminal PIN</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">New PIN</label>
                        <input 
                          type="password" 
                          placeholder="••••••"
                          maxLength={6}
                          value={newPin}
                          onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white/3 border border-white/10 rounded-2xl py-5 px-6 text-center text-xl tracking-[0.5em] outline-none focus:border-mamy-green/40 focus:bg-white/5 transition-all font-black text-white"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Confirm PIN</label>
                        <input 
                          type="password" 
                          placeholder="••••••"
                          maxLength={6}
                          value={confirmPin}
                          onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-white/3 border border-white/10 rounded-2xl py-5 px-6 text-center text-xl tracking-[0.5em] outline-none focus:border-mamy-green/40 focus:bg-white/5 transition-all font-black text-white"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleUpdatePIN}
                      className="w-full py-5 bg-mamy-green text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-mamy-green/20"
                    >
                      <ShieldCheck size={20} />
                      Authorize & Update PIN
                    </button>
                    
                    {status && (
                      <div className={`text-[10px] font-black text-center uppercase tracking-widest p-3 rounded-xl backdrop-blur-md border animate-in fade-in zoom-in duration-500 ${
                        status.includes('successo') 
                        ? 'text-mamy-green bg-mamy-green/10 border-mamy-green/20' 
                        : 'text-red-400 bg-red-400/10 border-red-400/20'
                      }`}>
                        {status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="glass-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-emerald-500/5 to-transparent rounded-bl-[8rem] pointer-events-none" />
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-400/20 shadow-lg shadow-emerald-500/10">
                      <Package size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight italic text-emerald-400">Inventory Hub</h2>
                      <p className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">Global product & pricing strategy</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 relative z-10">
                  {products.map(p => (
                    <div key={p.id} className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-emerald-400/30 transition-all duration-700 hover:bg-white/4
 group/item">
                      <div className="lg:col-span-1 flex justify-center">
                        <label className="relative group/photo cursor-pointer shrink-0">
                          <div className="w-20 h-20 rounded-2xl bg-white/5 p-3 border border-white/10 group-hover/item:border-emerald-400/40 group-hover/item:rotate-3 transition-all duration-700 overflow-hidden relative">
                            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain relative z-10" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity z-20">
                              <Camera size={20} className="text-white animate-bounce" />
                            </div>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleProductPhotoUpload(p.id, e)}
                          />
                        </label>
                      </div>
                      
                      <div className="lg:col-span-4 min-w-0">
                        <h4 className="text-lg font-black text-white truncate uppercase tracking-tight italic group-hover/item:text-mamy-gold transition-colors">{p.name}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm font-black text-white/20 tracking-tighter">{p.price.toFixed(2)}€ Base</span>
                          {p.on_sale && (
                            <span className="text-[9px] font-black text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20 shadow-lg shadow-amber-400/5 animate-pulse">
                              Market Offer: {p.sale_price.toFixed(2)}€
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                        <div className="relative">
                          <select 
                            className="w-full bg-white/3 border border-white/10 rounded-2xl py-4 px-5 text-[10px] font-black uppercase text-white outline-none focus:border-emerald-400/40 transition-all appearance-none cursor-pointer"
                            value={p.category}
                            onChange={(e) => handleUpdateProductCategory(p.id, e.target.value)}
                          >
                            {['FLOWERS', 'OILS', 'EDIBLES', 'VAPE KIT CBD', 'HEMP CARE', 'SEEDS'].map(cat => (
                              <option key={cat} value={cat} className="bg-mamy-dark">{cat}</option>
                            ))}
                          </select>
                          <Grid size={12} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/10" />
                        </div>

                        <button 
                          onClick={() => handleToggleBestSeller(p.id, p.is_best_seller)}
                          className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700 border ${p.is_best_seller ? 'bg-mamy-green text-black border-mamy-green shadow-xl shadow-mamy-green/10' : 'bg-white/5 text-white/20 border-white/5 hover:text-white hover:border-emerald-400/40'}`}
                        >
                          Showcase Art
                        </button>
                        
                        <div className="relative group/price">
                          <div className="absolute inset-0 bg-amber-400/5 blur-xl opacity-0 group-focus-within/price:opacity-100 transition-opacity rounded-2xl" />
                          <div className="flex items-center gap-3 bg-black/20 px-4 py-4 rounded-2xl border border-white/5 group-focus-within/price:border-amber-400/40 transition-all relative z-10">
                            <input 
                              type="number" 
                              placeholder="OFFER €"
                              step="0.1"
                              className="w-full bg-transparent border-none text-xs font-black text-amber-400 outline-none placeholder:text-white/10 text-center uppercase tracking-widest"
                              defaultValue={p.on_sale ? p.sale_price : ''}
                              onBlur={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  handleSetProductOffer(p.id, true, val);
                                } else if (p.on_sale) {
                                  handleSetProductOffer(p.id, false, 0);
                                }
                              }}
                            />
                            <Tag size={16} className="text-white/10 group-focus-within/price:text-amber-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Add Staff Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/5 to-transparent rounded-bl-[4rem] pointer-events-none" />
                  
                  <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-400/20 shadow-lg shadow-blue-500/10">
                      <UserPlus size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight italic text-blue-400">Staff Hub</h2>
                      <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">Enroll new personnel</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5 relative z-10">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Full Identity</label>
                       <input 
                        type="text" 
                        placeholder="OPERATIVE NAME"
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                        className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-blue-400/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Digital Address</label>
                       <input 
                        type="email" 
                        placeholder="CORPORATE EMAIL"
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                        className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-blue-400/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Security Hash (PIN)</label>
                         <input 
                          type="password" 
                          placeholder="••••••"
                          maxLength={6}
                          value={newUser.pin}
                          onChange={e => setNewUser({...newUser, pin: e.target.value.replace(/\D/g, '')})}
                          className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-center text-lg tracking-[0.5em] outline-none focus:border-blue-400/40 focus:bg-white/5 transition-all font-black text-white"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Operational Role</label>
                         <select 
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value})}
                          className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-blue-400/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter appearance-none cursor-pointer"
                        >
                          <option value="cashier" className="bg-mamy-dark italic">Field Cashier</option>
                          <option value="warehouse" className="bg-mamy-dark italic">Logistics Ops</option>
                          <option value="manager" className="bg-mamy-dark italic">Store Commander</option>
                          <option value="admin" className="bg-mamy-dark italic">High Command</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleAddUser}
                      className="w-full py-5 bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-blue-500/20 mt-4"
                    >
                      Authorize Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff List */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-10 relative overflow-hidden group h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-500/5 to-transparent rounded-bl-[8rem] pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-12 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-400/20">
                        <Briefcase size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight italic text-blue-400">Personnel Roster</h2>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">Authorized system operators</p>
                      </div>
                    </div>
                    <span className="bg-blue-500/10 text-blue-400 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-400/20 backdrop-blur-md">
                      {users.length} Active Nodes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {users.map(u => (
                      <div key={u.email} className={`group/item relative flex flex-col p-6 rounded-3xl bg-white/2 border transition-all duration-700 hover:bg-white/5 hover:scale-[1.02] ${editingUser?.email === u.email ? 'border-blue-400/40 bg-white/5' : 'border-white/5 hover:border-blue-400/20'}`}>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-black shadow-2xl overflow-hidden relative duration-700 group-hover/item:rotate-3 ${u.role === 'developer' ? 'bg-mamy-green text-black ring-4 ring-mamy-green/10' : 'bg-white/5 text-white/20 border border-white/10'}`}>
                              <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                              {u.photo ? (
                                <img src={u.photo} alt={u.name} className="w-full h-full object-cover relative z-10" />
                              ) : (
                                <span className="relative z-10">{u.name?.substring(0,2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-base font-black text-white uppercase tracking-tight italic truncate group-hover/item:text-blue-400 transition-colors">{u.name}</span>
                              <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${u.role === 'developer' ? 'mamy-gradient-text' : 'text-white/20'}`}>
                                {u.role}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => startEditing(u)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-500 ${editingUser?.email === u.email ? 'bg-blue-400 text-black shadow-lg shadow-blue-400/20 scale-110' : 'bg-white/5 text-white/10 hover:text-white hover:bg-white/10 hover:border-blue-400/40 border border-transparent'}`}
                            >
                              <Settings size={18} />
                            </button>
                            {u.email !== user.email && (
                              <button 
                                onClick={() => deleteUser(u.email)}
                                className="w-10 h-10 flex items-center justify-center bg-white/5 text-white/10 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/40 border border-transparent rounded-xl transition-all duration-500"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        {editingUser?.email === u.email && (
                          <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-700">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">New Security PIN</label>
                                <input 
                                  type="password" 
                                  placeholder="••••••"
                                  maxLength={6}
                                  value={editValues.pin}
                                  onChange={e => setEditValues({...editValues, pin: e.target.value.replace(/\D/g, '')})}
                                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-center text-sm outline-none focus:border-blue-400/40 font-black text-white"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">Operational Role</label>
                                <select 
                                  value={editValues.role}
                                  onChange={e => setEditValues({...editValues, role: e.target.value})}
                                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-xs outline-none text-white font-black uppercase tracking-tighter appearance-none cursor-pointer"
                                >
                                  <option value="cashier" className="bg-mamy-dark italic">Cashier</option>
                                  <option value="warehouse" className="bg-mamy-dark italic">Logistics</option>
                                  <option value="manager" className="bg-mamy-dark italic">Manager</option>
                                  <option value="admin" className="bg-mamy-dark italic">Command</option>
                                  {u.role === 'developer' && <option value="developer" className="bg-mamy-dark italic">Architect</option>}
                                </select>
                              </div>
                            </div>
                            
                            <button 
                              onClick={handleUpdateUser}
                              className="w-full py-4 bg-blue-400 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-blue-400/10"
                            >
                              Confirm Authority Update
                            </button>
                          </div>
                        )}
                        
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-linear-to-br from-blue-500/30 to-transparent rounded-tl-full pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Add Store Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-500/5 to-transparent rounded-bl-[4rem] pointer-events-none" />
                  
                  <div className="flex items-center gap-5 mb-10 relative z-10">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-400/20 shadow-lg shadow-purple-500/10">
                      <Store size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight italic text-purple-400">Node Hub</h2>
                      <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">Register new flagship</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5 relative z-10">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Unique ID</label>
                       <input 
                        type="text" 
                        placeholder="MAMA-ROMA-01"
                        value={newStore.id}
                        onChange={e => setNewStore({...newStore, id: e.target.value})}
                        className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-purple-400/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Store Profile</label>
                       <input 
                        type="text" 
                        placeholder="MAMAMARY ROMA CENTRO"
                        value={newStore.name}
                        onChange={e => setNewStore({...newStore, name: e.target.value})}
                        className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-purple-400/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Coordinates</label>
                       <input 
                        type="text" 
                        placeholder="VIA DELLE MAMAMARY 42"
                        value={newStore.address}
                        onChange={e => setNewStore({...newStore, address: e.target.value})}
                        className="w-full bg-white/3 border border-white/10 rounded-2xl px-6 py-5 text-sm outline-none focus:border-purple-400/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter"
                      />
                    </div>

                    <button 
                      onClick={handleCreateStore}
                      className="w-full py-5 bg-purple-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-purple-500/20 mt-4"
                    >
                      Initialize Node
                    </button>
                  </div>
                </div>
              </div>

              {/* Stores List */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-10 relative overflow-hidden group h-full">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-purple-500/5 to-transparent rounded-bl-[8rem] pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-12 relative z-10">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-400/20 shadow-2xl">
                        <LayoutDashboard size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight italic text-purple-400">Active Network</h2>
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">Global operation nodes</p>
                      </div>
                    </div>
                    <span className="bg-purple-500/10 text-purple-400 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-purple-400/20 backdrop-blur-md">
                      {stores.length} Ready Units
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6 relative z-10">
                    {stores.map(s => (
                      <div key={s.id} className="group/item relative flex items-center justify-between p-8 rounded-3xl bg-white/2 border border-white/5 transition-all duration-700 hover:bg-white/5 hover:border-purple-400/20 hover:scale-[1.01]">
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-400/20 shadow-2xl group-hover/item:rotate-3 transition-transform duration-700">
                            <Store size={28} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-black text-white uppercase tracking-tight italic group-hover/item:text-purple-400 transition-colors">{s.name}</h3>
                              <span className="text-[8px] font-black text-purple-400/60 uppercase tracking-widest bg-purple-400/5 px-2 py-0.5 rounded border border-purple-400/10">{s.id}</span>
                            </div>
                            <p className="text-xs text-white/30 font-medium tracking-wide uppercase">{s.address || 'Secret Location Protocol'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-mamy-green uppercase tracking-widest flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-mamy-green animate-pulse" />
                              Operational
                            </span>
                          </div>
                          <button 
                            onClick={() => deleteStore(s.id)}
                            className="w-12 h-12 flex items-center justify-center bg-white/5 text-white/10 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/40 border border-transparent rounded-2xl transition-all duration-500"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-linear-to-br from-purple-500/3 to-transparent rounded-tl-full pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="glass-card p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-500/5 to-transparent rounded-bl-[8rem] pointer-events-none" />
                
                <div className="flex items-center justify-between mb-12 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-400/20 shadow-2xl shadow-indigo-500/10">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter italic text-indigo-400">Ledger Intelligence</h2>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Global financial transaction logs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Total Net Revenue</p>
                      <p className="text-3xl font-black mamy-gradient-text italic">
                        {sales.reduce((acc, s) => acc + (s.totalNet || 0), 0).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto relative z-10 -mx-10 px-10">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="py-6 text-[10px] font-black text-white/20 uppercase tracking-widest px-4">Timestamp</th>
                        <th className="py-6 text-[10px] font-black text-white/20 uppercase tracking-widest px-4">Operator</th>
                        <th className="py-6 text-[10px] font-black text-white/20 uppercase tracking-widest px-4">Items</th>
                        <th className="py-6 text-[10px] font-black text-white/20 uppercase tracking-widest px-4 text-right">Gross</th>
                        <th className="py-6 text-[10px] font-black text-white/20 uppercase tracking-widest px-4 text-right">Shield</th>
                        <th className="py-6 text-[10px] font-black text-white/20 uppercase tracking-widest px-4 text-right">Net Liquidity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {sales.map(sale => (
                        <tr key={sale.id} className="group/row hover:bg-white/20 transition-colors">
                          <td className="py-6 px-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-white uppercase italic">{new Date(sale.timestamp).toLocaleDateString()}</span>
                              <span className="text-[9px] font-medium text-white/20">{new Date(sale.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <span className="text-xs font-black text-white/60 uppercase group-hover/row:text-indigo-400 transition-colors">{sale.cashierName}</span>
                          </td>
                          <td className="py-6 px-4">
                            <span className="text-[10px] font-black text-white/20 uppercase bg-white/5 px-3 py-1 rounded-lg">{sale.items?.length || 0} units</span>
                          </td>
                          <td className="py-6 px-4 text-right text-xs font-black text-white/40">{sale.totalGross?.toFixed(2)}€</td>
                          <td className="py-6 px-4 text-right text-xs font-black text-amber-400/40">-{sale.totalDiscount?.toFixed(2)}€</td>
                          <td className="py-6 px-4 text-right">
                            <span className="text-sm font-black text-mamy-green italic group-hover/row:scale-110 inline-block transition-transform">{sale.totalNet?.toFixed(2)}€</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sales.length === 0 && (
                    <div className="py-32 text-center">
                      <div className="text-[10px] font-black text-white/5 uppercase tracking-[0.5em] italic">No Transactions Found in Ledger</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in duration-700">
              <div className="glass-card p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-red-500/5 to-transparent rounded-bl-[8rem] pointer-events-none" />
                
                <div className="flex items-center gap-6 mb-12 relative z-10">
                  <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20 shadow-2xl shadow-red-500/10">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic text-red-500">System Core</h2>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Master protocol configurations</p>
                  </div>
                </div>

                <div className="space-y-10 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between ml-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Alerter Email Report</label>
                      <span className="text-[9px] text-mamy-green font-black uppercase tracking-widest bg-mamy-green/10 px-3 py-1 rounded-lg border border-mamy-green/20">Active Node</span>
                    </div>
                    <div className="relative group/input">
                      <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-red-500 transition-colors" />
                      <input 
                        type="email" 
                        placeholder="admin@mamamary.io"
                        value={reportEmail}
                        onChange={e => setReportEmail(e.target.value)}
                        className="w-full bg-white/3 border border-white/10 rounded-2xl pl-16 pr-6 py-6 text-sm outline-none focus:border-red-500/40 focus:bg-white/5 transition-all font-black text-white uppercase tracking-tighter"
                      />
                    </div>
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest italic ml-2">
                       All daily synchronized battlefield reports will be dispatched here.
                    </p>
                  </div>

                  <div className="h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between ml-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Deep Cloud Synchronization</label>
                      <div className={`px-3 py-1 rounded-lg flex items-center gap-2 border ${
                        syncStatus === 'syncing' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-400/20' : 
                        syncStatus === 'error' ? 'bg-red-500/10 text-red-500 border-red-400/20' :
                        'bg-mamy-green/10 text-mamy-green border-mamy-green/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          syncStatus === 'syncing' ? 'bg-indigo-400 animate-pulse' : 
                          syncStatus === 'error' ? 'bg-red-500' : 'bg-mamy-green'
                        }`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{syncStatus}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={onSync}
                      disabled={syncStatus === 'syncing'}
                      className="w-full py-6 bg-white/3 border border-white/10 rounded-3xl text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/7 hover:text-white hover:border-indigo-400/40 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group/sync"
                    >
                      <RefreshCw size={24} className={`${syncStatus === 'syncing' ? 'animate-spin' : 'group-hover/sync:rotate-180 transition-transform duration-1000'}`} />
                      Execute Global Database Sync
                    </button>
                    <p className="text-[9px] text-white/20 font-black uppercase tracking-widest italic text-center">
                      Merge local transaction data with Supabase Secure Cluster.
                    </p>
                  </div>

                  <div className="pt-6">
                    <button 
                      onClick={handleUpdateConfig}
                      className="w-full py-6 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.3em] rounded-3xl hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-red-500/20"
                    >
                      <Save size={22} />
                      Commit System Logic
                    </button>
                    {status && (
                      <div className="mt-4 text-[10px] font-black text-center text-mamy-green uppercase tracking-[0.4em] italic animate-pulse">
                        {status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Nav */}
      <div className="px-10 py-6 border-t border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-between relative z-20">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-mamy-green animate-pulse shadow-[0_0_15px_rgba(57,211,83,0.5)]" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-mamy-green animate-ping opacity-50" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] italic">
              Quantum Secure Console Active
            </span>
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">
              Node ID: MAMA-HQ-01 • Engine V5.2.0 • {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="group/logout flex items-center gap-4 px-8 py-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-500 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-red-500/5"
        >
          <LogOut size={18} className="group-hover/logout:-translate-x-1 transition-transform" />
          Terminate Console Session
        </button>
      </div>
    </div>
  );
}
