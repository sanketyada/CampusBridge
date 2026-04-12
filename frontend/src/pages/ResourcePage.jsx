import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Upload, BookOpen, ChevronLeft, Download, FileText, Sparkles, Brain, HelpCircle, FileDown, ThumbsUp, MessageCircle, Share2, User } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import UploadResource from '../components/UploadResource';
import GuestBanner from '../components/GuestBanner';
import html2pdf from 'html2pdf.js';
import '../assets/Resources.css';

const ResourcePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const resourceQuery = searchParams.get('resource');

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  
  const [selectedResource, setSelectedResource] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState({ title: '', content: '' });
  const [commentText, setCommentText] = useState('');
  const [shareHint, setShareHint] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (!resourceQuery || !user) return;
    let cancelled = false;
    api
      .get(`/resources/${resourceQuery}`)
      .then((res) => {
        if (!cancelled) setSelectedResource(res.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [resourceQuery, user]);

  useEffect(() => {
    if (!selectedResource?._id || !resourceQuery) return;
    const id = requestAnimationFrame(() => {
      document.getElementById('resource-detail-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedResource?._id, resourceQuery]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resources');
      setResources(res.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (type) => {
    if (!selectedResource) return;
    setAiLoading(true);
    setAiResult({ title: '', content: '' });
    
    try {
      // For demo purposes, we simulate context from the resource title/subject
      // In a real app, we'd send the PDF text content or prompt
      const context = `Resource: ${selectedResource.title} for ${selectedResource.subject}`;
      let endpoint = '';
      let title = '';

      switch (type) {
        case 'summary': 
          endpoint = '/ai/generate-summary'; 
          title = 'AI Summary';
          break;
        case 'notes': 
          endpoint = '/ai/generate-notes'; 
          title = 'Study Notes';
          break;
        case 'questions': 
          endpoint = '/ai/generate-questions'; 
          title = 'Practice Questions';
          break;
        case 'mindmap': 
          endpoint = '/ai/generate-mindmap'; 
          title = 'Mind Map Structure';
          break;
      }

      const res = await api.post(endpoint, { content: context });
      setAiResult({ title, content: res.data.result });
    } catch (err) {
      console.error('AI Generation error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('ai-content-area');
    const opt = {
      margin: 1,
      filename: `${aiResult.title}_${selectedResource.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const closeDetail = () => {
    setSelectedResource(null);
    setAiResult({ title: '', content: '' });
    setCommentText('');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('resource');
      return next;
    }, { replace: true });
  };

  const hasUpvotedDetail = useMemo(() => {
    const ids = selectedResource?.upvotes;
    if (!user || !Array.isArray(ids)) return false;
    return ids.some((id) => id === user._id || id?.toString?.() === user._id?.toString?.());
  }, [user, selectedResource?.upvotes]);

  const handleResourceUpvote = async () => {
    if (!user || !selectedResource) return;
    try {
      const res = await api.put(`/resources/${selectedResource._id}/upvote`);
      setSelectedResource((prev) => ({ ...prev, upvotes: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResourceShare = async () => {
    if (!selectedResource) return;
    const url = `${window.location.origin}/resources?resource=${selectedResource._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: selectedResource.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareHint('Link copied');
        setTimeout(() => setShareHint(''), 2000);
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          setShareHint('Link copied');
          setTimeout(() => setShareHint(''), 2000);
        } catch (_) {
          setShareHint('Could not copy link');
          setTimeout(() => setShareHint(''), 2000);
        }
      }
    }
    if (!user) return;
    try {
      const res = await api.put(`/resources/${selectedResource._id}/share`);
      setSelectedResource((prev) => ({ ...prev, shares: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResourceComment = async (e) => {
    e.preventDefault();
    if (!user || !selectedResource || !commentText.trim()) return;
    try {
      const res = await api.post(`/resources/${selectedResource._id}/comment`, { text: commentText });
      setSelectedResource((prev) => ({ ...prev, comments: res.data }));
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not post comment');
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || res.category === category;
    return matchesSearch && matchesCategory;
  });

  if (selectedResource) {
    const fileHref = selectedResource.fileUrl?.startsWith('http')
      ? selectedResource.fileUrl
      : `${API_BASE_URL}${selectedResource.fileUrl}`;
    const uploader = selectedResource.user;
    const upvoteCount = Array.isArray(selectedResource.upvotes) ? selectedResource.upvotes.length : 0;
    const shareCount = Array.isArray(selectedResource.shares) ? selectedResource.shares.length : 0;

    return (
      <div id="resource-detail-anchor" className="p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col scroll-mt-24">
        <button 
          type="button"
          onClick={closeDetail}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 mb-6 transition-all"
        >
          <ChevronLeft size={20} /> Back to Library
        </button>

        <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
          {/* Left Side: Resource Info */}
          <div className="w-full lg:w-1/3 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm self-start">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${selectedResource.category === 'Notes' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">{selectedResource.title}</h2>
            <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-4">{selectedResource.category} • {selectedResource.subject}</p>

            {uploader && (
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-indigo-600 font-black">
                  {uploader.profilePicture ? (
                    <img
                      src={uploader.profilePicture.startsWith('http') ? uploader.profilePicture : `${API_BASE_URL}${uploader.profilePicture}`}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded by</p>
                  <Link to={`/profile/${uploader._id}`} className="font-black text-slate-800 hover:text-indigo-600 truncate block">
                    {uploader.name}
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                type="button"
                onClick={handleResourceUpvote}
                disabled={!user}
                className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest ${hasUpvotedDetail ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'} disabled:opacity-40`}
              >
                <ThumbsUp size={18} fill={hasUpvotedDetail ? 'currentColor' : 'none'} />
                {upvoteCount} likes
              </button>
              <span className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest">
                <MessageCircle size={18} />
                {selectedResource.comments?.length ?? 0} comments
              </span>
              <button
                type="button"
                onClick={handleResourceShare}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-black text-xs uppercase tracking-widest"
              >
                <Share2 size={18} />
                {shareCount} shares
              </button>
            </div>
            {shareHint && <p className="text-xs font-bold text-indigo-600 mb-4">{shareHint}</p>}
            
            <div className="space-y-4 mb-8">
              <button 
                type="button"
                onClick={() => window.open(fileHref, '_blank')}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
              >
                <Download size={20} /> Download Original
              </button>
            </div>

            <div className="border-t border-slate-50 pt-6 mb-8">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <MessageCircle size={16} className="text-indigo-600" /> Discussion
              </h4>
              {user ? (
                <form onSubmit={handleResourceComment} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask a question about this resource..."
                    className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-indigo-100"
                  />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-3 rounded-xl font-black text-xs uppercase">
                    Post
                  </button>
                </form>
              ) : (
                <p className="text-slate-400 text-sm font-medium mb-4">Sign in to join the discussion.</p>
              )}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {(selectedResource.comments || []).map((c, i) => (
                  <div key={c._id || i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight mb-1">{c.name || c.user?.name || 'Member'}</p>
                    <p className="text-sm text-slate-700 font-medium">{c.text}</p>
                  </div>
                ))}
                {(!selectedResource.comments || selectedResource.comments.length === 0) && (
                  <p className="text-slate-400 text-sm italic">No comments yet.</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-50 pt-8">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-tight mb-4 flex items-center gap-2">
                 <Sparkles size={16} className="text-indigo-600" /> AI Accelerator
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleGenerateAI('summary')} className="p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center flex flex-col items-center gap-2">
                  <FileText size={20} /> Summary
                </button>
                <button onClick={() => handleGenerateAI('notes')} className="p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center flex flex-col items-center gap-2">
                  <Brain size={20} /> Full Notes
                </button>
                <button onClick={() => handleGenerateAI('questions')} className="p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center flex flex-col items-center gap-2">
                  <HelpCircle size={20} /> Mock Quiz
                </button>
                <button onClick={() => handleGenerateAI('mindmap')} className="p-4 bg-slate-50 rounded-2xl text-slate-700 font-bold text-xs hover:bg-indigo-50 hover:text-indigo-600 transition-all text-center flex flex-col items-center gap-2">
                  <Sparkles size={20} /> Mind Map
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Content Area */}
          <div className="flex-1 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
              <h1 className="text-2xl font-black text-slate-800">{aiResult.title || 'Interactive Workspace'}</h1>
              {aiResult.content && (
                <button 
                  onClick={downloadPDF}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  <FileDown size={18} /> Export PDF
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  <p className="font-black animate-pulse uppercase tracking-widest text-xs">AI is thinking...</p>
                </div>
              ) : aiResult.content ? (
                <div id="ai-content-area" className="prose prose-slate max-w-none">
                   <h2 className="text-xl font-black mb-4">{aiResult.title}</h2>
                   <div className="whitespace-pre-wrap font-medium text-slate-600 leading-relaxed">
                      {aiResult.content}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                   <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
                      <Sparkles size={32} />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 mb-2">Enhance your learning</h3>
                   <p className="max-w-md text-slate-400 font-medium">Select an AI tool on the left to generate summaries, study notes, or mock questions from this resource.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full">
      {!user && <GuestBanner />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            Resource Library <BookOpen className="text-indigo-600" size={32} />
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">High-quality academic materials curated by your peers</p>
        </div>
        
        {user && (
          <button 
            onClick={() => setShowUpload(true)}
            className="group bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100"
          >
            <Upload size={20} className="group-hover:-translate-y-1 transition-transform" /> Share Material
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-12 bg-slate-100 p-2 rounded-3xl">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by title, subject or tags..." 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-[1.25rem] outline-none focus:border-indigo-600 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="px-8 py-4 bg-white border-2 border-transparent rounded-[1.25rem] outline-none focus:border-indigo-600 transition-all font-bold cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Notes">Notes</option>
            <option value="Assignment">Assignment</option>
            <option value="Previous Papers">Previous Papers</option>
            <option value="Guides">Guides</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map(resource => (
            <div key={resource._id} onClick={() => user && setSelectedResource(resource)} className="cursor-pointer">
              <ResourceCard resource={resource} />
            </div>
          ))}
          
          {filteredResources.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-bold text-lg">No materials found.</p>
            </div>
          )}
        </div>
      )}

      {showUpload && <UploadResource onUploadSuccess={() => { setShowUpload(false); fetchResources(); }} />}
    </div>
  );
};

export default ResourcePage;
