import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(post.likes || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const isLiked = user && likes.includes(user._id);

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
    <div className="post-card bg-white rounded-2xl p-6 mb-6 shadow-sm border border-slate-100 hover:border-indigo-100 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 overflow-hidden">
            {post.isAnonymous ? (
              <User size={20} className="text-slate-400" />
            ) : post.user?.profilePicture ? (
              <img src={`http://localhost:5000${post.user.profilePicture}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              post.user?.name?.[0] || '?'
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              {post.isAnonymous ? 'Ghost Contributor' : post.user?.name}
              {!post.isAnonymous && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">{post.user?.role}</span>}
            </h4>
            <p className="text-xs text-slate-400 font-medium">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={20} /></button>
      </div>

      <div className="post-content text-slate-700 leading-relaxed mb-6">
        {post.content.split(' ').map((word, i) => 
          word.startsWith('#') ? (
            <span key={i} className="text-indigo-600 font-bold hover:underline cursor-pointer">
              {word}{' '}
            </span>
          ) : (
            word + ' '
          )
        )}
      </div>

      <div className="post-actions flex items-center gap-6 pt-4 border-t border-slate-50">
        <button 
          onClick={handleLike}
          className={`group flex items-center gap-2 text-sm font-bold transition-all ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
        >
          <div className={`p-2 rounded-lg group-hover:bg-rose-50 ${isLiked ? 'bg-rose-50' : ''}`}>
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </div>
          {likes.length}
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-all"
        >
          <div className="p-2 rounded-lg group-hover:bg-indigo-50">
            <MessageCircle size={18} />
          </div>
          {comments.length}
        </button>
        <button className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-500 transition-all ml-auto">
          <div className="p-2 rounded-lg group-hover:bg-emerald-50">
            <Share2 size={18} />
          </div>
        </button>
      </div>

      {showComments && (
        <div className="comments-section mt-6 pt-6 border-t border-slate-50">
          <form onSubmit={handleComment} className="flex gap-3 mb-6">
            <input 
              type="text" 
              placeholder={user ? "Add a comment..." : "Login to comment"}
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-indigo-100"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!user}
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
              disabled={!user || !commentText.trim()}
            >
              Post
            </button>
          </form>

          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden">
                  {comment.user?.profilePicture ? (
                    <img src={`http://localhost:5000${comment.user.profilePicture}`} className="w-full h-full object-cover" />
                  ) : (
                    comment.name?.[0]
                  )}
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl p-3">
                  <h5 className="text-xs font-bold text-slate-800 mb-1">{comment.name}</h5>
                  <p className="text-sm text-slate-600">{comment.text}</p>
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
