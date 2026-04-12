import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ThumbsUp, MoreVertical, MessageCircle, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';

const ResourceCard = ({ resource }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvoteIds, setUpvoteIds] = useState(() =>
    Array.isArray(resource.upvotes) ? resource.upvotes : []
  );
  const [shareIds, setShareIds] = useState(() =>
    Array.isArray(resource.shares) ? resource.shares : []
  );
  const [shareHint, setShareHint] = useState('');

  const hasUpvoted = useMemo(
    () =>
      user &&
      upvoteIds.some((id) => id === user._id || id?.toString?.() === user._id?.toString?.()),
    [user, upvoteIds]
  );

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await api.put(`/resources/${resource._id}/upvote`);
      setUpvoteIds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/resources?resource=${resource._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareHint('Link copied');
        setTimeout(() => setShareHint(''), 2000);
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          setShareHint('Link copied');
          setTimeout(() => setShareHint(''), 2000);
        } catch (_) {
          setShareHint('Copy blocked');
          setTimeout(() => setShareHint(''), 2000);
        }
      }
    }

    if (!user) return;
    try {
      const res = await api.put(`/resources/${resource._id}/share`);
      setShareIds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error recording share:', err);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
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

      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleUpvote}
            className={`flex items-center gap-2 font-bold transition-all ${hasUpvoted ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <ThumbsUp size={18} fill={hasUpvoted ? 'currentColor' : 'none'} />
            <span>{upvoteIds.length}</span>
            <span className="text-[10px] uppercase opacity-50 ml-1">Like</span>
          </button>
          <span className="flex items-center gap-2 text-slate-400 font-bold text-sm">
            <MessageCircle size={18} />
            {resource.comments?.length ?? 0}
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-sm"
          >
            <Share2 size={18} />
            {shareIds.length > 0 ? shareIds.length : 'Share'}
          </button>
        </div>
        {shareHint && <span className="text-[10px] font-bold text-indigo-600 w-full">{shareHint}</span>}

        <button
          type="button"
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
