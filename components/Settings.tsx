
import React, { useState } from 'react';
import { UserRole } from '../types';
import { Language, translations } from '../translations';

interface SettingsProps {
  lang: Language;
  user: any;
  userRegistry: any[];
  brands: any[];
  inquiries: any[];
  onRegisterUser: (newUser: any) => void;
  onUpdateUser: (oldEmail: string, updatedData: any) => void;
  onUpdateInquiryStatus: (id: string, status: string) => void;
  onApproveInquiry: (inquiry: any) => void;
  onToggleUserStatus?: (email: string) => void;
  onUpdateBrandIntegration?: (brandId: string, status: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, user, userRegistry, brands, inquiries, onRegisterUser, onUpdateUser, onUpdateInquiryStatus, onApproveInquiry, onToggleUserStatus, onUpdateBrandIntegration }) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'INTEGRATIONS' | 'INQUIRIES' | 'USERS'>('PROFILE');
  const [revealedEmails, setRevealedEmails] = useState<string[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  
  const isAdmin = user.role === UserRole.ADMIN;
  const isBrandOwner = user.role === UserRole.BRAND_OWNER;

  const currentBrand = brands.find(b => b.name === user.brandId);

  const handleToggleIntegration = (brandId: string, currentStatus: boolean) => {
    onUpdateBrandIntegration?.(brandId, !currentStatus);
  };

  const handleSaveUserUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      name: formData.get('name') as string,
      password: formData.get('password') as string,
    };
    onUpdateUser(editingUser.email, updatedData);
    setEditingUser(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex gap-6 border-b border-slate-200 overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveTab('PROFILE')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PROFILE' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Profile</button>
        <button onClick={() => setActiveTab('INTEGRATIONS')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'INTEGRATIONS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Integrations</button>
        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('INQUIRIES')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'INQUIRIES' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
              Partner Inquiries <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[9px]">{inquiries.filter(i => i.status === 'NEW').length}</span>
            </button>
            <button onClick={() => setActiveTab('USERS')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'USERS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Users Management</button>
          </>
        )}
      </div>

      {activeTab === 'INQUIRIES' && isAdmin && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-black text-slate-900 tracking-tight">Pending Applications</h2>
             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Awaiting Decision</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {inquiries.filter(i => i.status === 'NEW').length === 0 ? (
               <div className="py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                  <i className="fas fa-inbox text-4xl mb-4"></i>
                  <p className="text-xs font-black uppercase">No new applications today</p>
               </div>
             ) : (
               inquiries.filter(i => i.status === 'NEW').map((inq) => (
                 <div key={inq.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                       <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black uppercase">
                                {inq.brand[0]}
                             </div>
                             <div>
                                <h3 className="text-lg font-black text-slate-900">{inq.brand}</h3>
                                <p className="text-xs font-bold text-slate-400">{inq.email}</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                             <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Products</p>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed">{inq.products}</p>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Contact & Carrier</p>
                                <p className="text-xs font-bold text-slate-600">{inq.phone}</p>
                                <p className="text-[10px] text-blue-500 font-black mt-1 uppercase">Using: {inq.shipping}</p>
                             </div>
                          </div>
                       </div>

                       <div className="flex lg:flex-col gap-2 justify-center lg:border-l border-slate-100 lg:pl-6">
                          <button 
                            onClick={() => onApproveInquiry(inq)}
                            className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                          >
                             Approve & Onboard
                          </button>
                          <button 
                            onClick={() => onUpdateInquiryStatus(inq.id, 'REJECTED')}
                            className="flex-1 lg:flex-none px-6 py-3 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                             Reject
                          </button>
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
          
          {/* History Section */}
          {inquiries.filter(i => i.status !== 'NEW').length > 0 && (
            <div className="pt-12">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Past Decisions</h3>
               <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100">
                  <table className="w-full text-left">
                     <thead className="bg-slate-100/50 text-[9px] font-black text-slate-500 uppercase">
                        <tr>
                           <th className="px-6 py-4">Brand</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Date</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {inquiries.filter(i => i.status !== 'NEW').map(inq => (
                           <tr key={inq.id} className="text-xs">
                              <td className="px-6 py-4 font-bold text-slate-600">{inq.brand}</td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-0.5 rounded uppercase text-[8px] font-black ${inq.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {inq.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-slate-400 font-mono">2023-10-25</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'INTEGRATIONS' && (
        <div className="space-y-8 max-w-4xl">
           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
              <div className="relative z-10">
                 <h2 className="text-2xl font-black mb-2">Connect External Stores</h2>
                 <p className="text-slate-400 text-sm max-w-lg font-medium">Link your Shopify, WooCommerce, or Salla store to automatically sync orders to our warehouse the moment they are placed.</p>
              </div>
              <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                 <i className="fas fa-plug text-[8rem]"></i>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                 <div>
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner"><i className="fab fa-shopify"></i></div>
                       <h3 className="font-black text-slate-800">Shopify Direct Sync</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Webhooks & API Integration</p>
                 </div>
                 
                 {isAdmin ? (
                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Brands Status</p>
                       <div className="space-y-2">
                          {brands.map(b => (
                             <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-700">{b.name}</span>
                                <button 
                                  onClick={() => handleToggleIntegration(b.id, b.integrated)}
                                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${b.integrated ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}
                                >
                                   {b.integrated ? 'Active' : 'Disabled'}
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>
                 ) : (
                    <div className="pt-4">
                       {currentBrand?.integrated ? (
                          <div className="space-y-4">
                             <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                                <i className="fas fa-check-circle text-emerald-500"></i>
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Active Sync</span>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sync URL (Webhook)</p>
                                <code className="text-[10px] text-blue-600 font-mono break-all">https://api.fulfillo.com/v1/shopify/sync/{currentBrand?.id}</code>
                             </div>
                          </div>
                       ) : (
                          <button onClick={() => currentBrand && handleToggleIntegration(currentBrand.id, false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Connect Shopify</button>
                       )}
                    </div>
                 )}
              </div>

              <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-60">
                 <i className="fas fa-plus-circle text-2xl text-slate-300 mb-4"></i>
                 <h4 className="font-black text-slate-400 uppercase text-xs tracking-widest">More Platforms</h4>
                 <p className="text-[10px] text-slate-300 font-bold mt-2">WooCommerce, Salla, and Zid support is under active development.</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'USERS' && isAdmin && (
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-white">Security & Access Control</h2>
              <button onClick={() => setShowAddUser(true)} className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Create New User</button>
           </div>
           <div className="bg-slate-800/50 rounded-3xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                 <thead className="bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <tr>
                       <th className="px-8 py-4">User</th>
                       <th className="px-8 py-4">Security Key</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700/50 text-white">
                    {userRegistry.map((regUser) => (
                      <tr key={regUser.email} className="hover:bg-slate-800 transition-colors group">
                         <td className="px-8 py-5">
                            <p className="text-sm font-bold text-white">{regUser.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase">{regUser.role} {regUser.brandId ? `(${regUser.brandId})` : ''}</p>
                         </td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <code className="text-emerald-400 font-mono text-xs">{revealedEmails.includes(regUser.email) ? regUser.password : '••••••••'}</code>
                               <button onClick={() => setRevealedEmails(prev => prev.includes(regUser.email) ? prev.filter(e => e !== regUser.email) : [...prev, regUser.email])} className="text-slate-500 hover:text-white transition-colors">
                                 <i className={`fas ${revealedEmails.includes(regUser.email) ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                               </button>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${regUser.active ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                               {regUser.active ? 'Active' : 'Suspended'}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button 
                                 onClick={() => setEditingUser(regUser)}
                                 className="p-2 rounded-xl text-blue-400 hover:bg-blue-400/10 transition-all"
                               >
                                  <i className="fas fa-edit"></i>
                               </button>
                               <button 
                                 onClick={() => onToggleUserStatus?.(regUser.email)}
                                 disabled={regUser.email === user.email}
                                 className={`p-2 rounded-xl transition-all ${regUser.active ? 'text-red-400 hover:bg-red-400/10' : 'text-green-400 hover:bg-green-400/10'} ${regUser.email === user.email ? 'opacity-20 cursor-not-allowed' : 'opacity-100'}`}
                               >
                                  <i className={`fas ${regUser.active ? 'fa-user-slash' : 'fa-user-check'}`}></i>
                               </button>
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Edit Credentials</h2>
              <form onSubmit={handleSaveUserUpdate} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Display Name</label>
                    <input name="name" type="text" defaultValue={editingUser.name} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Security Password</label>
                    <input name="password" type="text" defaultValue={editingUser.password} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold outline-none focus:border-blue-500" />
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium italic mt-2">Email address cannot be changed for security reasons.</p>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Save Changes</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {activeTab === 'PROFILE' && (
         <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">Your Profile</h2>
            <div className="flex items-center gap-6 mb-8">
               <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black">{user.name[0]}</div>
               <div>
                  <p className="text-lg font-black text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-400 font-medium">{user.email}</p>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Assigned Role</p>
                  <p className="text-sm font-bold text-slate-700">{user.role}</p>
               </div>
               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Department / Brand</p>
                  <p className="text-sm font-bold text-slate-700">{user.dept || user.brandId || 'General Operations'}</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Settings;
