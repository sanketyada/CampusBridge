import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import GuestBanner from '../components/GuestBanner';
import { TrendingUp, Clock, Search, User, ChevronDown, Plus, Users, Hash, Sparkles } from 'lucide-react';
import CommunityChat from '../components/CommunityChat';
import '../assets/Feed.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedType, setFeedType] = useState('global');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const doubtId = searchParams.get('doubt');
  
  const [activeGroup, setActiveGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [groupFormData, setGroupFormData] = useState({ name: '', description: '', inviteId: '' });

  useEffect(() => {
    fetchPosts(1, true);
    if (user) fetchGroups();
  }, [feedType, user]);

  useEffect(() => {
    if (!doubtId || loading || posts.length === 0) return;
    const id = requestAnimationFrame(() => {
      document.getElementById(`doubt-${doubtId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [doubtId, loading, posts]);

  const fetchPosts = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: pageNum,
        limit: 10,
        search: searchTerm,
        mine: feedType === 'my-doubts' ? 'true' : 'false'
      });

      const res = await api.get(`/posts?${params.toString()}`);
      if (isInitial) setPosts(res.data.posts);
      else setPosts([...posts, ...res.data.posts]);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/groups', { name: groupFormData.name, description: groupFormData.description });
      setGroups([res.data, ...groups]);
      setShowCreateGroup(false);
      setGroupFormData({ name: '', description: '', inviteId: '' });
      setActiveGroup(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating group');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/groups/join', { inviteId: groupFormData.inviteId });
      setGroups([res.data.group, ...groups]);
      setShowJoinGroup(false);
      setGroupFormData({ name: '', description: '', inviteId: '' });
      setActiveGroup(res.data.group);
    } catch (err) {
      alert(err.response?.data?.message || 'Error joining group');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts(1, true);
  };

  const loadMore = () => {
    if (page < totalPages) fetchPosts(page + 1);
  };

  const handlePostCreated = (newPost) => setPosts([newPost, ...posts]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1300px] mx-auto px-4 lg:px-8 py-8">
      {/* Left Column: Feed */}
      <div className="flex-1 w-full max-w-[700px] mx-auto lg:mx-0">
        {!user && <GuestBanner />}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          
          <form onSubmit={handleSearch} className="w-full md:w-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by keywords..."
              className="w-full md:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        {user && <CreatePost onPostCreated={handlePostCreated} />}

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
            <button 
              onClick={() => setFeedType('global')}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${feedType === 'global' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Users size={16} /> Global Hub
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
             <Sparkles size={12} className="text-indigo-500" /> Professional Broadcast
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="posts-list space-y-4">
            {posts.map(post => <PostCard key={post._id} post={post} />)}
            {page < totalPages && (
              <button onClick={loadMore} disabled={loadingMore} className="w-full py-5 bg-white border border-slate-100 rounded-[2rem] text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                {loadingMore ? 'Syncing...' : 'Load Older Insights'}
              </button>
            )}
            {posts.length === 0 && (
              <div className="text-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 italic">
                <p className="text-slate-400 font-black text-lg">No sessions found.</p>
                <p className="text-slate-300 text-sm mt-1">Be the one to start the conversation.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Community Hub */}
      <div className="w-full lg:w-[350px] shrink-0">
        {user ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm h-fit sticky top-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                 <Users className="text-indigo-600" /> Communities
               </h3>
               <div className="flex gap-2">
                  <button onClick={() => setShowJoinGroup(true)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all border border-slate-100" title="Join by ID">
                    <Hash size={18} />
                  </button>
                  <button onClick={() => setShowCreateGroup(true)} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100" title="Create Group">
                    <Plus size={18} />
                  </button>
               </div>
            </div>

            {/* Modal: Create Group */}
            {showCreateGroup && (
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-indigo-100 animate-in fade-in zoom-in duration-200">
                <h4 className="font-black text-indigo-600 uppercase text-[10px] tracking-widest mb-4">Start New Community</h4>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <input 
                    type="text" placeholder="Group Name" 
                    className="w-full p-4 bg-white rounded-xl border-none outline-none font-bold text-sm shadow-sm"
                    value={groupFormData.name}
                    onChange={(e) => setGroupFormData({...groupFormData, name: e.target.value})}
                    required
                  />
                  <textarea 
                     placeholder="What's this community about?" 
                     className="w-full p-4 bg-white rounded-xl border-none outline-none font-medium text-xs shadow-sm resize-none h-20"
                     value={groupFormData.description}
                     onChange={(e) => setGroupFormData({...groupFormData, description: e.target.value})}
                  />
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs hover:bg-slate-900 transition-all">Create</button>
                    <button type="button" onClick={() => setShowCreateGroup(false)} className="px-4 py-3 bg-slate-200 text-slate-500 rounded-xl font-black text-xs">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Modal: Join Group */}
            {showJoinGroup && (
              <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
                <h4 className="font-black text-indigo-600 uppercase text-[10px] tracking-widest mb-4">Join by Invite ID</h4>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <input 
                    type="text" placeholder="Paste ID here..." 
                    className="w-full p-4 bg-white rounded-xl border-none outline-none font-black text-sm shadow-sm"
                    value={groupFormData.inviteId}
                    onChange={(e) => setGroupFormData({...groupFormData, inviteId: e.target.value})}
                    required
                  />
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs hover:bg-slate-900">Join</button>
                    <button type="button" onClick={() => setShowJoinGroup(false)} className="px-4 py-3 bg-slate-200 text-slate-500 rounded-xl font-black text-xs">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Active Connections ({groups.length})</p>
              {groups.map(g => (
                <button 
                  key={g._id}
                  onClick={() => setActiveGroup(g)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeGroup?._id === g._id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${activeGroup?._id === g._id ? 'bg-white/20' : 'bg-white text-indigo-600 shadow-sm'}`}>
                      {g.name[0]}
                    </div>
                    <span className="font-black text-sm truncate">{g.name}</span>
                  </div>
                </button>
              ))}
              {groups.length === 0 && (
                <div className="text-center py-8">
                   <p className="text-slate-400 font-bold text-xs italic">No communities joined yet.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-50">
               <div className="bg-slate-900 rounded-[1.5rem] p-6 text-white relative overflow-hidden group/card cursor-default">
                  <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover/card:text-indigo-500/10 transition-colors" />
                  <h4 className="font-black text-lg mb-2">Network Security</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed">Identity-first verification ensures all community dialogues remain professional and academic.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm text-center">
             <h3 className="font-black text-slate-800 mb-2">Academic Professionalism</h3>
             <p className="text-slate-500 text-sm font-medium mb-6">Create an account to join subject-specific dialogue circles.</p>
             <button onClick={() => window.location.href='/register'} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">Join CampusBridge</button>
          </div>
        )}
      </div>

      {/* Community Chat Drawer */}
      {activeGroup && (
        <CommunityChat 
           group={activeGroup} 
           onClose={() => setActiveGroup(null)} 
        />
      )}
    </div>
  );
};

export default FeedPage;
