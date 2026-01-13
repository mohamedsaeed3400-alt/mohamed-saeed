
import React, { useState } from 'react';
import { OrderStatus, UserRole } from '../types';
import { STATUS_COLORS } from '../constants';
import { translations, Language } from '../translations';

interface OrdersProps {
  lang: Language;
  orders: any[];
  inventory: any[];
  customers: any[];
  brands: any[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onAddOrder: (order: any) => void;
  userRole: UserRole;
}

const Orders: React.FC<OrdersProps> = ({ lang, orders, inventory, customers, brands, onUpdateStatus, onAddOrder, userRole }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [printManifest, setPrintManifest] = useState<any[] | null>(null);
  const t = translations[lang];

  const isReadOnly = userRole === UserRole.BRAND_OWNER;

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filter === 'ALL' || o.status === filter;
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status: string) => {
    if (status === 'ALL') return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = (status: OrderStatus) => {
    if (isReadOnly) return;
    selectedOrderIds.forEach(id => onUpdateStatus(id, status));
    setSelectedOrderIds([]);
  };

  const handlePrintPolicies = () => {
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    setPrintManifest(selectedOrders);
  };

  const triggerActualPrint = () => {
    window.print();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly) return;
    const formData = new FormData(e.currentTarget);
    const newOrder = {
      id: `#ORD-${Math.floor(Math.random() * 9000 + 1000)}`,
      brand: formData.get('brand') as string,
      customer: formData.get('customerName') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      status: OrderStatus.NEW,
      total: parseFloat(formData.get('price') as string),
      created: new Date().toISOString().split('T')[0],
      source: 'Manual'
    };
    onAddOrder(newOrder);
    setShowModal(false);
  };

  const statusList = ['ALL', ...Object.values(OrderStatus)];

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {/* Search & Global Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 print:hidden">
        <div className="lg:col-span-8 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Search by Order ID, Customer, or Source..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
        {!isReadOnly && (
          <div className="lg:col-span-4">
             <button onClick={() => setShowModal(true)} className="w-full h-full bg-slate-900 text-white px-8 py-3.5 rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
               <i className="fas fa-plus-circle"></i> {t.createOrder}
             </button>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedOrderIds.length > 0 && !isReadOnly && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500 print:hidden">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-8 border border-slate-700 backdrop-blur-md">
            <div className="flex items-center gap-3 border-r border-slate-700 pr-8">
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black">{selectedOrderIds.length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operations</span>
            </div>
            <div className="flex items-center gap-4">
              <select 
                onChange={(e) => handleBulkStatusUpdate(e.target.value as OrderStatus)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-[10px] font-black uppercase outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Status Update</option>
                {Object.values(OrderStatus).map(s => <option key={s} value={s}>{t.status[s]}</option>)}
              </select>
              <button onClick={handlePrintPolicies} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2">
                <i className="fas fa-print"></i> Manifest
              </button>
              <button onClick={() => setSelectedOrderIds([])} className="text-slate-500 hover:text-white transition-colors p-2"><i className="fas fa-times"></i></button>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-2 print:hidden overflow-x-auto no-scrollbar">
         {statusList.map((s) => {
           const isActive = filter === s;
           const count = getStatusCount(s);
           return (
             <button key={s} onClick={() => { setFilter(s); setSelectedOrderIds([]); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}>
               {t.status[s as keyof typeof t.status] || s}
               <span className={`px-1.5 py-0.5 rounded text-[8px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
             </button>
           );
         })}
      </div>

      {/* Main Ledger */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px] print:hidden">
         <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="px-8 py-6 w-10">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0} className="w-4 h-4 rounded border-slate-200 text-blue-600" />
                </th>
                <th className="px-8 py-6">ID / Channel</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Value</th>
                <th className="px-8 py-6">Status</th>
                {!isReadOnly && <th className="px-8 py-6 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-32 text-center text-slate-300 font-black uppercase text-xs">No orders found</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedOrderIds.includes(order.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-8 py-6">
                      <input type="checkbox" checked={selectedOrderIds.includes(order.id)} onChange={() => toggleSelectOrder(order.id)} className="w-4 h-4 rounded border-slate-200 text-blue-600" />
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 text-sm tracking-tighter">{order.id}</p>
                      <span className="text-[9px] font-black uppercase text-slate-400">{order.source}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700">{order.customer}</p>
                      <p className="text-[10px] text-blue-500 font-black uppercase">{order.brand}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900">${order.total.toFixed(2)}</td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border shadow-sm ${STATUS_COLORS[order.status]}`}>
                          {t.status[order.status]}
                       </span>
                    </td>
                    {!isReadOnly && (
                      <td className="px-8 py-6">
                         <div className="flex justify-center gap-2">
                            <button onClick={() => setPrintManifest([order])} title="Print Invoice" className="w-8 h-8 rounded-lg border border-slate-100 text-slate-400 hover:text-blue-600 transition-all"><i className="fas fa-file-invoice"></i></button>
                            {order.status === OrderStatus.DELIVERED && (
                              <div className="relative group/actions">
                                <button className="w-8 h-8 rounded-lg border border-slate-100 text-slate-400 hover:text-orange-500 transition-all"><i className="fas fa-reply-all"></i></button>
                                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white shadow-xl border border-slate-100 rounded-xl py-2 hidden group-hover/actions:block z-50">
                                   <button onClick={() => onUpdateStatus(order.id, OrderStatus.RETURNED)} className="w-full text-left px-4 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 uppercase tracking-widest">Return</button>
                                   <button onClick={() => onUpdateStatus(order.id, OrderStatus.EXCHANGE)} className="w-full text-left px-4 py-2 text-[10px] font-black text-orange-600 hover:bg-orange-50 uppercase tracking-widest">Exchange</button>
                                </div>
                              </div>
                            )}
                         </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
         </table>
      </div>

      {/* Policy Print Preview Modal (Kept for consistency) */}
      {printManifest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col h-[90vh] print:h-auto print:shadow-none print:rounded-none overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-black text-slate-900">Labels & Manifest</h2>
                <div className="flex gap-3">
                   <button onClick={() => setPrintManifest(null)} className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-200">Close</button>
                   <button onClick={triggerActualPrint} className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">Print</button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-slate-50 print:bg-white print:p-0">
                {printManifest.map((order) => (
                  <div key={order.id} className="bg-white border-2 border-slate-200 rounded-[2rem] p-10 print:border-none print:p-0 break-after-page">
                     <div className="flex justify-between mb-10">
                        <h3 className="text-3xl font-black text-slate-900">{order.brand}</h3>
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border-2 border-transparent ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-10">
                        <section>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Recipient</label>
                           <p className="text-xl font-black text-slate-900">{order.customer}</p>
                           <p className="text-sm font-bold text-slate-500 mt-1">{order.city}, KSA</p>
                        </section>
                        <div className="bg-slate-50 rounded-[2rem] p-8">
                           <span className="text-[10px] font-black text-slate-400 uppercase">Fulfillo ID</span>
                           <p className="text-xl font-black text-slate-900">{order.id}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Manual Order Modal (Kept for consistency) */}
      {showModal && !isReadOnly && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name</label>
                     <input name="customerName" type="text" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" />
                  </div>
                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ($)</label>
                     <input name="price" type="number" step="0.01" required className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm font-black text-blue-600" />
                  </div>
               </div>
               <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 text-[10px] font-black text-slate-400 bg-slate-50 rounded-2xl">Discard</button>
                  <button type="submit" className="flex-1 py-5 text-[10px] font-black text-white bg-slate-900 rounded-2xl">Create Order</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
