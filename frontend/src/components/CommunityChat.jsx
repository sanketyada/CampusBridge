import { useState, useEffect, useRef } from 'react';
import { X, Send, Users, Sparkles, Hash, Info, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const CommunityChat = ({ group, onClose }) => {
  const { user } = useAuth();
  const { socket } = useChat();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (group && group._id) {
      fetchGroupMessages();
      
      // Join group room via socket
      if (socket) {
        socket.emit('join_group', group._id);

        const handleNewMessage = (msg) => {
          if (msg.group === group._id) {
            setMessages((prev) => [...prev, msg]);
          }
        };

        socket.on('new_group_message', handleNewMessage);

        return () => {
          socket.off('new_group_message', handleNewMessage);
        };
      }
    }
  }, [group, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGroupMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/groups/${group._id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching group messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    socket.emit('send_group_message', {
      groupId: group._id,
      senderId: user._id,
      content: input,
    });

    setInput('');
  };

  const copyInviteId = () => {
    navigator.clipboard.writeText(group.inviteId);
    alert('Invite ID copied! Share this with others to join.');
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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Drawer Content */}
        <motion.div 
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 250 }}
          className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-100">
                {group.name[0]}
              </div>
              <div>
                <h3 className="font-black text-2xl text-slate-800 leading-tight">{group.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                   <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                     <Users size={12} /> {group.members?.length || 1} Members
                   </div>
                   <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                   <button onClick={copyInviteId} className="flex items-center gap-1 text-indigo-600 font-black text-[10px] uppercase tracking-wider hover:underline">
                     <Hash size={12} /> ID: {group.inviteId}
                   </button>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
              <X size={28} />
            </button>
          </div>

          {/* Info Banner */}
          <div className="px-8 py-3 bg-indigo-50/50 border-b border-indigo-50 flex items-center gap-4">
             <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <Info size={14} />
             </div>
             <p className="text-[10px] font-black text-indigo-900/60 uppercase tracking-widest leading-none">
               Professional Community Chat • {group.description || 'Public Discussion Space'}
             </p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                  <MessageSquare size={40} />
                </div>
                <h4 className="text-slate-800 font-black text-xl mb-2">Welcome to {group.name}</h4>
                <p className="text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">First to speak defines the culture! Start the professional dialogue now.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-4 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {!isMine && (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0 flex items-center justify-center font-black text-indigo-600 border border-slate-200 uppercase text-xs">
                        {msg.sender?.profilePicture ? (
                           <img src={msg.sender.profilePicture} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                           msg.sender?.name?.[0] || '?'
                        )}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMine ? 'text-right' : 'text-left'}`}>
                       {!isMine && (
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                           {msg.sender?.name} 
                           {msg.sender?.role === 'faculty' && <span className="text-indigo-500 font-black italic">[FACULTY]</span>}
                         </p>
                       )}
                       <div className={`p-4 rounded-[1.25rem] shadow-sm font-medium text-sm leading-relaxed ${
                         isMine 
                           ? 'bg-slate-900 text-white rounded-tr-none' 
                           : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                       }`}>
                         {msg.content}
                       </div>
                       <p className="text-[9px] mt-2 font-black text-slate-300 uppercase tracking-tighter">
                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-8 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex gap-4">
              <input 
                type="text" 
                placeholder="Share your perspective..."
                className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className={`p-4 rounded-2xl transition-all shadow-xl ${input.trim() ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100' : 'bg-slate-100 text-slate-300'}`}
              >
                <Send size={28} />
              </button>
            </form>
            <div className="mt-5 flex items-center gap-2 justify-center">
               <Sparkles size={14} className="text-indigo-600" />
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Identities verified • professional zone</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommunityChat;
