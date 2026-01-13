
import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { OrderStatus, UserRole } from '../types';

interface InventoryProps {
  lang: Language;
  items: any[];
  onUpdateStock: (id: string, stock: number) => void;
  orders: any[];
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  userRole: UserRole;
}

const Inventory: React.FC<InventoryProps> = ({ lang, items, onUpdateStock, orders, onUpdateOrderStatus, userRole }) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'PACKAGING' | 'RECEIPTS'>('STOCK');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const t = translations[lang];

  // أصحاب العلامات التجارية لديهم وضع القراءة فقط، بينما المستودعات والعمليات لديهم صلاحية التعديل
  const isReadOnly = userRole === UserRole.BRAND_OWNER;
  const canManage = userRole === UserRole.PACKAGING || userRole === UserRole.ADMIN || userRole === UserRole.OPERATIONS;

  const ordersAwaitingPack = orders.filter(o => o.status === OrderStatus.NEW || o.status === OrderStatus.PACKAGING);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto whitespace-nowrap">
        <button onClick={() => setActiveTab('STOCK')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'STOCK' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Stock Levels</button>
        <button onClick={() => setActiveTab('PACKAGING')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'PACKAGING' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Packaging Queue ({ordersAwaitingPack.length})</button>
        {canManage && <button onClick={() => setActiveTab('RECEIPTS')} className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'RECEIPTS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Inbound Logistics</button>}
      </div>

      {activeTab === 'STOCK' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
             <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest">Master Inventory</h2>
             {canManage && <button onClick={() => setShowReceiptModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100"><i className="fas fa-plus mr-2"></i> Receive Items</button>}
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Item & SKU</th>
                <th className="px-8 py-4">Brand</th>
                <th className="px-8 py-4">Available</th>
                {canManage && <th className="px-8 py-4">Quick Audit</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{item.sku}</p>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-blue-600 uppercase">{item.brand}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${item.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {item.stock} Units
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <button onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-500 hover:text-white transition-all font-black">-</button>
                        <button onClick={() => onUpdateStock(item.id, item.stock + 1)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all font-black">+</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'PACKAGING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {ordersAwaitingPack.length === 0 ? (
             <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase text-xs">Queue Clear</div>
           ) : (
             ordersAwaitingPack.map(o => (
               <div key={o.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between mb-4">
                     <span className="text-xs font-black text-blue-600">{o.id}</span>
                     <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded uppercase">{o.brand}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-6">{o.customer}</p>
                  {canManage && (
                    <button onClick={() => onUpdateOrderStatus(o.id, OrderStatus.PACKED)} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                      Confirm Packaged
                    </button>
                  )}
               </div>
             ))
           )}
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
              <h2 className="text-xl font-black mb-6">Warehouse Receipt</h2>
              <p className="text-sm text-slate-400 mb-8 font-medium italic">Simulating physical stock check-in process.</p>
              <button onClick={() => setShowReceiptModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Close Record</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
