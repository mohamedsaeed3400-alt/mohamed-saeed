
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS } from '../constants';
import { translations, Language } from '../translations';
import { OrderStatus, UserRole } from '../types';

interface DashboardProps {
  lang: Language;
  orders: any[];
  inventory: any[];
  brands: any[];
  onBrandClick?: (brand: any) => void;
  userRole: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ lang, orders, inventory, brands, onBrandClick, userRole }) => {
  const t = translations[lang];
  const isBrandOwner = userRole === UserRole.BRAND_OWNER;
  
  const pendingPackCount = orders.filter(o => o.status === OrderStatus.NEW || o.status === OrderStatus.PACKAGING).length;
  const inTransitCount = orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.PACKED).length;
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
  const lowStockCount = inventory.filter(i => i.stock < 10).length;

  // إحصائيات مخصصة للعلامة التجارية
  const brandStats = [
    { label: isBrandOwner ? (lang === 'ar' ? "إجمالي الطلبات" : "Total Orders") : t.stats.todayOrders, val: orders.length, icon: "fa-shopping-basket", color: "blue" },
    { label: isBrandOwner ? (lang === 'ar' ? "قيد الشحن" : "In Transit") : t.stats.pendingPack, val: inTransitCount, icon: "fa-truck-fast", color: "orange" },
    { label: isBrandOwner ? (lang === 'ar' ? "الرصيد المستحق" : "Current Balance") : "Active Brands", val: isBrandOwner ? `$${totalRevenue.toLocaleString()}` : brands.length, icon: "fa-wallet", color: "emerald" },
    { label: "Low Stock Items", val: lowStockCount, icon: "fa-exclamation-triangle", color: "red" },
  ];

  const chartData = [
    { name: lang === 'en' ? 'Sun' : 'أحد', orders: 40 },
    { name: lang === 'en' ? 'Mon' : 'اثنين', orders: 30 },
    { name: lang === 'en' ? 'Tue' : 'ثلاثاء', orders: 20 },
    { name: lang === 'en' ? 'Wed' : 'أربعاء', orders: 27 },
    { name: lang === 'en' ? 'Thu' : 'خميس', orders: orders.length + 5 },
    { name: lang === 'en' ? 'Fri' : 'جمعة', orders: orders.length + 2 },
    { name: lang === 'en' ? 'Sat' : 'سبت', orders: orders.length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {brandStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 text-xl mb-4`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-3xl font-black mt-1 text-slate-800 tracking-tight">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${isBrandOwner ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white p-8 rounded-3xl border border-slate-100 shadow-sm`}>
          <h3 className="font-black text-slate-800 mb-6 text-lg">
            {isBrandOwner ? (lang === 'ar' ? "مخطط نمو المبيعات" : "Sales Growth Chart") : t.performance}
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} orientation={lang === 'ar' ? 'right' : 'left'} />
                {/* Fix: removed invalid 'shadow' property from contentStyle */}
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="orders" fill={isBrandOwner ? "#10b981" : "#2563eb"} radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {!isBrandOwner && (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
             <h3 className="font-black text-slate-800 mb-6 text-lg">{t.topBrands}</h3>
             <div className="space-y-4">
               {brands.slice(0, 5).map((brand, i) => (
                 <div 
                  key={brand.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all cursor-pointer group" 
                  onClick={() => onBrandClick?.(brand)}
                >
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-black text-sm group-hover:scale-110 transition-transform uppercase" style={{ color: brand.color }}>{brand.name[0]}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{brand.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{brand.category}</p>
                      </div>
                   </div>
                   <i className="fas fa-chevron-right text-slate-300 text-xs group-hover:text-blue-500 transition-colors"></i>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
