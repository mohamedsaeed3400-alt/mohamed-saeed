
import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { STATUS_COLORS } from '../constants';

interface CustomersProps {
  lang: Language;
  customers: any[];
  orders: any[];
}

const Customers: React.FC<CustomersProps> = ({ lang, customers, orders }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const t = translations[lang];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Customer Sidebar List */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
        <div className="p-6 border-b border-slate-50 font-black text-slate-800 uppercase text-xs tracking-widest flex justify-between items-center">
          <span>Customer Registry</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-400">{customers.length}</span>
        </div>
        <div className="divide-y divide-slate-50 max-h-[70vh] overflow-y-auto">
           {customers.map(c => (
             <button 
               key={c.id} 
               onClick={() => setSelectedCustomer(c)}
               className={`w-full p-5 flex items-center gap-4 transition-all hover:bg-blue-50/50 group ${selectedCustomer?.id === c.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
             >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 uppercase group-hover:bg-white transition-colors">{c.name[0]}</div>
                <div className="text-left flex-1">
                   <p className="text-sm font-bold text-slate-800">{c.name}</p>
                   <p className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{c.email}</p>
                </div>
                <i className={`fas fa-chevron-right text-[10px] transition-transform ${selectedCustomer?.id === c.id ? 'translate-x-1 text-blue-600' : 'text-slate-300'}`}></i>
             </button>
           ))}
        </div>
      </div>

      {/* Customer Details Content */}
      <div className="lg:col-span-2">
         {selectedCustomer ? (
           <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Profile Header */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-slate-200 uppercase">
                      {selectedCustomer.name[0]}
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{selectedCustomer.name}</h2>
                       <div className="flex flex-col gap-1">
                          <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
                            <i className="fas fa-envelope text-[10px]"></i> {selectedCustomer.email}
                          </p>
                          <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1">ID: {selectedCustomer.id}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="text-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Spent</p>
                       <p className="text-xl font-black text-slate-900">${selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="text-center px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders</p>
                       <p className="text-xl font-black text-slate-900">{orders.filter(o => o.customer === selectedCustomer.name).length}</p>
                    </div>
                 </div>
              </div>

              {/* Purchase History Ledger */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-black text-slate-900 tracking-tight">Full Purchase History</h3>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                          <tr>
                             <th className="px-8 py-5">Order ID</th>
                             <th className="px-8 py-5">Date Placed</th>
                             <th className="px-8 py-5">Value</th>
                             <th className="px-8 py-5">Status</th>
                             <th className="px-8 py-5 text-right">Receipt</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {orders.filter(o => o.customer === selectedCustomer.name).length > 0 ? (
                            orders.filter(o => o.customer === selectedCustomer.name).map(o => (
                              <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-black">
                                        #
                                      </div>
                                      <p className="font-black text-slate-900 text-sm tracking-tighter">{o.id}</p>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <p className="text-xs font-bold text-slate-500">{o.created}</p>
                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{o.brand}</p>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className="text-sm font-black text-slate-900">${o.total.toFixed(2)}</span>
                                 </td>
                                 <td className="px-8 py-6">
                                    <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] border shadow-sm ${STATUS_COLORS[o.status]} border-transparent`}>
                                       {t.status[o.status] || o.status}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <button className="text-slate-300 hover:text-blue-600 transition-colors">
                                      <i className="fas fa-file-invoice text-sm"></i>
                                    </button>
                                 </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-20 text-center">
                                 <div className="flex flex-col items-center justify-center opacity-20">
                                    <i className="fas fa-ghost text-4xl mb-3"></i>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No transaction history found</p>
                                 </div>
                              </td>
                            </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Internal Notes Placeholder */}
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 border-dashed">
                 <div className="flex items-center gap-3 mb-4 text-slate-400">
                    <i className="fas fa-sticky-note text-sm"></i>
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Operations Support Notes</h4>
                 </div>
                 <p className="text-xs text-slate-400 font-medium italic">No internal follow-up notes recorded for this customer account. This space is used for packaging preferences or delivery instructions.</p>
              </div>
           </div>
         ) : (
           <div className="bg-white rounded-[3.5rem] p-32 border-2 border-slate-100 border-dashed flex flex-col items-center justify-center text-slate-300 text-center">
              <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 animate-pulse">
                <i className="fas fa-user-shield text-4xl opacity-20"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Customer Identity Terminal</h3>
              <p className="text-sm font-medium text-slate-400 max-w-xs">Select a profile from the registry to inspect lifecycle value and historical fulfillment logs.</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default Customers;
