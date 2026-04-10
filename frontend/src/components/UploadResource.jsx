import { useState } from 'react';
import { Upload, FilePlus, X } from 'lucide-react';
import api from '../services/api';

const UploadResource = ({ onUploadSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Notes',
    subject: ''
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('subject', formData.subject);

    try {
      setLoading(true);
      const res = await api.post('/resources', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploadSuccess(res.data);
      setShowForm(false);
      setFile(null);
      setFormData({ title: '', category: 'Notes', subject: '' });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full bg-indigo-50 border-2 border-dashed border-indigo-200 p-8 rounded-2xl flex flex-col items-center gap-2 hover:bg-indigo-100 transition-all text-indigo-600 font-bold mb-8"
        >
          <FilePlus size={32} />
          <span>Contribute a Resource (Notes, Papers, Guides)</span>
        </button>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-100 mb-8 relative">
          <button 
            onClick={() => setShowForm(false)} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
          <h3 className="text-xl font-bold text-slate-800 mb-6">Upload New Resource</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Resource Title</label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="e.g. Data Structures Handbook" 
                  className="w-full p-3 border rounded-xl"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  placeholder="e.g. Computer Science" 
                  className="w-full p-3 border rounded-xl"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Category</label>
                <select 
                  name="category" 
                  className="w-full p-3 border rounded-xl font-medium"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Notes">Notes</option>
                  <option value="Previous Papers">Previous Papers</option>
                  <option value="Guides">Guides</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Select File (PDF, DOCX, Images)</label>
                <input 
                  type="file" 
                  className="w-full p-2 border rounded-xl bg-slate-50"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>
            <button 
              className="bg-indigo-600 text-white w-full p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
              disabled={loading}
            >
              <Upload size={18} />
              {loading ? 'Uploading...' : 'Publish Resource'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UploadResource;
