import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Award, Star, UserCheck, Search, Users, ShieldCheck, Video, Plus, Hash, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api, { API_BASE_URL } from '../services/api';
import GuestBanner from '../components/GuestBanner';
import ChatDrawer from '../components/ChatDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const MentorshipPage = () => {
  const { user } = useAuth();
  const { setActiveChat, fetchMessages } = useChat();
  const navigate = useNavigate();
  
  const [mentors, setMentors] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faculty'); // 'faculty' or 'alumni'
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Meeting related states
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [meetingFormData, setMeetingFormData] = useState({ title: '', videoLink: '', description: '' });
  const [joiningMeeting, setJoiningMeeting] = useState(null);
  const [enteredId, setEnteredId] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchMeetings();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'faculty' ? '/users/faculty' : '/users/alumni';
      const res = await api.get(endpoint);
      setMentors(res.data);
    } catch (err) {
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const res = await api.get('/meetings/ongoing');
      setMeetings(res.data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const handleOpenChat = (targetUser) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setActiveChat(targetUser._id);
    fetchMessages(targetUser._id);
    setShowChat(true);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const res = await api.post('/meetings', meetingFormData);
      setMeetings([res.data, ...meetings]);
      setShowCreateMeeting(false);
      setMeetingFormData({ title: '', videoLink: '', description: '' });
      // Automatically join the newly created meeting
      navigate(`/meeting/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating meeting');
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/meetings/${joiningMeeting._id}/join`, { meetingId: enteredId });
      navigate(`/meeting/${joiningMeeting._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid Meeting ID');
    }
  };

  const filteredMentors = mentors.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto h-full">
      {!user && <GuestBanner />}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Professional Hub</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium italic">Consult, Collaborate, and Convene.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Mentors..." 
              className="w-full md:w-72 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => user ? setShowCreateMeeting(true) : navigate('/login')}
            className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center gap-2 font-black text-sm"
          >
            <Plus size={20} /> <span className="hidden md:inline">Start Meeting</span>
          </button>
        </div>
      </div>

      {/* 🟢 Ongoing Meetings Section */}
      {meetings.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
             <div className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">LIVE</div>
             <h2 className="text-xl font-black text-slate-800">Ongoing Professional Sessions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map((m) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={m._id} 
                onClick={() => setJoiningMeeting(m)}
                className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] cursor-pointer hover:border-indigo-600 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Video size={60} />
                </div>
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 border border-slate-100">
                      {m.organizer?.name?.[0]}
                   </div>
                   <div>
                      <h4 className="font-black text-slate-800 line-clamp-1">{m.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hosted by {m.organizer?.name}</p>
                   </div>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 italic">"{m.description || 'Professional academic discussion in progress...'}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-500">{m.participants?.length || 1} IN ROOM</span>
                   </div>
                   <span className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">Join Session <Hash size={12}/></span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Role Tabs */}
      <div className="flex gap-4 p-2 bg-slate-100 rounded-[2rem] mb-12 w-fit">
        <button 
          onClick={() => setActiveTab('faculty')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] font-black transition-all ${activeTab === 'faculty' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <ShieldCheck size={20} /> Global Faculty
        </button>
        <button 
          onClick={() => setActiveTab('alumni')}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] font-black transition-all ${activeTab === 'alumni' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-800'}`}
        >
          <Award size={20} /> Success Alumni
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor) => (
            <div key={mentor._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform opacity-30"></div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center font-black text-3xl text-indigo-600 mb-6 overflow-hidden">
                  {mentor.profilePicture ? (
                    <img src={mentor.profilePicture.startsWith('http') ? mentor.profilePicture : `${API_BASE_URL}${mentor.profilePicture}`} className="w-full h-full object-cover" />
                  ) : (
                    mentor.name[0]
                  )}
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-1">{mentor.name}</h3>
                <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  {activeTab === 'faculty' ? (
                    <><Users size={14} /> Professor • {mentor.department}</>
                  ) : (
                    <><Award size={14} /> {mentor.company || 'Industry Professional'}</>
                  )}
                </p>
                
                <p className="text-slate-500 mb-8 line-clamp-3 font-medium leading-relaxed italic">
                  "{mentor.bio || 'Experienced professional dedicated to student success and academic excellence.'}"
                </p>
                
                <div className="flex gap-4">
                  <button onClick={() => handleOpenChat(mentor)} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100">
                    <MessageSquare size={20} /> Contact Mentor
                  </button>
                  <button className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400">
                    <UserCheck size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals & Overlays */}
      <AnimatePresence>
        {/* Create Meeting Modal */}
        {showCreateMeeting && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateMeeting(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Video className="text-indigo-600" /> Start Professional Meeting</h2>
                  <button onClick={() => setShowCreateMeeting(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900"><X size={20} /></button>
               </div>
               <form onSubmit={handleCreateMeeting} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Meeting Title</label>
                    <input 
                      type="text" placeholder="e.g. Industry Career Roadmap" 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700"
                      value={meetingFormData.title}
                      onChange={(e) => setMeetingFormData({...meetingFormData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Video Call Link</label>
                    <input 
                      type="url" placeholder="Google Meet / Zoom URL" 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700"
                      value={meetingFormData.videoLink}
                      onChange={(e) => setMeetingFormData({...meetingFormData, videoLink: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                    <textarea 
                       placeholder="What will you discuss?" 
                       className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-medium text-slate-600 h-24 resize-none"
                       value={meetingFormData.description}
                       onChange={(e) => setMeetingFormData({...meetingFormData, description: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100">
                    Launch Meeting Session
                  </button>
               </form>
            </motion.div>
          </div>
        )}

        {/* Join Meeting ID Prompt */}
        {joiningMeeting && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setJoiningMeeting(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center">
               <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                  <Hash size={40} />
               </div>
               <h2 className="text-2xl font-black text-slate-800 mb-2">Security Verification</h2>
               <p className="text-slate-500 font-medium mb-8">Enter the unique **Meeting ID** provided by the organizer to join **{joiningMeeting.title}**.</p>
               <form onSubmit={handleJoinMeeting} className="space-y-6">
                  <input 
                    type="text" placeholder="Enter ID here..." 
                    className="w-full p-5 bg-slate-50 rounded-2xl border-none outline-none font-black text-center text-2xl tracking-[0.5em] focus:ring-4 focus:ring-indigo-50"
                    value={enteredId}
                    onChange={(e) => setEnteredId(e.target.value)}
                    required
                  />
                  <div className="flex gap-3">
                     <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-slate-900 transition-all">Join Session</button>
                     <button onClick={() => setJoiningMeeting(null)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black">Cancel</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Drawer */}
      {showChat && (
        <ChatDrawer onClose={() => setShowChat(false)} />
      )}
    </div>
  );
};

export default MentorshipPage;
