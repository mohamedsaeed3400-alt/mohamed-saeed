
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import Inventory from './components/Inventory';
import Finance from './components/Finance';
import Customers from './components/Customers';
import Shipping from './components/Shipping';
import Brands from './components/Brands';
import Settings from './components/Settings';
import { UserRole, OrderStatus } from './types';
import { translations, Language } from './translations';

const INITIAL_REGISTRY = [
  { email: 'admin@fulfillo.com', password: 'admin-unique-7721', name: 'Majed Al-Otaibi', role: UserRole.ADMIN, dept: 'Headquarters', active: true },
  { email: 'ops@fulfillo.com', password: 'ops-secure-991', name: 'Sarah Miller', role: UserRole.OPERATIONS, dept: 'Ops Control', active: true },
  { email: 'pack@fulfillo.com', password: 'warehouse-key-5', name: 'John Ware', role: UserRole.PACKAGING, dept: 'Warehouse A', active: true },
  { email: 'glowskin@brand.com', password: 'glow-brand-secure', name: 'Lina Glow', role: UserRole.BRAND_OWNER, dept: 'GlowSkin', brandId: 'GlowSkin', active: true },
];

const INITIAL_INQUIRIES = [
  { id: 'INQ-001', brand: 'EcoThreads', email: 'hello@ecothreads.co', phone: '+966 54 333 2222', shipping: 'Aramex', products: 'Sustainable apparel.', status: 'NEW' },
];

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [lang, setLang] = useState<Language>('ar');
  const [user, setUser] = useState<any>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentView, setCurrentView] = useState<'ABOUT' | 'JOIN' | 'LOGIN'>('ABOUT');
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [pendingOnboardingData, setPendingOnboardingData] = useState<any>(null);
  const [userRegistry, setUserRegistry] = useState(INITIAL_REGISTRY);
  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);

  const [brands, setBrands] = useState([
    { id: 'b1', name: 'GlowSkin', category: 'Cosmetics', color: '#2563eb', previousBalance: 12500.00, adminEmail: 'support@glowskin.me', adminPhone: '+966 50 111 2222', description: 'Premium organic skin repair serums.', brandPassword: 'GLOW-ACCESS-88', integrated: true },
    { id: 'b2', name: 'TechGear', category: 'Electronics', color: '#f59e0b', previousBalance: 4200.50, adminEmail: 'ops@techgear.com', adminPhone: '+966 55 999 8888', description: 'Mechanical keyboards.', brandPassword: 'TECH-SECRET-99', integrated: false },
  ]);

  const [orders, setOrders] = useState([
    { id: '#ORD-7721', brand: 'GlowSkin', customer: 'Ahmed Ali', status: OrderStatus.NEW, total: 120.00, created: '2023-10-25', source: 'Shopify', carrier: 'SMSA Express' },
    { id: '#ORD-7720', brand: 'TechGear', customer: 'Sarah Connor', status: OrderStatus.PACKAGING, total: 45.50, created: '2023-10-25', source: 'Manual', carrier: 'DHL' },
  ]);

  const [inventory, setInventory] = useState([
    { id: '1', name: 'Skin Repair Serum', sku: 'GS-001', stock: 45, price: 25.00, brand: 'GlowSkin' },
    { id: '2', name: 'Tech Keyboard Pro', sku: 'TG-99', stock: 12, price: 89.00, brand: 'TechGear' },
  ]);

  const [customers, setCustomers] = useState([
    { id: 'C-1', name: 'Ahmed Ali', email: 'ahmed@example.com', orders: 1, totalSpent: 120.00, lastOrder: '2023-10-25' },
  ]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAuthenticating(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    setTimeout(() => {
      const authUser = userRegistry.find(u => u.email === email && u.password === password);
      if (authUser && authUser.active) {
        setUser(authUser);
        if (authUser.role === UserRole.PACKAGING) setActivePage('inventory');
        else setActivePage('dashboard');
      } else {
        setLoginError(lang === 'ar' ? 'بيانات الدخول غير صحيحة أو الحساب معلق' : 'Invalid credentials or account suspended.');
      }
      setIsAuthenticating(false);
    }, 800);
  };

  const handleJoinRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInquiry = {
      id: `INQ-${Math.floor(Math.random() * 9000 + 1000)}`,
      brand: formData.get('brandName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      shipping: formData.get('shipping') as string,
      products: formData.get('products') as string,
      status: 'NEW'
    };
    setInquiries(prev => [newInquiry, ...prev]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setCurrentView('ABOUT');
    }, 3000);
  };

  const renderContent = () => {
    if (!user) return null;
    const filteredOrders = user.role === UserRole.BRAND_OWNER ? orders.filter(o => o.brand === user.brandId) : (brandFilter ? orders.filter(o => o.brand === brandFilter) : orders);
    const filteredInventory = user.role === UserRole.BRAND_OWNER ? inventory.filter(i => i.brand === user.brandId) : (brandFilter ? inventory.filter(i => i.brand === brandFilter) : inventory);

    switch (activePage) {
      case 'dashboard':
        return <Dashboard lang={lang} orders={filteredOrders} inventory={filteredInventory} brands={brands} onBrandClick={(b) => setBrandFilter(b.name)} userRole={user.role} />;
      case 'orders':
        return <Orders lang={lang} orders={filteredOrders} inventory={filteredInventory} customers={customers} brands={brands} onUpdateStatus={(id, s) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: s} : o))} onAddOrder={(o) => setOrders(prev => [o, ...prev])} userRole={user.role} />;
      case 'inventory':
        return <Inventory lang={lang} items={filteredInventory} onUpdateStock={(id, s) => setInventory(prev => prev.map(i => i.id === id ? {...i, stock: s} : i))} orders={filteredOrders} onUpdateOrderStatus={(id, s) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: s} : o))} userRole={user.role} />;
      case 'reports':
        return <Finance lang={lang} orders={filteredOrders} brands={brands} onReconcile={(bn, a) => setBrands(prev => prev.map(b => b.name === bn ? {...b, previousBalance: (b.previousBalance || 0) + a} : b))} userRole={user.role} />;
      case 'customers':
        return <Customers lang={lang} customers={customers} orders={filteredOrders} />;
      case 'shipping':
        return <Shipping lang={lang} orders={filteredOrders} onNavigateToCustomer={() => setActivePage('customers')} onUpdateStatus={(id, s) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: s} : o))} userRole={user.role} />;
      case 'brands':
        return <Brands lang={lang} orders={orders} brands={brands} onAddBrand={(b) => setBrands(prev => [...prev, {id: `b${prev.length + 1}`, ...b}])} onExploreBrand={(n) => { setBrandFilter(n); setActivePage('dashboard'); }} userRole={user.role} onboardingData={pendingOnboardingData} onCancelOnboarding={() => setPendingOnboardingData(null)} onDeleteBrand={(id) => setBrands(prev => prev.filter(b => b.id !== id))} />;
      case 'settings':
        return <Settings 
          lang={lang} 
          user={user} 
          userRegistry={userRegistry} 
          brands={brands} 
          inquiries={inquiries} 
          onRegisterUser={(u) => setUserRegistry(prev => [...prev, {...u, active: true}])} 
          onUpdateUser={(e, d) => setUserRegistry(prev => prev.map(u => u.email === e ? {...u, ...d} : u))} 
          onUpdateInquiryStatus={(id, s) => setInquiries(prev => prev.map(i => i.id === id ? {...i, status: s} : i))} 
          onApproveInquiry={(inq) => { setPendingOnboardingData(inq); setActivePage('brands'); }} 
          onToggleUserStatus={(e) => setUserRegistry(prev => prev.map(u => u.email === e ? {...u, active: !u.active} : u))} 
          onUpdateBrandIntegration={(id, s) => setBrands(prev => prev.map(b => b.id === id ? {...b, integrated: s} : b))} 
        />;
      default:
        return <Dashboard lang={lang} orders={filteredOrders} inventory={filteredInventory} brands={brands} userRole={user.role} />;
    }
  };

  const effectiveBrandFilter = user?.role === UserRole.BRAND_OWNER ? user.brandId : brandFilter;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-700">
          
          {/* Left Side: Professional Brand Presence */}
          <div className="bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-12">
                   <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                      <i className="fas fa-shipping-fast text-lg"></i>
                   </div>
                   <h1 className="text-3xl font-black tracking-tighter uppercase">FULFILLO<span className="text-blue-500">.</span></h1>
                </div>

                <div className="space-y-6">
                   <h2 className="text-4xl font-black leading-tight tracking-tight">
                      {lang === 'ar' ? 'حلول ذكية لنمو علامتك التجارية' : 'Smart Solutions for Brand Growth'}
                   </h2>
                   <p className="text-slate-400 text-sm leading-relaxed font-medium">
                      {lang === 'ar' 
                        ? 'انضم إلى شبكة الموردين والشركاء الأكثر نمواً في المنطقة. نحن نتكفل بالتخزين والتغليف والشحن لتتفرغ أنت للإبداع.' 
                        : 'Join the fastest growing network of brands and partners. We handle warehousing, packaging, and shipping while you focus on creativity.'}
                   </p>
                </div>
             </div>

             <div className="relative z-10 grid grid-cols-2 gap-4 mt-12">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <p className="text-2xl font-black text-blue-500">24h</p>
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{lang === 'ar' ? 'متوسط سرعة التجهيز' : 'Avg. Dispatch Time'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                   <p className="text-2xl font-black text-blue-500">99.9%</p>
                   <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{lang === 'ar' ? 'دقة العمليات' : 'Ops Accuracy'}</p>
                </div>
             </div>
             
             {/* Abstract background pattern for depth */}
             <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
                <i className="fas fa-boxes-stacked text-[20rem]"></i>
             </div>
          </div>

          {/* Right Side: Interaction Area */}
          <div className="p-12 flex flex-col justify-center relative bg-white">
            {formSuccess && (
              <div className="absolute inset-0 bg-emerald-500 z-50 flex flex-col items-center justify-center text-white p-8 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-check text-4xl"></i>
                </div>
                <h2 className="text-3xl font-black mb-2">{lang === 'ar' ? 'شكراً لاهتمامك' : 'Thank You'}</h2>
                <p className="font-bold opacity-90">{lang === 'ar' ? 'تم استلام طلبك بنجاح، سيتواصل معك فريقنا قريباً جداً.' : 'Your request was received. Our team will contact you very soon.'}</p>
              </div>
            )}

            {currentView === 'ABOUT' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{lang === 'ar' ? 'ابدأ رحلتك معنا' : 'Start Your Journey'}</h3>
                    <p className="text-sm text-slate-400 font-medium">{lang === 'ar' ? 'نظام متكامل لإدارة العمليات والشركاء' : 'Integrated system for Ops and Partners'}</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 items-center hover:bg-slate-100 transition-colors cursor-default">
                       <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shadow-inner">01</div>
                       <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{lang === 'ar' ? 'طلب انضمام' : 'Join Request'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'سجل بيانات علامتك التجارية للربط التقني' : 'Submit your brand for tech integration'}</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 items-center hover:bg-slate-100 transition-colors cursor-default">
                       <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shadow-inner">02</div>
                       <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{lang === 'ar' ? 'لوحة تحكم ذكية' : 'Smart Dashboard'}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'راقب مخزونك وطلباتك من أي مكان' : 'Monitor stock and orders from anywhere'}</p>
                       </div>
                    </div>
                 </div>
                 <div className="pt-4 space-y-3">
                    <button onClick={() => setCurrentView('JOIN')} className="group w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                       {lang === 'ar' ? 'تقديم طلب انضمام' : 'Apply to Join'}
                       <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                    </button>
                    <button onClick={() => setCurrentView('LOGIN')} className="w-full bg-slate-100 text-slate-600 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest">
                       {lang === 'ar' ? 'دخول الشركاء والموظفين' : 'Staff & Partner Login'}
                    </button>
                    <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="w-full text-[10px] font-black uppercase text-slate-300 tracking-widest mt-6 hover:text-blue-500 transition-colors">
                       {lang === 'ar' ? 'Switch to English' : 'تحويل للغة العربية'}
                    </button>
                 </div>
              </div>
            )}

            {currentView === 'JOIN' && (
              <form onSubmit={handleJoinRequest} className="space-y-4 animate-in slide-in-from-right-4">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{lang === 'ar' ? 'انضم لشركائنا' : 'Join Our Partners'}</h3>
                  <p className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'أدخل تفاصيل علامتك التجارية لنبدأ الربط' : 'Enter brand details to start integration'}</p>
                </div>
                <div className="space-y-3">
                  <input name="brandName" type="text" required placeholder={lang === 'ar' ? 'اسم العلامة التجارية' : 'Brand Name'} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                  <input name="email" type="email" required placeholder={lang === 'ar' ? 'البريد الإلكتروني للعمل' : 'Work Email'} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                  <input name="phone" type="tel" required placeholder={lang === 'ar' ? 'رقم الهاتف (WhatsApp)' : 'Phone (WhatsApp)'} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                  <input name="shipping" type="text" required placeholder={lang === 'ar' ? 'ناقل الشحن الحالي (اختياري)' : 'Current Carrier (Optional)'} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                  <textarea name="products" required placeholder={lang === 'ar' ? 'وصف المنتجات التي تبيعها...' : 'Tell us about your products...'} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-colors h-24 resize-none"></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setCurrentView('ABOUT')} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs tracking-widest hover:text-slate-600">{lang === 'ar' ? 'رجوع' : 'Back'}</button>
                  <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">{lang === 'ar' ? 'إرسال الطلب' : 'Submit Request'}</button>
                </div>
              </form>
            )}

            {currentView === 'LOGIN' && (
              <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-left-4">
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{lang === 'ar' ? 'بوابة الوصول' : 'Access Portal'}</h3>
                  <p className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'سجل دخولك لمتابعة العمليات' : 'Login to monitor operations'}</p>
                </div>
                {loginError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase border border-red-100 animate-shake">{loginError}</div>}
                <div className="space-y-3">
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                    <input name="email" type="email" required placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Work Email'} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="relative">
                    <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                    <input name="password" type="password" required placeholder={lang === 'ar' ? 'مفتاح الأمان' : 'Security Key'} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
                <button type="submit" disabled={isAuthenticating} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                   {isAuthenticating ? (lang === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (lang === 'ar' ? 'دخول آمن' : 'Secure Login')}
                </button>
                <button type="button" onClick={() => setCurrentView('ABOUT')} className="w-full mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors">{lang === 'ar' ? 'العودة للرئيسية' : 'Return to Home'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      lang={lang} 
      toggleLanguage={() => setLang(prev => (prev === 'en' ? 'ar' : 'en'))} 
      onNavigate={setActivePage} 
      activePage={activePage} 
      onLogout={() => setUser(null)} 
      brandFilter={effectiveBrandFilter} 
      onClearBrandFilter={() => user.role !== UserRole.BRAND_OWNER && setBrandFilter(null)}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
