import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Bot, Activity, ShieldAlert, LogOut } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Copilot', path: '/copilot', icon: Bot },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Asset Health', path: '/assets', icon: Activity },
    { name: 'Compliance', path: '/compliance', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-industrial-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-industrial-800 border-r border-industrial-700 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-industrial-700">
          <div className="flex items-center gap-2 text-industrial-secondary font-bold text-xl tracking-tight">
            <Bot size={28} className="text-industrial-accent" />
            <span>IndustrialBrain</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-industrial-700/50 text-industrial-accent'
                    : 'text-slate-400 hover:bg-industrial-700/30 hover:text-slate-200'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-industrial-700">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-industrial-900">
        <div className="h-full p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
