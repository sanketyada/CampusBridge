import { useState } from 'react';
import { Ghost, Send } from 'lucide-react';
import api from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      const res = await api.post('/posts', { content, isAnonymous });
      onPostCreated(res.data);
      setContent('');
      setIsAnonymous(false);
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Share an insight, ask a career question, or seek advice..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="create-post-footer">
          <div 
            className="toggle-group"
            onClick={() => setIsAnonymous(!isAnonymous)}
          >
            <Ghost size={18} color={isAnonymous ? '#6366f1' : '#94a3b8'} />
            <span style={{ color: isAnonymous ? '#6366f1' : '#64748b' }}>
              Post Anonymously
            </span>
          </div>
          <button className="post-btn" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
