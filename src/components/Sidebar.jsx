import React from 'react';
import { 
  Store, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Clock,
  BookUser
} from 'lucide-react';

export default function Sidebar({ activePage, onNavigate, onLogout, user, t, isOpen, onClose, onRequestClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: t('pos'), icon: ShoppingBag },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'directory', label: t('directory'), icon: BookUser },
    { id: 'staff', label: t('staff'), icon: Users },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    
    // Developer & Admin can see everything
    if (user.role === 'developer' || user.role === 'admin') return true;
    
    // Manager can see everything except potentially deep system settings (handled in settings view)
    if (user.role === 'manager') return true;

    // Members can see dashboard and directory by default
    if (['dashboard', 'directory'].includes(item.id)) return true;

    // Warehouse/Magazziniere specific view
    if (user.role === 'warehouse') {
      return ['inventory', 'settings'].includes(item.id);
    }

    // Cashier/Cassiere specific limited view
    if (user.role === 'cashier') {
      return ['pos', 'settings'].includes(item.id);
    }

    return false;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-90 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-[300px] bg-white/2 backdrop-blur-[50px] border-r border-white/10 p-8 z-100 transition-transform duration-700 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      {/* Brand - Luxury Scale */}
      <div className="flex flex-col items-center mb-16 px-4">
        <div className="w-full flex items-center justify-center p-4 bg-white/3 border border-white/5 rounded-[2.5rem] backdrop-blur-md">
          <img src="/logo_gold.png" alt="MamaMary Logo" className="w-full h-auto object-contain brightness-110 drop-shadow-[0_0_20px_rgba(218,165,32,0.3)] animate-float" />
        </div>
      </div>

      <div className="flex-1 space-y-10">
        {/* Stores Section - Premium Design */}
        <div className="px-2">
          <div className="flex items-center gap-4 px-5 py-4 bg-white/3 border border-white/10 rounded-2xl text-white/40 hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-mamy-gold">
              <Store size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Store</span>
              <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{user?.store?.name || 'Sede Principale'}</span>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="space-y-2 px-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all duration-500 group relative overflow-hidden ${
                activePage === item.id 
                ? 'bg-mamy-green/10 text-mamy-green border border-mamy-green/30 shadow-[0_10px_30px_rgba(57,211,83,0.1)]' 
                : 'text-white/30 hover:bg-white/3 hover:text-white border border-transparent'
              }`}
            >
              <item.icon size={22} className={`${activePage === item.id ? 'text-mamy-green' : 'group-hover:scale-110 group-hover:text-mamy-green'} transition-all duration-500`} />
              <span className="text-sm font-black uppercase tracking-widest italic">{item.label}</span>
              
              {activePage === item.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-mamy-green rounded-l-full shadow-[0_0_15px_rgba(57,211,83,0.5)]" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer Nav */}
      <div className="mt-auto pt-8 border-t border-white/10 space-y-3 px-2">
        <button 
          onClick={() => onRequestClose()}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-white/30 hover:bg-white/5 hover:text-white transition-all text-xs font-black uppercase tracking-widest group"
        >
          <div className="p-2 bg-white/5 rounded-xl border border-white/5 group-hover:text-mamy-green transition-colors">
            <Clock size={18} />
          </div>
          <span>{t('logout')}</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-white/15 hover:text-red-500 transition-all text-[9px] uppercase font-black tracking-[0.2em] italic"
        >
          <LogOut size={14} />
          <span>{t('esc_console')}</span>
        </button>
      </div>
    </aside>
    </>
  );
}
