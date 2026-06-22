import { Activity, Settings, AlertTriangle } from 'lucide-react';

const Assets = () => {
  const assets = [
    { id: 'P-101', name: 'Main Cooling Pump', status: 'Healthy', risk: 'Low', lastMaintenance: '2026-05-12', nextMaintenance: '2026-11-12' },
    { id: 'C-204', name: 'Primary Gas Compressor', status: 'Warning', risk: 'Medium', lastMaintenance: '2025-12-01', nextMaintenance: '2026-06-01' },
    { id: 'B-12', name: 'High Pressure Boiler', status: 'Critical', risk: 'High', lastMaintenance: '2025-08-15', nextMaintenance: 'Past Due' },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Asset Health</h1>
        <p className="text-slate-400 mt-1">Real-time status and predictive maintenance for all industrial assets.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(asset => (
          <div key={asset.id} className="card-panel flex flex-col hover:border-industrial-accent transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{asset.id}</h3>
                <p className="text-sm text-slate-400">{asset.name}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                asset.risk === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                asset.risk === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {asset.risk} Risk
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className="text-white font-medium">{asset.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Last Maint.</span>
                <span className="text-white font-medium">{asset.lastMaintenance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Next Maint.</span>
                <span className={`${asset.risk === 'High' ? 'text-rose-400' : 'text-white'} font-medium`}>{asset.nextMaintenance}</span>
              </div>
            </div>

            <button className="w-full py-2 bg-industrial-900 hover:bg-industrial-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-industrial-700 flex items-center justify-center gap-2">
              <Settings size={16} />
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assets;
