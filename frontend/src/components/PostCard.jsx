import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || []);
  const [shares, setShares] = useState(post.shares || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [shareFeedback, setShareFeedback] = useState('');

  const isLiked =
    user &&
    Array.isArray(likes) &&
    likes.some((id) => id === user._id || id?.toString?.() === user._id?.toString?.());

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      setLikes(res.data);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments(res.data);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const shareCount = Array.isArray(shares) ? shares.length : 0;
  const hasShared =
    user && Array.isArray(shares) && shares.some((id) => (id === user._id || id?.toString?.() === user._id));

  const handleShare = async () => {
    const url = `${window.location.origin}/?doubt=${post._id}`;
    const copyOrNativeShare = async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: 'CampusBridge doubt', text: post.content?.slice(0, 120) || '', url });
        } else {
          await navigator.clipboard.writeText(url);
          setShareFeedback('Link copied');
          setTimeout(() => setShareFeedback(''), 2000);
        }
      } catch (e) {
        if (e?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url);
            setShareFeedback('Link copied');
            setTimeout(() => setShareFeedback(''), 2000);
          } catch (_) {
            setShareFeedback('Copy blocked — share manually');
            setTimeout(() => setShareFeedback(''), 2500);
          }
        }
      }
    };

    if (!user) {
      await copyOrNativeShare();
      return;
    }

    await copyOrNativeShare();
    try {
      const res = await api.put(`/posts/${post._id}/share`);
      setShares(res.data);
    } catch (err) {
      console.error('Error recording share:', err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div id={`doubt-${post._id}`} className="post-card bg-white rounded-[1.5rem] p-8 mb-8 shadow-sm border border-slate-200 transition-all hover:shadow-md scroll-mt-24">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Link
            to={post.user?._id ? `/profile/${post.user._id}` : '#'}
            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-indigo-600 overflow-hidden border border-slate-100 shrink-0 hover:ring-2 ring-indigo-200 transition-all"
            onClick={(e) => !post.user?._id && e.preventDefault()}
          >
            {post.user?.profilePicture ? (
              <img 
                src={post.user.profilePicture.startsWith('http') ? post.user.profilePicture : `${API_BASE_URL}${post.user.profilePicture}`} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (
              post.user?.name?.[0] || '?'
            )}
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                to={post.user?._id ? `/profile/${post.user._id}` : '#'}
                className="font-black text-slate-800 text-lg leading-tight hover:text-indigo-600 transition-colors"
                onClick={(e) => !post.user?._id && e.preventDefault()}
              >
                {post.user?.name}
              </Link>
              {post.user?.role === 'faculty' && <ShieldCheck size={16} className="text-indigo-600" title="Verified Faculty" />}
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                post.user?.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                post.user?.role === 'faculty' ? 'bg-indigo-50 text-indigo-600' :
                'bg-slate-50 text-slate-500'
              }`}>
                {post.user?.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{timeAgo(post.createdAt)} • {post.user?.department || 'General'}</p>
          </div>
        </div>
        <button className="p-2 text-slate-300 hover:text-slate-600 transition-all"><MoreHorizontal size={20} /></button>
      </div>

      <div className="post-content text-slate-700 font-medium leading-[1.8] text-[1.1rem] mb-8">
        {post.content.split(' ').map((word, i) => 
          word.startsWith('#') ? (
            <span key={i} className="text-indigo-600 font-black hover:underline cursor-pointer">
              {word}{' '}
            </span>
          ) : (
            word + ' '
          )
        )}
      </div>

      <div className="post-actions flex items-center gap-10 pt-6 border-t border-slate-50">
        <button 
          onClick={handleLike}
          className={`group flex items-center gap-2.5 text-xs font-black uppercase tracking-widest transition-all ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
        >
          <div className={`p-2.5 rounded-xl transition-all group-hover:bg-rose-50 ${isLiked ? 'bg-rose-50' : ''}`}>
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </div>
          {likes.length} Reactions
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="group flex items-center gap-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all"
        >
          <div className="p-2.5 rounded-xl group-hover:bg-indigo-50 transition-all">
            <MessageCircle size={18} />
          </div>
          {comments.length} Insights
        </button>
        <button
          type="button"
          onClick={handleShare}
          className={`group flex items-center gap-2.5 text-xs font-black uppercase tracking-widest transition-all ml-auto ${hasShared ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-800'}`}
        >
          <div className={`p-2.5 rounded-xl transition-all ${hasShared ? 'bg-indigo-50' : 'group-hover:bg-slate-100'}`}>
            <Share2 size={18} />
          </div>
          Share{shareCount > 0 ? ` (${shareCount})` : ''}
        </button>
      </div>
      {shareFeedback && (
        <p className="text-center text-xs font-bold text-indigo-600 mt-2">{shareFeedback}</p>
      )}

      {showComments && (
        <div className="comments-section mt-8 pt-8 border-t border-slate-100">
          <form onSubmit={handleComment} className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center font-black text-slate-300">
               {user?.name?.[0] || <User size={18} />}
            </div>
            <input 
              type="text" 
              placeholder={user ? "Add your perspective..." : "Sign in to join the discussion"}
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 ring-indigo-50 transition-all"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user}
            />
            <button 
              type="submit"
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all disabled:opacity-50"
              disabled={!user || !commentText.trim()}
            >
              Post
            </button>
          </form>

          <div className="space-y-6">
            {comments.map((comment, index) => (
              <div key={index} className="flex gap-4 group/comment">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex-shrink-0 flex items-center justify-center text-xs font-black text-indigo-600 overflow-hidden border border-slate-100">
                  {comment.user?.profilePicture ? (
                    <img 
                      src={comment.user.profilePicture.startsWith('http') ? comment.user.profilePicture : `${API_BASE_URL}${comment.user.profilePicture}`} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    comment.name?.[0]
                  )}
                </div>
                <div className="flex-1 bg-slate-50 rounded-[1.25rem] p-4 group-hover/comment:bg-white group-hover/comment:shadow-sm border border-transparent group-hover/comment:border-slate-100 transition-all">
                   <div className="flex justify-between items-center mb-1">
                      <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{comment.name}</h5>
                      <span className="text-[9px] text-slate-300 font-bold uppercase">Now</span>
                   </div>
                   <p className="text-sm text-slate-600 font-medium leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
