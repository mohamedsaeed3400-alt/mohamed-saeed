
import React, { useState } from 'react';
import { UserRole } from '../types';
import { translations, Language } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  user: { name: string; role: UserRole; dept?: string; brandId?: string };
  lang: Language;
  toggleLanguage: () => void;
  onNavigate: (page: string) => void;
  activePage: string;
  onLogout: () => void;
  brandFilter: string | null;
  onClearBrandFilter: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, lang, toggleLanguage, onNavigate, activePage, onLogout, brandFilter, onClearBrandFilter }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const t = translations[lang];

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: 'fa-chart-line', roles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.BRAND_OWNER] },
    { id: 'brands', label: t.brands, icon: 'fa-tags', roles: [UserRole.ADMIN, UserRole.OPERATIONS] },
    { id: 'orders', label: t.orders, icon: 'fa-shopping-cart', roles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.PACKAGING, UserRole.SUPPORT, UserRole.BRAND_OWNER] },
    { id: 'inventory', label: t.inventory, icon: 'fa-boxes-stacked', roles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.PACKAGING, UserRole.BRAND_OWNER] },
    { id: 'customers', label: t.customers, icon: 'fa-users', roles: [UserRole.ADMIN, UserRole.SUPPORT, UserRole.BRAND_OWNER] },
    { id: 'shipping', label: t.shipping, icon: 'fa-truck-fast', roles: [UserRole.ADMIN, UserRole.OPERATIONS, UserRole.BRAND_OWNER] },
    { id: 'reports', label: t.reports, icon: 'fa-file-invoice-dollar', roles: [UserRole.ADMIN, UserRole.BRAND_OWNER] },
    { id: 'settings', label: t.settings, icon: 'fa-cog', roles: [UserRole.ADMIN] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className={`min-h-screen flex bg-gray-50 ${lang === 'ar' ? 'font-sans' : ''}`}>
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col fixed h-full z-20 ${lang === 'ar' ? 'right-0' : 'left-0'}`}>
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <i className="fas fa-shipping-fast text-blue-500"></i>
              <span className="text-xl font-black tracking-tight text-white">{t.brandName}</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <i className={`fas ${isSidebarOpen ? (lang === 'ar' ? 'fa-angle-right' : 'fa-angle-left') : 'fa-bars'}`}></i>
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${
                activePage === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${item.icon} w-6 text-center text-lg`}></i>
              {isSidebarOpen && <span className={`font-semibold text-sm ${lang === 'ar' ? 'mr-3' : 'ml-3'}`}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
           <button onClick={toggleLanguage} className="w-full text-[10px] uppercase tracking-tighter text-slate-500 hover:text-blue-400 mb-4 font-bold">
              {lang === 'en' ? 'العربية' : 'English'}
           </button>
           <div className="flex items-center p-2 rounded-xl bg-slate-800/50 border border-slate-700">
             <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">{user.name.charAt(0)}</div>
             {isSidebarOpen && (
               <div className={`${lang === 'ar' ? 'mr-3' : 'ml-3'} overflow-hidden`}>
                 <p className="text-xs font-bold truncate text-white">{user.name}</p>
                 <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wide">{user.role === UserRole.BRAND_OWNER ? `Owner: ${user.brandId}` : user.role}</p>
               </div>
             )}
           </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? (lang === 'ar' ? 'mr-64' : 'ml-64') : (lang === 'ar' ? 'mr-20' : 'ml-20')} p-8`}>
        <header className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">{user.dept || (user.role === UserRole.BRAND_OWNER ? user.brandId : 'System')}</span>
                 </div>
                 <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
                   {navItems.find(i => i.id === activePage)?.label || activePage}
                 </h1>
              </div>
              {brandFilter && (
                <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-lg animate-in zoom-in-90 duration-300">
                   <i className="fas fa-tag text-xs opacity-70"></i>
                   <span className="text-xs font-black uppercase tracking-widest">{brandFilter}</span>
                   {user.role !== UserRole.BRAND_OWNER && (
                     <button onClick={onClearBrandFilter} className="ml-2 hover:bg-white/20 rounded-full w-5 h-5 flex items-center justify-center">
                        <i className="fas fa-times text-[8px]"></i>
                     </button>
                   )}
                </div>
              )}
           </div>
           <div className="flex items-center gap-4">
              <button onClick={onLogout} className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-red-600 transition-all flex items-center gap-2">
                 <i className="fas fa-power-off"></i>
                 <span className="hidden sm:inline">{t.logout}</span>
              </button>
           </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;
