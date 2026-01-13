
import React, { useState } from 'react';
import { Language, translations } from '../translations';
import { OrderStatus, UserRole } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface FinanceProps {
  lang: Language;
  orders: any[];
  brands: any[];
  onReconcile: (brandName: string, amount: number) => void;
  userRole: UserRole;
}

const Finance: React.FC<FinanceProps> = ({ lang, orders, brands, onReconcile, userRole }) => {
  const [reconModal, setReconModal] = useState<{ brand: any; amount: number } | null>(null);
  const t = translations[lang];

  const isReadOnly = userRole === UserRole.BRAND_OWNER;

  // Global Logic
  const settledOrders = orders.filter(o => o.status === OrderStatus.DELIVERED && !o.reconciled);
  const pendingOrders = orders.filter(o => o.status === OrderStatus.SHIPPED || o.status === OrderStatus.PACKED);

  const totalSettledRevenue = settledOrders.reduce((sum, o) => sum + o.total, 0);
  const totalProjectedRevenue = pendingOrders.reduce((sum, o) => sum + o.total, 0);
  const estimatedProfit = totalSettledRevenue * 0.25;

  // Brand Specific Balances
  const brandFinances = brands.map(brand => {
    const brandSettled = orders.filter(o => o.brand === brand.name && o.status === OrderStatus.DELIVERED && !o.reconciled);
    const brandPending = orders.filter(o => o.brand === brand.name && (o.status === OrderStatus.SHIPPED || o.status === OrderStatus.PACKED));
    
    return {
      ...brand,
      currentAccountBalance: brandSettled.reduce((sum, o) => sum + o.total, 0),
      outstandingBalance: brandPending.reduce((sum, o) => sum + o.total, 0),
      previousBalance: brand.previousBalance || 0
    };
  });

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#dc2626', '#16a34a', '#d97706'];

  const handleConfirmReconciliation = () => {
    if (reconModal && !isReadOnly) {
      onReconcile(reconModal.brand.name, reconModal.amount);
      setReconModal(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.finance.totalEarnings}</p>
          <p className="text-3xl font-black text-blue-600">${totalSettledRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.finance.projected}</p>
          <p className="text-3xl font-black text-slate-800">${totalProjectedRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Reconciled</p>
          <p className="text-3xl font-black text-slate-400">${brands.reduce((s, b) => s + (b.previousBalance || 0), 0).toLocaleString()}</p>
        </div>
        {!isReadOnly && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.finance.netProfit}</p>
            <p className="text-3xl font-black text-emerald-600">${estimatedProfit.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Brand Entity</th>
                <th className="px-8 py-5">Previous Balance</th>
                <th className="px-8 py-5">Current Balance</th>
                <th className="px-8 py-5">Outstanding</th>
                {!isReadOnly && <th className="px-8 py-5 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {brandFinances.map((bf) => (
                <tr key={bf.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-800">{bf.name}</td>
                  <td className="px-8 py-5 text-slate-400">${bf.previousBalance.toLocaleString()}</td>
                  <td className="px-8 py-5 font-black text-blue-600">${bf.currentAccountBalance.toLocaleString()}</td>
                  <td className="px-8 py-5 font-black text-slate-800">${bf.outstandingBalance.toLocaleString()}</td>
                  {!isReadOnly && (
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <button 
                          disabled={bf.currentAccountBalance === 0}
                          onClick={() => setReconModal({ brand: bf, amount: bf.currentAccountBalance })}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${bf.currentAccountBalance > 0 ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300'}`}
                        >
                          Reconcile & Pay
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reconModal && !isReadOnly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900">Confirm Settlement</h2>
             </div>
             <div className="flex gap-4">
                <button onClick={() => setReconModal(null)} className="flex-1 py-4 rounded-2xl bg-slate-50 font-bold">Cancel</button>
                <button onClick={handleConfirmReconciliation} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold">Confirm</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
