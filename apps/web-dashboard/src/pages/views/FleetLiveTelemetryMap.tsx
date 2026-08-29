import React, { useState, useEffect } from 'react';

export const FleetLiveTelemetryMap: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const mock = Array.from({ length: 12 }, (_, i) => ({
      id: `REC-${i + 1001}`,
      name: `FleetLiveTelemetryMap Item ${i + 1}`,
      metricA: (Math.random() * 500 + 100).toFixed(2),
      metricB: (Math.random() * 95 + 5).toFixed(1) + '%',
      state: i % 2 === 0 ? 'SYNCHRONIZED' : 'IN_TRANSIT',
      timestamp: new Date().toISOString()
    }));
    setDataList(mock);
    setLoading(false);
  }, []);

  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">FleetLiveTelemetryMap</h2>
          <p className="text-sm text-slate-400">Real-time enterprise monitoring & control module</p>
        </div>
        <button className="px-4 py-2 bg-cyan-500 text-slate-950 font-semibold text-sm rounded-lg hover:bg-cyan-400 transition">
          Refresh Live Stream
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">Throughput Efficiency</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">99.2%</div>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">Operational Latency</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">14.8 ms</div>
        </div>
        <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <div className="text-xs text-slate-400 uppercase">Active Invariants</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">100% Validated</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs text-slate-400 uppercase">
            <tr>
              <th className="p-3">Record ID</th>
              <th className="p-3">Entity Description</th>
              <th className="p-3">Metric Value</th>
              <th className="p-3">SLA Compliance</th>
              <th className="p-3">Lifecycle State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {dataList.map(item => (
              <tr key={item.id} className="hover:bg-slate-800/50 transition">
                <td className="p-3 font-mono text-cyan-400 text-xs">{item.id}</td>
                <td className="p-3 font-medium text-slate-200">{item.name}</td>
                <td className="p-3">{item.metricA}</td>
                <td className="p-3 text-emerald-400">{item.metricB}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 text-xs rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.state}
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
