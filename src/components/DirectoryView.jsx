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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="px-10 md:px-14 py-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-400/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <User size={24} />
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mamy-gradient-text italic leading-none">{t('directory')}</h1>
          </div>
          <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] ml-16 italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            MamaMary Corporate Network
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-focus-within:bg-indigo-500/10 transition-all rounded-3xl" />
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH STAFF..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[1.8rem] py-5 pl-16 pr-6 outline-none focus:border-indigo-400/40 focus:bg-white/[0.05] transition-all font-black text-sm uppercase tracking-tighter text-white relative z-10 backdrop-blur-md"
            />
          </div>

          <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md relative z-10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-500 ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20 hover:text-white/40'}`}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-500 ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/20 hover:text-white/40'}`}
            >
              <ListIcon size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-10 md:px-14 pb-20 no-scrollbar relative z-10">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredUsers.map(u => (
              <div 
                key={u.email} 
                className="group glass-card p-8 border border-white/5 hover:border-indigo-500/30 transition-all duration-700 hover:bg-white/[0.05] overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-500/5 to-transparent rounded-bl-[4rem] pointer-events-none" />
                
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-10">
                  <div className="relative group-hover:scale-105 transition-transform duration-700">
                    <div className="w-24 h-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-4xl font-black text-indigo-400 border border-indigo-400/20 shadow-2xl overflow-hidden relative">
                      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                      {u.photo ? (
                        <img src={u.photo} alt={u.name} className="w-full h-full object-cover relative z-10" />
                      ) : (
                        <span className="relative z-10">{u.name?.substring(0,2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-600 border-4 border-mamy-dark/50 flex items-center justify-center text-white shadow-2xl">
                      <Shield size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-400/20 backdrop-blur-md mb-2">
                      {u.role}
                    </span>
                    <span className="text-[8px] font-black text-white/10 uppercase tracking-widest italic">ID-{Math.abs(u.email.length * 7).toString().padStart(4, '0')}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-6 relative z-10">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-2 italic">{u.name}</h3>
                    <div className="flex items-center gap-2 text-indigo-400/60 uppercase font-black text-[10px] tracking-[0.2em] italic">
                      <Store size={12} className="text-mamy-gold" />
                      {getStoreName(u.storeId)}
                    </div>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  <div className="grid grid-cols-1 gap-3">
                    <a href={`mailto:${u.email}`} className="flex items-center gap-4 text-white/30 hover:text-white transition-all group/link bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/link:bg-indigo-500/20 group-hover/link:text-indigo-400 transition-all shrink-0">
                        <Mail size={16} />
                      </div>
                      <div className="flex flex-col shrink min-w-0">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/10">Email Address</span>
                        <span className="text-xs font-bold truncate">{u.email}</span>
                      </div>
                    </a>
                    <a href={`tel:${u.phone}`} className="flex items-center gap-4 text-white/30 hover:text-white transition-all group/link bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/link:bg-indigo-500/20 group-hover/link:text-indigo-400 transition-all shrink-0">
                        <Phone size={16} />
                      </div>
                      <div className="flex flex-col shrink min-w-0">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/10">Phone Number</span>
                        <span className="text-xs font-bold">{u.phone || 'N/A'}</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card overflow-hidden border border-white/5 relative">
            <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">{t('staff')}</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Professional Role</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Location</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic text-right">Contact Hub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(u => (
                  <tr key={u.email} className="hover:bg-white/[0.03] transition-all duration-500 group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-lg font-black text-indigo-400 border border-indigo-400/20 overflow-hidden relative">
                          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
                          {u.photo ? (
                            <img src={u.photo} alt={u.name} className="w-full h-full object-cover relative z-10" />
                          ) : (
                            <span className="relative z-10">{u.name?.substring(0,2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-lg font-black text-white group-hover:text-indigo-400 transition-all uppercase tracking-tight italic">{u.name}</span>
                          <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Employee Profile</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-400/10 px-4 py-2 rounded-xl border border-indigo-400/20 italic">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-white/20" />
                        <span className="text-xs font-black text-white/40 uppercase tracking-tight">{getStoreName(u.storeId)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <a href={`mailto:${u.email}`} className="w-12 h-12 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-2xl text-white/20 hover:text-indigo-400 hover:bg-indigo-400/10 hover:border-indigo-400/30 transition-all" title={u.email}>
                          <Mail size={18} />
                        </a>
                        <a href={`tel:${u.phone}`} className="w-12 h-12 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-2xl text-white/20 hover:text-indigo-400 hover:bg-indigo-400/10 hover:border-indigo-400/30 transition-all" title={u.phone}>
                          <Phone size={18} />
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
          <div className="flex flex-col items-center justify-center py-40 text-center animate-in fade-in zoom-in duration-700">
            <div className="w-32 h-32 bg-white/[0.02] rounded-[2.5rem] flex items-center justify-center text-white/5 mb-10 border border-white/5 shadow-inner">
              <Search size={48} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-white/20 uppercase tracking-[0.4em] italic">{t('no_results')}</h3>
            <p className="text-white/10 text-[10px] mt-4 font-black uppercase tracking-widest italic">Check security clearance or search parameters</p>
          </div>
        )}
      </div>
    </div>
  );
}
