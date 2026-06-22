import { ShieldAlert, AlertCircle, FileWarning } from 'lucide-react';

const Compliance = () => {
  const issues = [
    { id: 1, title: 'Fire Inspection Overdue', description: 'Zone B facility fire safety inspection was due 3 days ago.', severity: 'High', date: '2026-06-19', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { id: 2, title: 'Pressure Vessel Certificate Expires Soon', description: 'Vessel V-892 certificate expires in 9 days. Requires immediate attention.', severity: 'Medium', date: '2026-07-01', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 3, title: 'Missing Maintenance Log', description: 'Log entry for Compressor C-204 routine check is missing from system.', severity: 'Low', date: '2026-06-21', icon: FileWarning, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Compliance & Audits</h1>
        <p className="text-slate-400 mt-1">Track regulatory requirements and safety standards.</p>
      </header>

      <div className="card-panel">
        <h3 className="text-lg font-semibold text-white mb-6 border-b border-industrial-700 pb-4">Open Action Items</h3>
        
        <div className="space-y-4">
          {issues.map(issue => (
            <div key={issue.id} className="flex gap-4 p-4 rounded-xl bg-industrial-900 border border-industrial-700 hover:border-industrial-600 transition-colors">
              <div className={`p-3 rounded-lg border ${issue.bg} ${issue.color} h-fit`}>
                <issue.icon size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-white">{issue.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${issue.bg} ${issue.color}`}>
                    {issue.severity} Severity
                  </span>
                </div>
                <p className="text-slate-400 mt-1 text-sm">{issue.description}</p>
                <p className="text-xs text-slate-500 mt-3 font-medium">Due: {issue.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compliance;
