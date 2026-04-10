import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ThumbsUp, MoreVertical, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';

const ResourceCard = ({ resource }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(resource.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (hasUpvoted) return;

    try {
      const res = await api.put(`/resources/${resource._id}/upvote`);
      setUpvotes(res.data.upvotes);
      setHasUpvoted(true);
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleDownload = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Logic to download from backend
    const url = resource.fileUrl.startsWith('http') ? resource.fileUrl : `${API_BASE_URL}${resource.fileUrl}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${
          resource.category === 'Notes' ? 'bg-blue-50 text-blue-600' :
          resource.category === 'Previous Papers' ? 'bg-purple-50 text-purple-600' :
          'bg-emerald-50 text-emerald-600'
        }`}>
          <FileText size={28} />
        </div>
        <button className="text-slate-300 hover:text-slate-600"><MoreVertical size={20} /></button>
      </div>

      <div className="mb-8">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">{resource.category}</p>
        <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors uppercase truncate">{resource.title}</h3>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-tight">{resource.subject}</p>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <button 
          onClick={handleUpvote}
          className={`flex items-center gap-2 font-bold transition-all ${hasUpvoted ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
        >
          <ThumbsUp size={18} fill={hasUpvoted ? 'currentColor' : 'none'} />
          <span>{upvotes}</span>
          <span className="text-[10px] uppercase opacity-50 ml-1">Helpful</span>
        </button>

        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100"
        >
          <Download size={16} /> Get File
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;
