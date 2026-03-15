import React, { useState, useEffect } from 'react';
import { Search, Phone, Mail, User, Shield, Store, MapPin, Grid, List as ListIcon } from 'lucide-react';
import { db } from '../lib/db';

export default function DirectoryView({ t }) {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const loadData = async () => {
      const allUsers = await db.users.toArray();
      const allStores = await db.stores.toArray();
      setUsers(allUsers);
      setStores(allStores);
    };
    loadData();
  }, []);

  const getStoreName = (storeId) => {
    return stores.find(s => s.id === storeId)?.name || 'Sede Centrale';
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/40 backdrop-blur-md">
      {/* Header */}
      <div className="px-8 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white/90 italic">{t('directory')}</h1>
          <p className="text-white/30 text-xs font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            Connettiti con il Team MamaMary
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder={t('search_product')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none w-full md:w-[350px] focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-400/10 transition-all font-medium text-white/80"
            />
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20 hover:text-white/40'}`}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20 hover:text-white/40'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-12">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map(u => (
              <div 
                key={u.email} 
                className="group glass-panel p-6 border border-white/5 hover:border-indigo-400/30 transition-all duration-500 hover:translate-y-[-4px] overflow-hidden"
              >
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-3xl font-black text-indigo-400 border border-indigo-400/20 shadow-inner overflow-hidden">
                      {u.photo ? (
                        <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name?.substring(0,2).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-xl bg-indigo-500 border-2 border-mamy-dark flex items-center justify-center text-[10px] text-white shadow-lg">
                      <Shield size={12} strokeWidth={3} />
                    </div>
                  </div>
                  <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-400/20">
                    {u.role}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-white/90 tracking-tight leading-tight line-clamp-1">{u.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-indigo-400/60 uppercase font-black text-[9px] tracking-widest">
                      <Store size={10} />
                      {getStoreName(u.storeId)}
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  <div className="space-y-3">
                    <a href={`mailto:${u.email}`} className="flex items-center gap-3 text-white/40 hover:text-indigo-400 transition-colors group/link overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover/link:bg-indigo-400/10 transition-colors shrink-0">
                        <Mail size={14} />
                      </div>
                      <span className="text-xs font-medium truncate">{u.email}</span>
                    </a>
                    <a href={`tel:${u.phone}`} className="flex items-center gap-3 text-white/40 hover:text-indigo-400 transition-colors group/link overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover/link:bg-indigo-400/10 transition-colors shrink-0">
                        <Phone size={14} />
                      </div>
                      <span className="text-xs font-medium">{u.phone || 'Non disponibile'}</span>
                    </a>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel overflow-hidden border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">{t('staff')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">{t('settings')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">{t('directory')}</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">{t('reports')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.email} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-sm font-black text-indigo-400 border border-indigo-400/20 overflow-hidden">
                          {u.photo ? (
                            <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name?.substring(0,2).toUpperCase()
                          )}
                        </div>
                        <span className="font-black text-white/90 group-hover:text-indigo-400 transition-colors">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 bg-indigo-400/5 px-2 py-1 rounded-lg border border-indigo-400/10">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white/40">
                      {getStoreName(u.storeId)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <a href={`mailto:${u.email}`} className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-indigo-400 transition-colors" title={u.email}>
                          <Mail size={16} />
                        </a>
                        <a href={`tel:${u.phone}`} className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-indigo-400 transition-colors" title={u.phone}>
                          <Phone size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mb-6 border border-white/10">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-white/60 uppercase">{t('no_results')}</h3>
            <p className="text-white/20 text-sm mt-2">Prova a cambiare i parametri della ricerca.</p>
          </div>
        )}
      </div>
    </div>
  );
}
