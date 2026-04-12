import { useState, useEffect } from 'react';
import { Bell, Megaphone, ShieldAlert, CheckCircle, X, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPanel = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state to reflect read status
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, readBy: [...n.readBy, user._id] } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
      />

      {/* Panel Content */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
               <Bell size={20} />
             </div>
             <h3 className="font-black text-xl text-slate-800">Campus Notices</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center p-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mb-4 border border-slate-100">
                 <Bell size={28} />
               </div>
               <p className="text-slate-400 font-bold">All caught up!</p>
               <p className="text-slate-300 text-sm mt-1">Check back later for campus announcements.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isRead = notif.readBy.includes(user._id);
              return (
                <div 
                  key={notif._id}
                  onClick={() => !isRead && markAsRead(notif._id)}
                  className={`relative p-5 rounded-3xl border transition-all cursor-pointer group ${
                    isRead 
                      ? 'bg-white border-slate-100 opacity-60' 
                      : 'bg-white border-indigo-100 shadow-md shadow-indigo-50 hover:border-indigo-200'
                  }`}
                >
                  {!isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-600 rounded-full"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${
                      notif.type === 'alert' ? 'bg-rose-50 text-rose-600' :
                      notif.type === 'notice' ? 'bg-amber-50 text-amber-600' :
                      'bg-indigo-50 text-indigo-600'
                    }`}>
                      {notif.type === 'alert' ? <ShieldAlert size={18} /> : 
                       notif.type === 'notice' ? <CheckCircle size={18} /> : <Megaphone size={18} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-slate-800 text-sm leading-tight pr-4">{notif.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3 line-clamp-3">
                        {notif.message}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">By {notif.sender?.name || 'Admin'}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 text-center">
           <button onClick={onClose} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-all">
             Close Notifications
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationPanel;
