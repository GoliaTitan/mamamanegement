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
  RefreshCw
} from 'lucide-react';
import { db } from '../lib/db';

export default function DeveloperSettings({ user, onLogout, onUpdatePIN, onSync, syncStatus }) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, staff, stores, reports, system
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
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

  useEffect(() => {
    loadData();
    if (activeTab === 'reports') {
      loadSalesReports();
    }
  }, [user, activeTab]);

  const loadSalesReports = async () => {
    const today = new Date().toISOString().split('T')[0];
    const allSales = await db.sales.orderBy('timestamp').reverse().toArray();
    setSales(allSales);

    const todaySales = allSales.filter(s => s.timestamp.startsWith(today));
    const totals = todaySales.reduce((acc, s) => ({
      gross: acc.gross + (s.totalGross || 0),
      discount: acc.discount + (s.totalDiscount || 0),
      net: acc.net + (s.totalNet || 0)
    }), { gross: 0, discount: 0, net: 0 });
    
    setReportTotals(totals);
  };

  const loadData = async () => {
    const allUsers = await db.users.toArray();
    const allStores = await db.stores.toArray();
    const allProducts = await db.products.toArray();
    const emailConfig = await db.config.get('reportEmail');
    
    setUsers(allUsers);
    setStores(allStores);
    setProducts(allProducts);
    if (emailConfig) setReportEmail(emailConfig.value);
  };

  const handleUpdateProfile = async () => {
    try {
      await db.users.update(user.email, { phone, photo, language, needsSync: true });
      setStatus('Profilo aggiornato con successo');
      setTimeout(() => setStatus(''), 3000);
      if (onUpdatePIN) onUpdatePIN(user.pin); // This refreshes the session in App.jsx
    } catch (err) {
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
      if (onUpdatePIN) onUpdatePIN(newPin);
    } catch (err) {
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
    } catch (err) {
      alert('Errore: ID Sede già esistente');
    }
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
    } catch (err) {
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
      loadData();
    } catch (err) {
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
      loadData();
    } catch (err) {
      alert('Errore durante l\'aggiornamento dell\'offerta');
    }
  };

  const handleToggleBestSeller = async (productId, currentStatus) => {
    try {
      await db.products.update(productId, { 
        is_best_seller: !currentStatus,
        needsSync: true
      });
      loadData();
    } catch (err) {
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
          loadData();
        } catch (err) {
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
      <div className="flex items-center gap-2 px-8 py-6 border-b border-white/5 bg-white/20 backdrop-blur-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black uppercase tracking-tighter text-xs border ${
              activeTab === tab.id 
              ? `bg-white/10 ${tab.color} border-white/20 shadow-lg` 
              : 'text-white/30 border-transparent hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-black/40">
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {activeTab === 'profile' && (
            <div className="glass-panel p-8 space-y-8">
              <div className="flex items-center gap-6">
                <label className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-mamy-green/10 flex items-center justify-center text-mamy-green border-2 border-mamy-green/20 text-3xl font-black overflow-hidden shadow-lg shadow-mamy-green/10 group-hover:border-mamy-green transition-all">
                    {photo ? (
                      <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name?.substring(0,2).toUpperCase() || 'DV'
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                    </div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                <div className="flex-1">
                  <h1 className="text-3xl font-black text-white/90 uppercase tracking-tighter">{user.name}</h1>
                  <p className="text-mamy-green font-black uppercase tracking-widest text-[10px] italic">{user.role}</p>
                  <p className="text-white/30 text-sm font-medium mt-1">{user.email}</p>
                </div>
                <button 
                  onClick={handleUpdateProfile}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Save size={14} />
                  Salva Modifiche Profilo
                </button>
              </div>

              <div className="h-px bg-white/5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/40">
                      <Phone size={24} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Contatti</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Numero di Telefono</label>
                      <input 
                        type="tel" 
                        placeholder="+39 333 1234567"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-indigo-400/40 transition-all font-medium text-white/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Lingua / Language</label>
                      <select 
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm outline-none focus:border-mamy-green/40 transition-all font-medium text-white/80"
                      >
                        <option value="it">Italiano 🇮🇹</option>
                        <option value="en">English 🇬🇧</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-mamy-green/10 rounded-2xl flex items-center justify-center text-mamy-green">
                      <Key size={24} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Cambia PIN Accesso</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="password" 
                        placeholder="Nuovo PIN (6 cifre)"
                        maxLength={6}
                        value={newPin}
                        onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-mamy-green/40"
                      />
                      <input 
                        type="password" 
                        placeholder="Conferma PIN"
                        maxLength={6}
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-mamy-green/40"
                      />
                    </div>
                    <button 
                      onClick={handleUpdatePIN}
                      className="w-full py-4 bg-mamy-green text-black font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-mamy-green/10"
                    >
                      <Save size={18} />
                      Salva Nuovo PIN
                    </button>
                    {status && (
                      <p className={`text-xs font-bold text-center uppercase tracking-widest ${status.includes('successo') ? 'text-mamy-green' : 'text-red-400'}`}>
                        {status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                      <Package size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight">Gestione Offerte & Prodotti</h2>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Configura sconti e articoli in vetrina</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition-all">
                      <label className="relative group cursor-pointer">
                        <div className="w-16 h-16 rounded-xl bg-white/5 p-2 shrink-0 border border-white/5 group-hover:border-emerald-400/40 transition-all overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={16} className="text-white" />
                          </div>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleProductPhotoUpload(p.id, e)}
                        />
                      </label>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-white/90 truncate uppercase">{p.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-white/40">{p.price}€</span>
                          {p.on_sale && (
                            <span className="text-[10px] font-black text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded">
                              In Offerta: {p.sale_price}€
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <select 
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-white/60 outline-none focus:border-emerald-400/40"
                          value={p.category}
                          onChange={(e) => handleUpdateProductCategory(p.id, e.target.value)}
                        >
                          {['FLOWERS', 'OILS', 'EDIBLES', 'VAPE KIT CBD', 'HEMP CARE', 'SEEDS'].map(cat => (
                            <option key={cat} value={cat} className="bg-mamy-dark text-white">{cat}</option>
                          ))}
                        </select>

                        <button 
                          onClick={() => handleToggleBestSeller(p.id, p.is_best_seller)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p.is_best_seller ? 'bg-mamy-green text-black shadow-lg shadow-mamy-green/20' : 'bg-white/5 text-white/20 hover:text-white'}`}
                        >
                          Best Seller
                        </button>
                        
                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                          <input 
                            type="number" 
                            placeholder="Offerta €"
                            className="w-20 bg-transparent border-none text-xs font-black text-amber-400 outline-none placeholder:text-white/10"
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
                          <Tag size={14} className="text-white/20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Staff Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                      <UserPlus size={24} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-blue-400">Nuovo Staff</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Nome Completo"
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/40"
                    />
                    <input 
                      type="email" 
                      placeholder="Email aziendale"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/40"
                    />
                    <input 
                      type="text" 
                      placeholder="Telefono"
                      value={newUser.phone || ''}
                      onChange={e => setNewUser({...newUser, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/40"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="password" 
                        placeholder="PIN (6 cifre)"
                        maxLength={6}
                        value={newUser.pin}
                        onChange={e => setNewUser({...newUser, pin: e.target.value.replace(/\D/g, '')})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/40"
                      />
                      <select 
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/40 text-white/60"
                      >
                        <option value="cashier" className="bg-mamy-dark italic font-black uppercase">Cassiere (IT)</option>
                        <option value="warehouse" className="bg-mamy-dark italic font-black uppercase">Magazziniere (IT)</option>
                        <option value="manager" className="bg-mamy-dark italic font-black uppercase">Store Manager (IT)</option>
                        <option value="admin" className="bg-mamy-dark italic font-black uppercase">Admin (IT)</option>
                      </select>
                      <select 
                        value={newUser.language}
                        onChange={e => setNewUser({...newUser, language: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400/40 text-white/60"
                      >
                        <option value="it" className="bg-mamy-dark italic font-black uppercase">Italiano 🇮🇹</option>
                        <option value="en" className="bg-mamy-dark italic font-black uppercase">English 🇬🇧</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleAddUser}
                      className="w-full py-4 bg-blue-500 text-white font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/10"
                    >
                      Crea Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Staff List */}
              <div className="lg:col-span-2 glass-panel p-8 h-fit">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                      <Briefcase size={24} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight text-blue-400">Elenco Personale</h2>
                  </div>
                  <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-400/20">
                    {users.length} Totali
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map(u => (
                    <div key={u.email} className="group relative flex flex-col p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-400/30 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner overflow-hidden ${u.role === 'developer' ? 'bg-mamy-green text-black shadow-mamy-green/20' : 'bg-white/10 text-white/40'}`}>
                            {u.photo ? (
                              <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name?.substring(0,2).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-white/90 line-clamp-1">{u.name}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest italic ${u.role === 'developer' ? 'text-mamy-green' : 'text-white/20'}`}>
                              {u.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => startEditing(u)}
                            className={`p-2 rounded-xl transition-all ${editingUser?.email === u.email ? 'bg-blue-400 text-black shadow-lg shadow-blue-400/20' : 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10'}`}
                          >
                            <Settings size={16} />
                          </button>
                          {u.email !== user.email && (
                            <button 
                              onClick={() => deleteUser(u.email)}
                              className="p-2 bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {editingUser?.email === u.email && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-white/30 uppercase ml-1">Nuovo PIN</label>
                              <input 
                                type="text" 
                                placeholder="6 cifre"
                                maxLength={6}
                                value={editValues.pin}
                                onChange={e => setEditValues({...editValues, pin: e.target.value.replace(/\D/g, '')})}
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-400/40"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-white/30 uppercase ml-1">Ruolo</label>
                              <select 
                                value={editValues.role}
                                onChange={e => setEditValues({...editValues, role: e.target.value})}
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none text-white/60 font-sans"
                              >
                                <option value="cashier" className="bg-mamy-dark">Cassiere</option>
                                <option value="warehouse" className="bg-mamy-dark">Magazziniere</option>
                                <option value="manager" className="bg-mamy-dark">Manager</option>
                                <option value="admin" className="bg-mamy-dark">Admin</option>
                                {u.role === 'developer' && <option value="developer" className="bg-mamy-dark">Sviluppatore</option>}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-white/30 uppercase ml-1">Telefono</label>
                              <input 
                                  type="text" 
                                  value={editValues.phone}
                                  onChange={e => setEditValues({...editValues, phone: e.target.value})}
                                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-400/40"
                                />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-white/30 uppercase ml-1">Lingua</label>
                              <select 
                                value={editValues.language}
                                onChange={e => setEditValues({...editValues, language: e.target.value})}
                                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none text-white/60 font-sans"
                              >
                                <option value="it" className="bg-mamy-dark">Italiano 🇮🇹</option>
                                <option value="en" className="bg-mamy-dark">English 🇬🇧</option>
                              </select>
                            </div>
                          </div>
                          <button 
                            onClick={handleUpdateUser}
                            className="w-full py-3 bg-blue-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-blue-400/10"
                          >
                            Conferma Modifiche
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Store Form */}
              <div className="lg:col-span-1 glass-panel p-8 h-fit">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                    <Store size={24} />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-purple-400">Nuova Sede</h2>
                </div>
                
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="ID Sede (es: roma_centro)"
                    value={newStore.id}
                    onChange={e => setNewStore({...newStore, id: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400/40"
                  />
                  <input 
                    type="text" 
                    placeholder="Nome Sede"
                    value={newStore.name}
                    onChange={e => setNewStore({...newStore, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400/40"
                  />
                  <input 
                    type="text" 
                    placeholder="Indirizzo"
                    value={newStore.address}
                    onChange={e => setNewStore({...newStore, address: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400/40"
                  />
                  <button 
                    onClick={handleCreateStore}
                    className="w-full py-4 bg-purple-500 text-white font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/10"
                  >
                    Crea Sede
                  </button>
                </div>
              </div>

              {/* Stores List */}
              <div className="lg:col-span-2 glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                      <LayoutDashboard size={24} />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Le Tue Sedi</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stores.map(s => (
                    <div key={s.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-400/30 transition-all duration-300 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{s.id}</span>
                          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] animate-pulse" />
                        </div>
                        <h3 className="text-lg font-black text-white/90">{s.name}</h3>
                        <p className="text-xs text-white/30 font-medium leading-relaxed">{s.address || 'Nessun indirizzo specificato'}</p>
                      </div>
                      
                      <div className="mt-6 flex items-center gap-4">
                        <div className="flex-1 h-[2px] bg-white/5 rounded-full" />
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">Active store</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8">
              {/* Daily Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 border-white/5 bg-white/5">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Totale Lordo (Oggi)</span>
                  <div className="text-3xl font-black text-white mt-1">{reportTotals.gross.toFixed(2)}€</div>
                </div>
                <div className="glass-panel p-6 border-white/5 bg-white/5">
                  <span className="text-[10px] font-black text-amber-400/40 uppercase tracking-[0.2em]">Sconti & Omaggi</span>
                  <div className="text-3xl font-black text-amber-400 mt-1">-{reportTotals.discount.toFixed(2)}€</div>
                </div>
                <div className="glass-panel p-6 border-mamy-green/20 bg-mamy-green/5">
                  <span className="text-[10px] font-black text-mamy-green uppercase tracking-[0.2em]">Incasso Netto</span>
                  <div className="text-3xl font-black text-mamy-green mt-1">{reportTotals.net.toFixed(2)}€</div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center text-amber-400">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight">Registro Vendite</h2>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Ultime transazioni registrate</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest px-4">Ora</th>
                        <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest px-4">Operatore</th>
                        <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest px-4 text-right">Lordo</th>
                        <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest px-4 text-right">Sconto</th>
                        <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest px-4 text-right">Netto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sales.map((sale) => (
                        <tr key={sale.id} className="group hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-xs font-bold text-white/60">
                            {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4 px-4 text-xs font-black text-white/80 uppercase">
                            {sale.userId.split('@')[0]}
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-white/40 text-right">
                            {sale.totalGross?.toFixed(2)}€
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-amber-400/60 text-right">
                            -{sale.totalDiscount?.toFixed(2)}€
                          </td>
                          <td className="py-4 px-4 text-sm font-black text-mamy-green text-right">
                            {sale.totalNet?.toFixed(2)}€
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sales.length === 0 && (
                    <div className="py-20 text-center text-white/10 uppercase font-black tracking-widest text-xs">
                      Nessuna vendita registrata
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'system' && (
            <div className="glass-panel p-8 space-y-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Parametri di Sistema</h2>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Configurazione globale e logiche di reportistica</p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-white/60 uppercase tracking-tight">Email Report di Apertura</label>
                    <span className="text-[9px] text-mamy-green font-black uppercase tracking-widest bg-mamy-green/10 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="email" 
                      placeholder="es: admin@mamamary.io"
                      value={reportEmail}
                      onChange={e => setReportEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-red-400/40 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-white/30 font-bold leading-relaxed">
                    Tutti i report delle check-list di apertura (foto incluse) verranno inviati automaticamente a questo indirizzo.
                  </p>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-white/60 uppercase tracking-tight">Cloud Sync & Backup</label>
                    <div className={`px-2 py-0.5 rounded flex items-center gap-1.5 ${
                      syncStatus === 'syncing' ? 'bg-indigo-500/10 text-indigo-400' : 
                      syncStatus === 'error' ? 'bg-red-500/10 text-red-500' :
                      'bg-mamy-green/10 text-mamy-green'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        syncStatus === 'syncing' ? 'bg-indigo-400 animate-pulse' : 
                        syncStatus === 'error' ? 'bg-red-500' : 'bg-mamy-green'
                      }`} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{syncStatus}</span>
                    </div>
                  </div>
                  <button 
                    onClick={onSync}
                    disabled={syncStatus === 'syncing'}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                    Sincronizza Database Ora
                  </button>
                  <p className="text-[10px] text-white/30 font-bold leading-relaxed">
                    Sincronizza manualmente le vendite locali con il cloud Supabase e scarica gli ultimi aggiornamenti prodotti.
                  </p>
                </div>

                <button 
                  onClick={handleUpdateConfig}
                  className="w-full py-4 bg-red-400/10 border border-red-400/20 text-red-400 font-black uppercase tracking-widest rounded-xl hover:bg-red-400/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Save size={18} />
                  Salva Configurazione
                </button>
                {status && (
                  <p className="text-[10px] font-black text-center text-mamy-green uppercase tracking-widest animate-pulse">
                    {status}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Nav */}
      <div className="px-8 py-4 border-t border-white/5 bg-mamy-dark/60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-mamy-green shadow-[0_0_10px_rgba(57,211,83,0.3)]" />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Logged as Developer Console • Local DB V5
          </span>
        </div>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-6 py-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-all text-xs font-black uppercase tracking-widest"
        >
          <LogOut size={16} />
          Esci dalla Console
        </button>
      </div>
    </div>
  );
}
