
import React, { useState, useMemo } from 'react';
import { Language, translations } from '../translations';
import { OrderStatus, UserRole } from '../types';
import { STATUS_COLORS } from '../constants';

interface ShippingProps {
  lang: Language;
  orders: any[];
  onNavigateToCustomer: (name: string) => void;
  onUpdateStatus?: (id: string, status: OrderStatus) => void;
  userRole: UserRole;
}

const Shipping: React.FC<ShippingProps> = ({ lang, orders, onNavigateToCustomer, onUpdateStatus, userRole }) => {
  const t = translations[lang];
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingItems, setViewingItems] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'OUTBOUND' | 'RETURNS'>('OUTBOUND');
  
  const isReadOnly = userRole === UserRole.BRAND_OWNER;

  // Filter for orders that are in a shipping-relevant stage
  const shippingQueue = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           o.customer.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeSubTab === 'RETURNS') {
        return (o.status === OrderStatus.RETURNED || o.status === OrderStatus.EXCHANGE) && matchesSearch;
      }
      
      return (o.status === OrderStatus.PACKED || 
              o.status === OrderStatus.SHIPPED || 
              o.status === OrderStatus.DELIVERED) && matchesSearch;
    });
  }, [orders, searchQuery, activeSubTab]);

  const toggleSelect = (id: string) => {
    if (isReadOnly) return;
    setSelectedShipments(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (e.target.checked) {
      setSelectedShipments(shippingQueue.map(o => o.id));
    } else {
      setSelectedShipments([]);
    }
  };

  const handleBulkStatusChange = (status: OrderStatus) => {
    if (onUpdateStatus && !isReadOnly) {
      selectedShipments.forEach(id => onUpdateStatus(id, status));
      setSelectedShipments([]);
    }
  };

  const downloadManifest = () => {
    const headers = ['Order ID', 'Brand', 'Customer', 'Carrier', 'Tracking', 'Status', 'Date'];
    const rows = shippingQueue.map(o => [
      o.id,
      o.brand,
      o.customer,
      o.carrier || 'Pending',
      o.tracking || 'N/A',
      o.status,
      o.created
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fulfillo_${activeSubTab.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Sub-Navigation */}
      <div className="flex gap-6 border-b border-slate-200">
        <button 
          onClick={() => { setActiveSubTab('OUTBOUND'); setSelectedShipments([]); }}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'OUTBOUND' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
        >
          Outbound Logistics
        </button>
        <button 
          onClick={() => { setActiveSubTab('RETURNS'); setSelectedShipments([]); }}
          className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'RETURNS' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400'}`}
        >
          Returns & Exchanges ({orders.filter(o => o.status === OrderStatus.RETURNED || o.status === OrderStatus.EXCHANGE).length})
        </button>
      </div>

      {/* Search and Export Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder={activeSubTab === 'OUTBOUND' ? "Filter by Order ID or Customer Name..." : "Filter returns by Name/ID..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>
        <button 
          onClick={downloadManifest}
          className="bg-slate-900 text-white p-4 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
        >
          <i className="fas fa-file-csv text-lg"></i> Export {activeSubTab === 'OUTBOUND' ? 'Manifest' : 'Returns List'}
        </button>
      </div>

      {/* Action Bar (Visible when selected - Only for Ops/Admin) */}
      {!isReadOnly && selectedShipments.length > 0 && (
        <div className={`${activeSubTab === 'OUTBOUND' ? 'bg-blue-600' : 'bg-orange-600'} p-4 rounded-2xl flex items-center justify-between text-white shadow-lg animate-in slide-in-from-top-4`}>
          <div className="flex items-center gap-4 px-4">
            <span className="text-xs font-black uppercase tracking-widest">{selectedShipments.length} Items Selected</span>
          </div>
          <div className="flex gap-2">
            {activeSubTab === 'OUTBOUND' ? (
              <>
                <button onClick={() => handleBulkStatusChange(OrderStatus.SHIPPED)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Mark Shipped</button>
                <button onClick={() => handleBulkStatusChange(OrderStatus.DELIVERED)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Mark Delivered</button>
              </>
            ) : (
              <>
                <button onClick={() => handleBulkStatusChange(OrderStatus.RETURNED)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Process Return</button>
                <button onClick={() => handleBulkStatusChange(OrderStatus.EXCHANGE)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Approve Exchange</button>
              </>
            )}
            <button onClick={() => setSelectedShipments([])} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"><i className="fas fa-times"></i></button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                <tr>
                  {!isReadOnly && (
                    <th className="px-8 py-5 w-10">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedShipments.length === shippingQueue.length && shippingQueue.length > 0}
                        className="w-4 h-4 rounded border-slate-200 text-blue-600" 
                      />
                    </th>
                  )}
                  <th className="px-8 py-5">Order & Brand</th>
                  <th className="px-8 py-5">{activeSubTab === 'OUTBOUND' ? 'Carrier Details' : 'Reverse Tracking'}</th>
                  <th className="px-8 py-5">Activity Date</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {shippingQueue.length === 0 ? (
                  <tr>
                    <td colSpan={isReadOnly ? 5 : 6} className="p-24 text-center">
                       <div className="flex flex-col items-center opacity-20">
                          <i className={`fas ${activeSubTab === 'OUTBOUND' ? 'fa-truck' : 'fa-reply-all'} text-5xl mb-4`}></i>
                          <p className="text-xs font-black uppercase tracking-widest">No matching items in this queue</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  shippingQueue.map(o => (
                    <tr key={o.id} className={`hover:bg-slate-50/50 transition-all group ${selectedShipments.includes(o.id) ? 'bg-blue-50/50' : ''}`}>
                      {!isReadOnly && (
                        <td className="px-8 py-6">
                          <input 
                            type="checkbox" 
                            checked={selectedShipments.includes(o.id)}
                            onChange={() => toggleSelect(o.id)}
                            className="w-4 h-4 rounded border-slate-200 text-blue-600" 
                          />
                        </td>
                      )}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <button onClick={() => setViewingItems(o)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase hover:bg-blue-600 hover:text-white transition-all">
                             {o.brand[0]}
                           </button>
                           <div>
                              <p className="text-sm font-black text-slate-900 leading-none">{o.id}</p>
                              <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">{o.brand}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${o.status === OrderStatus.DELIVERED ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                           <div>
                              <p className="text-xs font-black text-slate-700 uppercase">{o.carrier || 'SMSA'}</p>
                              <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">{o.tracking || 'PENDING'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-slate-600">{o.created}</td>
                      <td className="px-8 py-6">
                        <button onClick={() => onNavigateToCustomer(o.customer)} className="text-left group">
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{o.customer}</p>
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-between">
                           <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[o.status]}`}>
                              {t.status[o.status] || o.status}
                           </span>
                           {!isReadOnly && (
                            <div className="relative group/menu">
                                <button className="text-slate-300 hover:text-slate-600 p-2"><i className="fas fa-ellipsis-v"></i></button>
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-2 hidden group-hover/menu:block">
                                  {activeSubTab === 'OUTBOUND' ? (
                                    <>
                                      <button onClick={() => onUpdateStatus?.(o.id, OrderStatus.RETURNED)} className="w-full text-left px-4 py-2 text-[10px] font-black text-red-600 hover:bg-red-50 uppercase">Initiate Return</button>
                                      <button onClick={() => onUpdateStatus?.(o.id, OrderStatus.EXCHANGE)} className="w-full text-left px-4 py-2 text-[10px] font-black text-orange-600 hover:bg-orange-50 uppercase">Initiate Exchange</button>
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => onUpdateStatus?.(o.id, OrderStatus.DELIVERED)} className="w-full text-left px-4 py-2 text-[10px] font-black text-green-600 hover:bg-green-50 uppercase">Item Received back</button>
                                      <button onClick={() => onUpdateStatus?.(o.id, OrderStatus.NEW)} className="w-full text-left px-4 py-2 text-[10px] font-black text-blue-600 hover:bg-blue-50 uppercase">Restock & Re-issue</button>
                                    </>
                                  )}
                                </div>
                            </div>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
         </div>
      </div>

      {/* Item Modal */}
      {viewingItems && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-xl font-black">{viewingItems.id} Inspection</h3>
                <button onClick={() => setViewingItems(null)}><i className="fas fa-times"></i></button>
             </div>
             <div className="p-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 mb-6">
                   {activeSubTab === 'RETURNS' ? 'Note: Inspect item for damage before restock processing.' : 'Standard packaging verified.'}
                </div>
                <div className="space-y-2">
                   {['Order Items Bundle', 'Fulfillo Premium Box'].map((item, i) => (
                     <div key={i} className="flex justify-between p-3 bg-white border border-slate-100 rounded-xl">
                        <span className="text-xs font-bold text-slate-700">{item}</span>
                        <i className="fas fa-check text-emerald-500"></i>
                     </div>
                   ))}
                </div>
                <button onClick={() => setViewingItems(null)} className="w-full py-4 mt-8 bg-slate-900 text-white font-black uppercase rounded-2xl">Close Audit</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;
