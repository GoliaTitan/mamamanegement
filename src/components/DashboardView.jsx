import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Activity,
  ArrowUpRight,
  DollarSign,
  ShoppingBag,
  Package
} from 'lucide-react';
import ClientCounter from './widgets/ClientCounter';
import { db } from '../lib/db';

export default function DashboardView({ user, t }) {
  const [todaySales, setTodaySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const allSales = await db.sales.orderBy('timestamp').reverse().toArray();
      setTodaySales(allSales.filter(s => s.timestamp.startsWith(today)));
      setLoading(false);
    };
    loadData();
  }, []);

  const totalRevenue = todaySales.reduce((sum, s) => sum + s.totalNet, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
            <p className="text-white/50 text-sm mt-1">Bentornato, ecco un riepilogo della giornata corrente.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-[24px] glass-panel flex flex-col justify-between group hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white/50">Incasso Oggi</span>
              <DollarSign size={16} className="text-white/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">€{totalRevenue.toFixed(2)}</h2>
              <span className="flex items-center text-xs text-mamy-glow"><ArrowUpRight size={14}/> +12%</span>
            </div>
          </div>

          <div className="p-6 rounded-[24px] glass-panel flex flex-col justify-between group hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white/50">Ordini</span>
              <Activity size={16} className="text-white/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">{todaySales.length}</h2>
              <span className="flex items-center text-xs text-mamy-glow"><ArrowUpRight size={14}/> +4%</span>
            </div>
          </div>

          <ClientCounter />

          <div className="p-6 rounded-[24px] glass-panel flex flex-col justify-between group hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white/50">Prodotti Venduti</span>
              <Package size={16} className="text-white/40" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-white">
                {todaySales.reduce((sum, s) => sum + s.items.length, 0)}
              </h2>
            </div>
          </div>
        </div>

        {/* Modular Widgets Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 p-8 rounded-[24px] glass-panel min-h-[400px]">
            <h3 className="text-base font-semibold text-white mb-6">Andamento Settimanale</h3>
            {/* Chart placeholder */}
            <div className="w-full h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-xl">
              <div className="text-center">
                <BarChart3 size={48} className="text-white/10 mx-auto mb-3" />
                <span className="text-white/30 text-sm">Dati chart non disponibili offline</span>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[24px] glass-panel min-h-[400px] flex flex-col">
            <h3 className="text-base font-semibold text-white mb-6">Ultime Transazioni</h3>
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-2">
              {loading && <p className="text-sm text-white/30 text-center py-10">Caricamento...</p>}
              {!loading && todaySales.slice(0, 6).map((sale, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-mamy-glow transition-colors border border-white/10">
                      <ShoppingBag size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Ordine #{sale.id || 'N/A'}</p>
                      <p className="text-[10px] uppercase tracking-wider text-white/40">{new Date(sale.timestamp).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-white italic">€{sale.totalNet.toFixed(2)}</span>
                </div>
              ))}
              {!loading && todaySales.length === 0 && (
                 <p className="text-sm text-white/30 text-center py-10">Nessuna transazione oggi.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
