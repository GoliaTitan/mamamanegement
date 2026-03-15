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

export default function Sidebar({ activePage, onNavigate, onLogout, user, t, isOpen, onClose }) {
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
        fixed inset-y-0 left-0 w-[280px] bg-[#0a0a0a]/90 backdrop-blur-2xl border-r border-white/5 p-6 z-100 transition-transform duration-500 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      {/* Brand */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-48 h-48 flex items-center justify-center overflow-hidden">
          <img src="/logo_gold.png" alt="MamaMary Logo" className="w-full h-full object-contain brightness-110 drop-shadow-[0_0_15px_rgba(218,165,32,0.2)]" />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {/* Stores Section (Optional visual grouping) */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/60 hover:bg-white/5 transition-all text-sm font-medium">
            <Store size={18} />
            <span>{user?.store?.name || 'Sede Principale'}</span>
          </button>
        </div>

        {/* Main Nav */}
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                activePage === item.id 
                ? 'bg-[rgba(57,211,83,0.15)] text-mamy-green border border-mamy-green/20' 
                : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activePage === item.id ? 'text-mamy-green' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer Nav */}
      <div className="space-y-2 pt-6 border-t border-white/5">
        <button 
          onClick={() => onRequestClose()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-white/40 hover:bg-white/5 hover:text-white transition-all text-sm group"
        >
          <Clock size={18} />
          <span>{t('logout')}</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-white/20 hover:text-red-400 transition-all text-[10px] uppercase font-bold tracking-widest"
        >
          <LogOut size={12} />
          <span>{t('esc_console')}</span>
        </button>
      </div>
    </aside>
    </>
  );
}
