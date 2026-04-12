import { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError('');

    try {
      setLoading(true);
      const res = await api.post('/posts', { content });
      onPostCreated(res.data);
      setContent('');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Ensure language is appropriate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 mb-8 overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 opacity-20"></div>
      
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 items-start">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 flex-shrink-0">
             <Sparkles size={24} />
           </div>
           <textarea
            placeholder="Share an academic insight, professional doubt, or career achievement..."
            className="w-full min-h-[120px] p-2 bg-transparent rounded-2xl border-none outline-none focus:ring-0 transition-all text-slate-700 font-bold text-lg resize-none placeholder:text-slate-300"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-sm font-bold mt-4 px-4 py-3 bg-rose-50 rounded-2xl mb-4 border border-rose-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Platform Policy</span>
               <span className="text-[11px] text-slate-800 font-black flex items-center gap-1 uppercase tracking-widest"><Sparkles size={12} className="text-indigo-600"/> Verified Professional Mode</span>
            </div>
          </div>

          <button 
            className={`px-12 py-4 rounded-[1.5rem] font-black tracking-widest uppercase text-xs transition-all ${loading || !content.trim() ? 'bg-slate-50 text-slate-300' : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-2xl shadow-indigo-100'}`}
            disabled={loading || !content.trim()}
          >
            {loading ? 'Publishing...' : 'Broadcast Insight'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
