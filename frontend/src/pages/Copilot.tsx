import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import axios from 'axios';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const Copilot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your Industrial Knowledge Copilot. Ask me anything about your assets, maintenance logs, or uploaded manuals.',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:3000/api/ai/chat', { message: newMessage.content });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.data.response
      }]);
    } catch (error: any) {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Unable to reach the AI Service. Is the backend running?';
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**Error:** ${errorMsg}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Bot className="text-industrial-accent" size={32} />
          Knowledge Copilot
        </h1>
        <p className="text-slate-400 mt-1">Ask questions and analyze data using Gemini AI.</p>
      </header>

      <div className="flex-1 card-panel flex flex-col p-0 overflow-hidden relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-industrial-700' : 'bg-industrial-900 border border-industrial-700 shadow-inner shadow-industrial-accent/20'}`}>
                {msg.role === 'user' ? <User size={20} className="text-slate-300" /> : <Bot size={20} className="text-industrial-accent" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-industrial-accent text-industrial-900 font-medium' : 'bg-industrial-900 border border-industrial-700 text-slate-200 shadow-lg'}`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-industrial-800 max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-industrial-900 border border-industrial-700 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-industrial-accent" />
              </div>
              <div className="bg-industrial-900 border border-industrial-700 rounded-2xl px-5 py-4 flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-industrial-accent" />
                <span className="text-slate-400 text-sm">Analyzing operations...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-industrial-700 bg-industrial-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about compliance, asset status, or maintenance procedures..."
              className="w-full bg-industrial-900 border border-industrial-700 rounded-xl pl-4 pr-14 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-industrial-accent transition-colors shadow-inner"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-industrial-accent hover:bg-amber-400 text-industrial-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Copilot;
