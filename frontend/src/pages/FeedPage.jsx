import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import MentorSidebar from '../components/MentorSidebar';
import GuestBanner from '../components/GuestBanner';
import { TrendingUp, Clock, ChevronDown } from 'lucide-react';
import '../assets/Feed.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts(1, true);
  }, [sort]);

  const fetchPosts = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await api.get(`/posts?sort=${sort}&page=${pageNum}&limit=5`);
      
      if (isInitial) {
        setPosts(res.data.posts);
      } else {
        setPosts([...posts, ...res.data.posts]);
      }
      
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (page < totalPages) {
      fetchPosts(page + 1);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1200px] mx-auto px-4 lg:px-8">
      <div className="flex-1 w-full max-w-[650px] mx-auto py-8">
        {!user && <GuestBanner />}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Knowledge Feed</h1>
            <p className="text-slate-500">Insights from campus mentors</p>
          </div>
        </div>

        {user && <CreatePost onPostCreated={handlePostCreated} />}

        {/* Filters / Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button 
            onClick={() => setSort('latest')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${sort === 'latest' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            <Clock size={18} /> Latest
          </button>
          <button 
            onClick={() => setSort('trending')}
            className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all border-b-2 ${sort === 'trending' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
          >
            <TrendingUp size={18} /> Trending
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
            
            {page < totalPages && (
              <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {loadingMore ? 'Loading...' : (
                  <>
                    <ChevronDown size={20} />
                    Load More Posts
                  </>
                )}
              </button>
            )}

            {posts.length === 0 && (
              <div className="text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400">No posts found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <MentorSidebar />
    </div>
  );
};

export default FeedPage;
