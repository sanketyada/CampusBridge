import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Send, Video, MessageCircle, Info, LogOut, Users, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const MeetingRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useChat();
  
  const [meeting, setMeeting] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  useEffect(() => {
    if (meeting && socket) {
      socket.emit('join_meeting', meeting._id);

      const handleNewMessage = (msg) => {
        if (msg.meeting === meeting._id) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      socket.on('new_meeting_message', handleNewMessage);

      return () => {
        socket.off('new_meeting_message', handleNewMessage);
      };
    }
  }, [meeting, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      // We retrieve from the valid join session if stored, or fetch by ID
      // Since we just joined, we fetch details
      const res = await api.get('/meetings/ongoing');
      const currentMeeting = res.data.find(m => m._id === id);
      
      if (!currentMeeting) {
        // If not found in ongoing, maybe it ended or restricted
        alert('Meeting not found or has ended.');
        navigate('/mentorship');
        return;
      }
      
      setMeeting(currentMeeting);
    } catch (err) {
      console.error(err);
      navigate('/mentorship');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    socket.emit('send_meeting_message', {
      meetingId: meeting._id,
      senderId: user._id,
      content: input,
    });

    setInput('');
  };

  const handleEndMeeting = async () => {
    if (!window.confirm('Are you sure you want to end this meeting for everyone?')) return;
    try {
      await api.put(`/meetings/${meeting._id}/end`);
      alert('Meeting ended.');
      navigate('/mentorship');
    } catch (err) {
      alert('Error ending meeting.');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-white overflow-hidden">
      {/* 🔴 Left: Video Space (Main Stage) */}
      <div className="flex-1 flex flex-col relative">
        {/* Top bar info */}
        <div className="p-6 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/5 absolute top-0 left-0 w-full z-10">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                 <Video size={24} />
              </div>
              <div>
                 <h2 className="text-xl font-black tracking-tight">{meeting.title}</h2>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-400" /> Professional Live Session
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                 <Users size={14} /> LIVE
              </div>
              {meeting && user && (meeting.organizer === user._id || meeting.organizer?._id === user._id || meeting.organizer?.toString() === user._id?.toString()) && (
                <button 
                  onClick={handleEndMeeting}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-900/20"
                >
                  End Session
                </button>
              )}
           </div>
        </div>

        {/* Video Placeholder / Link */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 mt-20">
           <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-[3rem] border-4 border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
              
              <div className="relative z-10 text-center px-8">
                 <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-600/40 transform -rotate-6">
                    <Video size={48} className="text-white" />
                 </div>
                 <h3 className="text-3xl font-black mb-4">Ready to go Live?</h3>
                 <p className="text-slate-400 text-lg font-medium mb-12 max-w-md mx-auto">
                    The video portion of this meeting is being hosted on a professional external platform for maximum quality.
                 </p>
                 
                 <a 
                   href={meeting.videoLink} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-4 bg-white text-slate-950 px-12 py-5 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                 >
                    Enter Video Call <Video size={24} />
                 </a>
              </div>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-white/20">
                 <div className="flex flex-col items-center gap-1">
                    <Users size={20} />
                    <span className="text-[8px] font-bold uppercase">Encrypted</span>
                 </div>
                 <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                 <div className="flex flex-col items-center gap-1">
                    <Sparkles size={20} />
                    <span className="text-[8px] font-bold uppercase">HD Quality</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Bar Controls (Aesthetic) */}
        <div className="p-8 flex justify-center border-t border-white/5 bg-slate-950">
           <div className="flex gap-4">
              <button onClick={() => navigate('/mentorship')} className="p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/10 group">
                 <LogOut size={24} className="text-slate-400 group-hover:text-white" />
              </button>
              <div className="px-10 py-5 bg-indigo-600 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center gap-4 shadow-xl shadow-indigo-600/20">
                 Session Status: Active
              </div>
              <button className="p-5 bg-white/5 hover:bg-white/10 rounded-3xl transition-all border border-white/10">
                 <Info size={24} className="text-slate-400" />
              </button>
           </div>
        </div>
      </div>

      {/* 🔵 Right: Meeting Chat */}
      <div className="w-full lg:w-[450px] bg-white text-slate-900 flex flex-col shadow-2xl">
         <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
               <h3 className="text-xl font-black flex items-center gap-3">
                 <MessageCircle className="text-indigo-600" /> Meeting Chat
               </h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lightweight Text Communication</p>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
            {messages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center opacity-30">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                     <MessageCircle size={32} />
                  </div>
                  <p className="font-black text-sm uppercase tracking-widest">Chat is silent</p>
                  <p className="text-xs font-medium">Be the first to say hello!</p>
               </div>
            ) : (
              messages.map((msg, idx) => {
                 const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                 return (
                   <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-2">
                         {!isMine && (
                           <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                              {msg.sender?.name?.[0]}
                           </div>
                         )}
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender?.name}</span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm transition-all ${
                        isMine 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                      }`}>
                         {msg.content}
                      </div>
                      <span className="text-[8px] mt-2 font-bold text-slate-300 uppercase">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                 );
              })
            )}
            <div ref={messagesEndRef} />
         </div>

         <div className="p-8 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex gap-4">
               <input 
                 type="text" 
                 placeholder="Message the room..." 
                 className="flex-1 p-5 bg-slate-50 rounded-[1.5rem] border-none outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
               />
               <button 
                 type="submit" 
                 disabled={!input.trim()}
                 className={`p-5 rounded-[1.5rem] transition-all ${input.trim() ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-100 text-slate-300'}`}
               >
                 <Send size={24} />
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
