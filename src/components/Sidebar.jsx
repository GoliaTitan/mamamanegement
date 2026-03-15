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
    if (user.role === 'developer' || user.role === 'admin') return true;
    if (user.role === 'manager') return true;
    if (['dashboard', 'directory'].includes(item.id)) return true;
    if (user.role === 'warehouse') return ['inventory', 'settings'].includes(item.id);
    if (user.role === 'cashier') return ['pos', 'settings'].includes(item.id);
    return false;
  });

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-[240px] flex flex-col z-50 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0 bg-black/80 backdrop-blur-3xl' : '-translate-x-full bg-transparent'}
      `}>
        {/* Navigation - Pushed down to align with floating content */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 mt-16 space-y-2 no-scrollbar">
          {filteredMenuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-semibold tracking-wide ${
                  isActive 
                  ? 'nav-pill-active' 
                  : 'nav-pill-inactive'
                }`}
              >
                <item.icon size={20} strokeWidth={1.5} className={isActive ? 'text-mamy-glow' : 'opacity-70 group-hover:opacity-100'} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-3 shrink-0 mb-4 opacity-50 hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onRequestClose()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-full hover:bg-white/5 text-white transition-colors text-sm font-semibold tracking-wide"
          >
            <Clock size={18} strokeWidth={1.5} className="text-white/50" />
            {t('logout')}
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-white hover:text-red-400 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={14} strokeWidth={2} />
            {t('esc_console')}
          </button>
        </div>
      </aside>
    </>
  );
}
