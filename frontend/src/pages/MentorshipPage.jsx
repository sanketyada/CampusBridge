import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Award, Star, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import GuestBanner from '../components/GuestBanner';

const MentorshipPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/users/mentors');
        setMentors(res.data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Future logic for chat messaging
    alert("Chat messaging feature coming soon!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {!user && <GuestBanner />}

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-800">Campus Mentors</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Connect with Alumni and Professionals for 1-on-1 guidance</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {mentors.map((mentor) => (
            <div key={mentor._id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Star className="text-amber-400 fill-amber-400" />
              </div>
              
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-2xl text-indigo-600 mb-6 overflow-hidden">
                {mentor.profilePicture ? (
                  <img src={mentor.profilePicture.startsWith('http') ? mentor.profilePicture : `${API_BASE_URL}${mentor.profilePicture}`} alt={mentor.name} className="w-full h-full object-cover" />
                ) : (
                  mentor.name[0]
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-1">{mentor.name}</h3>
              <p className="text-indigo-500 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award size={16} /> {mentor.role === 'alumni' ? 'Alumni / Mentor' : 'Professional'}
              </p>
              
              <p className="text-slate-500 mb-8 line-clamp-2 italic font-medium">
                "{mentor.bio || 'Passionate about helping students achieve their career goals.'}"
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleChat}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                  <MessageSquare size={18} /> Chat
                </button>
                <button 
                  onClick={() => !user && navigate('/login')}
                  className="px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <UserCheck className="text-slate-400" size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {mentors.length === 0 && (
            <div className="col-span-full text-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400">No mentors available at the moment. Check back later!</p>
            </div>
          )}
        </div>
      )}

      {/* Hero Section for Mentorship */}
      <div className="mt-20 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-6">Become a Mentor</h2>
          <p className="text-slate-400 text-lg mb-8 font-medium">Are you an alumni? Share your experience with the next generation of students and build your legacy.</p>
          <button 
            onClick={() => !user && navigate('/login')}
            className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all"
          >
            Apply as Alumni
          </button>
        </div>
        <div className="absolute top-0 right-[-10%] bottom-0 w-1/2 bg-indigo-600 rotate-12 opacity-50 blur-3xl"></div>
      </div>
    </div>
  );
};

export default MentorshipPage;
