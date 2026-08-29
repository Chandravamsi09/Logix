import React from 'react';
import { LayoutDashboard, ShoppingCart, Boxes, Truck, Receipt, ShieldCheck, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Pulse', icon: LayoutDashboard },
    { id: 'orders', label: 'Order Pipeline', icon: ShoppingCart },
    { id: 'inventory', label: 'Warehouse Bins', icon: Boxes },
    { id: 'logistics', label: 'Fleet Telemetry', icon: Truck },
    { id: 'billing', label: 'General Ledger', icon: Receipt },
    { id: 'iam', label: 'Access & IAM', icon: ShieldCheck },
    { id: 'analytics', label: 'Reports & Export', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
          LX
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight text-white tracking-wide">LOGIX</h1>
          <p className="text-xs text-slate-400">Enterprise Logistics Core</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Mesh: 7 Services Connected</span>
        </div>
      </div>
    </aside>
  );
};
