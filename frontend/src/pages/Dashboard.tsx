import { motion } from 'framer-motion';
import { FileText, Activity, ShieldAlert, Bot } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Documents Indexed', value: '1,248', icon: FileText, color: 'text-blue-400' },
    { title: 'Active Assets', value: '342', icon: Activity, color: 'text-emerald-400' },
    { title: 'Compliance Alerts', value: '3', icon: ShieldAlert, color: 'text-rose-400' },
    { title: 'AI Queries (Today)', value: '156', icon: Bot, color: 'text-industrial-accent' },
  ];

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Operations Dashboard</h1>
        <p className="text-slate-400 mt-1">System overview and intelligence status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-panel flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 bg-industrial-900 rounded-lg ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 card-panel flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-industrial-700 pb-4">Recent AI Insights</h3>
          <div className="flex-1 flex items-center justify-center text-slate-500">
            [Chart Placeholder] - Operational Efficiency over 30 days
          </div>
        </div>
        
        <div className="card-panel flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 border-b border-industrial-700 pb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-industrial-secondary mt-2"></div>
                <div>
                  <p className="text-sm text-slate-200">User uploaded manual_pump_p101.pdf</p>
                  <p className="text-xs text-slate-500">{i} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
