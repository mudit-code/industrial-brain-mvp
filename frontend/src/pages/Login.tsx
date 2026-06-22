import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-industrial-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-industrial-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-industrial-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-panel max-w-md w-full relative z-10 border-industrial-700/50 bg-industrial-800/80 backdrop-blur-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-industrial-900 rounded-2xl flex items-center justify-center border border-industrial-700 mb-4 shadow-inner shadow-industrial-accent/10">
            <Bot size={36} className="text-industrial-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Industrial Brain</h1>
          <p className="text-slate-400 text-center text-sm">
            Unified Asset & Operations Intelligence
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Operator ID</label>
            <input 
              type="text" 
              placeholder="e.g. OP-8492"
              className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-industrial-accent transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Passcode</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full bg-industrial-900 border border-industrial-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-industrial-accent transition-colors"
            />
          </div>

          <button 
            type="submit"
            className="w-full btn-primary flex items-center justify-center gap-2 mt-6 py-3"
          >
            <span>Access Terminal</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Demo Mode - No authentication required
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
