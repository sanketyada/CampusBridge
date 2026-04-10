import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Upload, Filter, BookOpen } from 'lucide-react';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';
import UploadResource from '../components/UploadResource';
import GuestBanner from '../components/GuestBanner';
import '../assets/Resources.css';

const ResourcePage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

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

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         res.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || res.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {!user && <GuestBanner />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-4">
            Resource Hub <BookOpen className="text-indigo-600" size={32} />
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Verified academic materials shared by the community</p>
        </div>
        
        {user && (
          <button 
            onClick={() => setShowUpload(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-xl shadow-indigo-100"
          >
            <Upload size={20} /> Contribute a Resource
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by title, subject or tags..." 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              className="pl-12 pr-8 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-bold appearance-none cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Notes">Notes</option>
              <option value="Previous Papers">Previous Papers</option>
              <option value="Guides">Guides</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {user && !showUpload && filteredResources.length > 0 && (
            <div 
              onClick={() => setShowUpload(true)}
              className="group border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
            >
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload size={28} />
              </div>
              <h3 className="font-bold text-slate-800">Add New Material</h3>
              <p className="text-sm text-slate-400 mt-1">Share your knowledge with others</p>
            </div>
          )}

          {filteredResources.map(resource => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
          
          {filteredResources.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-bold text-lg">No resources found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {showUpload && <UploadResource onClose={() => { setShowUpload(false); fetchResources(); }} />}
    </div>
  );
};

export default ResourcePage;
