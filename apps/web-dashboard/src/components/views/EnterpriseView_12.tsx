import React, { useState } from 'react';

export interface ViewProps_12 {
  title?: string;
  tenantId?: string;
  onActionComplete?: (data: any) => void;
}

export const EnterpriseView_12: React.FC<ViewProps_12> = ({
  title = 'Enterprise Subsystem View 12',
  tenantId = 'global-tenant'
}) => {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const mockRows = Array.from({ length: 8 }, (_, idx) => ({
    id: `ROW-${idx + 100}`,
    name: `Logix Resource Identifier ${idx + 1}`,
    throughput: Math.floor(250 + Math.random() * 800),
    efficiency: +(94 + Math.random() * 5.8).toFixed(1),
    status: idx % 3 === 0 ? 'Optimal' : idx % 3 === 1 ? 'Processing' : 'Standby'
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">Tenant Workspace: {tenantId}</p>
        </div>
        <span className="px-2.5 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
          Active Monitor
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Resource ID</th>
              <th className="py-2.5 px-3">Descriptor</th>
              <th className="py-2.5 px-3">Throughput (ops/s)</th>
              <th className="py-2.5 px-3">Efficiency</th>
              <th className="py-2.5 px-3">State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {mockRows.map((r, i) => (
              <tr
                key={r.id}
                onClick={() => setActiveItem(i)}
                className={`cursor-pointer hover:bg-slate-800/40 transition-colors ${
                  activeItem === i ? 'bg-cyan-500/5' : ''
                }`}
              >
                <td className="py-2.5 px-3 font-mono text-cyan-400 text-xs">{r.id}</td>
                <td className="py-2.5 px-3 font-medium text-slate-200">{r.name}</td>
                <td className="py-2.5 px-3">{r.throughput}</td>
                <td className="py-2.5 px-3">{r.efficiency}%</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${
                      r.status === 'Optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : r.status === 'Processing'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-slate-700/40 text-slate-400'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
