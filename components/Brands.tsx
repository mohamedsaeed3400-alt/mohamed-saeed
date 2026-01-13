
import React, { useState, useEffect } from 'react';
import { Language, translations } from '../translations';
import { UserRole } from '../types';

interface BrandsProps {
  lang: Language;
  orders: any[];
  brands: any[];
  onAddBrand: (brand: any) => void;
  onExploreBrand: (brandName: string) => void;
  userRole: UserRole;
  onboardingData?: any;
  onCancelOnboarding?: () => void;
  onDeleteBrand?: (brandId: string) => void;
}

const Brands: React.FC<BrandsProps> = ({ lang, orders, brands, onAddBrand, onExploreBrand, userRole, onboardingData, onCancelOnboarding, onDeleteBrand }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBrandProfile, setSelectedBrandProfile] = useState<any>(null);
  const [revealSensitive, setRevealSensitive] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<any>(null);
  const t = translations[lang];

  const isAdmin = userRole === UserRole.ADMIN;

  useEffect(() => {
    if (onboardingData) setShowAddModal(true);
  }, [onboardingData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#16a34a', '#d97706'];
    onAddBrand({
      name: formData.get('name') as string,
      category: 'Brand Partner',
      color: colors[brands.length % colors.length],
      adminEmail: formData.get('adminEmail') as string,
      adminPhone: formData.get('adminPhone') as string,
      description: formData.get('description') as string,
      brandPassword: formData.get('brandPassword') as string,
    });
    setShowAddModal(false);
    if (onCancelOnboarding) onCancelOnboarding();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brands.map((brand) => (
          <div key={brand.id} onClick={() => isAdmin && setSelectedBrandProfile(brand)} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
            <div className="h-32 relative p-8 flex justify-between items-start" style={{ backgroundColor: brand.color }}>
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl font-black text-slate-900 uppercase">{brand.name[0]}</div>
              <span className="relative z-10 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest">{brand.category}</span>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-6">{brand.name}</h3>
              <button onClick={(e) => { e.stopPropagation(); onExploreBrand(brand.name); }} className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-xs hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest">Launch Operations</button>
            </div>
          </div>
        ))}
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="rounded-[2.5rem] border-4 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-slate-300 hover:border-blue-400 hover:text-blue-400 transition-all min-h-[300px]">
            <i className="fas fa-plus text-2xl mb-4"></i>
            <span className="font-black uppercase tracking-widest text-xs">Onboard Brand</span>
          </button>
        )}
      </div>

      {selectedBrandProfile && isAdmin && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-10 text-white flex justify-between items-start" style={{ backgroundColor: selectedBrandProfile.color }}>
                <div className="flex items-center gap-5">
                   <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-4xl font-black text-slate-900 uppercase">{selectedBrandProfile.name[0]}</div>
                   <h2 className="text-4xl font-black tracking-tighter leading-none">{selectedBrandProfile.name}</h2>
                </div>
                <button onClick={() => {setSelectedBrandProfile(null); setRevealSensitive(false);}} className="w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center"><i className="fas fa-times"></i></button>
             </div>
             <div className="p-10 space-y-8 overflow-y-auto">
                <section className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100">
                   <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Admin Danger Zone</h4>
                   <p className="text-xs text-red-400 font-medium mb-6">Deleting this brand will permanently remove all associated users, orders, and inventory data from the system.</p>
                   <button onClick={() => setBrandToDelete(selectedBrandProfile)} className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all">Terminate Brand Agreement</button>
                </section>
                <section className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Security Key</p>
                        <code className="text-xl font-mono">{revealSensitive ? selectedBrandProfile.brandPassword : '••••••••'}</code>
                      </div>
                      <button onClick={() => setRevealSensitive(!revealSensitive)} className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center"><i className={`fas ${revealSensitive ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                   </div>
                </section>
             </div>
          </div>
        </div>
      )}

      {brandToDelete && (
        <div className="fixed inset-0 bg-red-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-12 text-center animate-in zoom-in-95">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl"><i className="fas fa-exclamation-triangle"></i></div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Confirm Termination</h2>
              <p className="text-sm text-slate-400 font-medium mb-8">This will irreversibly delete <strong>{brandToDelete.name}</strong> and all linked data. Type "DELETE" to confirm.</p>
              <div className="flex gap-4">
                 <button onClick={() => setBrandToDelete(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</button>
                 <button onClick={() => { onDeleteBrand?.(brandToDelete.id); setBrandToDelete(null); setSelectedBrandProfile(null); }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Confirm Delete</button>
              </div>
           </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">Onboard Brand</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
               <input name="name" type="text" required defaultValue={onboardingData?.brand || ""} placeholder="Brand Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
               <input name="adminEmail" type="email" required defaultValue={onboardingData?.email || ""} placeholder="Admin Email" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" />
               <input name="brandPassword" type="text" required placeholder="Security Key" className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm font-mono font-black text-blue-600 outline-none" />
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Complete Registration</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
