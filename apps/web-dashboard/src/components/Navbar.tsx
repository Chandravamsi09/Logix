import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10 px-8 flex items-center justify-between ml-64">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, SKU, shipments, or waybills..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg relative transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-slate-200">Admin Lead</div>
            <div className="text-xs text-slate-500">Enterprise Operator</div>
          </div>
        </div>
      </div>
    </header>
  );
};
