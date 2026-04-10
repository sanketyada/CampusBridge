import { useState, useEffect } from 'react';
import { UserPlus, Award } from 'lucide-react';
import api from '../services/api';

const MentorSidebar = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // We'll use the user endpoint once routes are mounted
        // For now, let's mock or fetch from a general endpoint
        const res = await api.get('/auth/me'); // Placeholder, we need a real user route
        // In a real app, we'd have /api/users/mentors
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  return (
    <div className="hidden xl:block w-80 fixed right-8 top-24">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="text-amber-500" size={20} /> Top Mentors
        </h3>
        
        <div className="space-y-4">
          {/* Mock data for demonstration since we haven't mounted user routes yet */}
          {[
            { name: "Sarah Chen", role: "Sr. Engineer @ Google", bio: "Alumni 2018. Expert in System Design." },
            { name: "Dr. Alex Rivera", role: "Research Scientist", bio: "Passionate about AI and Machine Learning." }
          ].map((mentor, i) => (
            <div key={i} className="flex gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                {mentor.name[0]}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800">{mentor.name}</h4>
                <p className="text-xs text-indigo-500 font-semibold">{mentor.role}</p>
                <button className="mt-2 text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-600 font-bold">
                  <UserPlus size={12} /> Connect
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
          View All Mentors
        </button>
      </div>

      <div className="mt-6 bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
        <h3 className="font-bold mb-2">Need a Resume Review?</h3>
        <p className="text-xs text-indigo-100 mb-4">Our Alumni network provides free 1-on-1 career guidance for students.</p>
        <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold w-full">
          Book a Session
        </button>
      </div>
    </div>
  );
};

export default MentorSidebar;
