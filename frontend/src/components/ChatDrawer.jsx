import { useState, useEffect, useRef } from 'react';
import { X, Send, User, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatDrawer = ({ onClose }) => {
  const { user } = useAuth();
  const { messages, activeChat, sendMessage, fetchMessages } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat);
    }
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;

    sendMessage(activeChat, input);
    setInput('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg">Mentorship Chat</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Active Connection</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-200 mb-4 shadow-sm border border-slate-50">
                  <MessageSquare size={32} />
                </div>
                <h4 className="text-slate-500 font-black">Start a conversation</h4>
                <p className="text-slate-400 text-sm mt-1 font-medium italic">Ask for guidance, referals, or career tips!</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm font-medium text-sm leading-relaxed ${
                    msg.sender === user._id 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.content}
                    <p className={`text-[9px] mt-1 font-black uppercase opacity-50 ${msg.sender === user._id ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex gap-3">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-700"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className={`p-4 rounded-2xl transition-all shadow-xl ${input.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' : 'bg-slate-100 text-slate-300'}`}
              >
                <Send size={24} />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-2 justify-center">
               <Sparkles size={12} className="text-indigo-600" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Stay professional & helpful</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChatDrawer;
