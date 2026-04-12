import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Megaphone, ShieldAlert, Trash2, Ban, CheckCircle, Search, Filter } from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Announcement Form State
  const [announcement, setAnnouncement] = useState({ title: '', message: '', targetAudience: 'all', type: 'announcement' });
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      let endpoint = `/users/${userId}/${action}`;
      if (action === 'delete') {
        await api.delete(`/users/${userId}`);
      } else {
        await api.put(endpoint);
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    setAnnouncementLoading(true);
    setAnnouncementSuccess(false);
    try {
      await api.post('/notifications', announcement);
      setAnnouncementSuccess(true);
      setAnnouncement({ title: '', message: '', targetAudience: 'all', type: 'announcement' });
      setTimeout(() => setAnnouncementSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-800">Admin Command Center</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Manage campus citizens and broadcast important updates</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col items-center min-w-[120px]">
            <span className="text-3xl font-black">{users.length}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Total Users</span>
          </div>
          <div className="bg-rose-500 text-white p-6 rounded-3xl shadow-xl shadow-rose-100 flex flex-col items-center min-w-[120px]">
            <span className="text-3xl font-black">{users.filter(u => u.isBlocked || u.isBanned).length}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">Moderated</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Broadcast System */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-8">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <Megaphone className="text-indigo-600" /> Broadcast
            </h3>
            
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Audience</label>
                <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700"
                  value={announcement.targetAudience}
                  onChange={(e) => setAnnouncement({...announcement, targetAudience: e.target.value})}
                >
                  <option value="all">Everyone</option>
                  <option value="students">Students only</option>
                  <option value="faculty">Faculty only</option>
                  <option value="alumni">Alumni only</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Type</label>
                <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700"
                  value={announcement.type}
                  onChange={(e) => setAnnouncement({...announcement, type: e.target.value})}
                >
                  <option value="announcement">Announcement</option>
                  <option value="notice">Official Notice</option>
                  <option value="alert">Urgent Alert</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</label>
                <input 
                  type="text"
                  placeholder="Subject of broadcast..."
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700"
                  value={announcement.title}
                  onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Message</label>
                <textarea 
                  placeholder="What is the update?"
                  className="w-full min-h-[120px] p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-slate-700 resize-none"
                  value={announcement.message}
                  onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={announcementLoading}
                className={`w-full py-4 rounded-2xl font-black transition-all shadow-xl ${announcementSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {announcementLoading ? 'Sending...' : announcementSuccess ? <span className="flex items-center justify-center gap-2"><CheckCircle size={20} /> Broadcasted!</span> : 'Send Broadcast'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: User Management Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <Users className="text-indigo-600" /> Citizen Management
              </h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search users..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-50">
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600">
                             {u.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400 ">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                          u.role === 'admin' ? 'bg-rose-100 text-rose-600' :
                          u.role === 'faculty' ? 'bg-amber-100 text-amber-600' :
                          u.role === 'alumni' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-6">
                        {u.isBanned ? (
                           <span className="flex items-center gap-1 text-rose-500 font-bold text-xs"><Ban size={14} /> Banned</span>
                        ) : u.isBlocked ? (
                           <span className="flex items-center gap-1 text-amber-500 font-bold text-xs"><ShieldAlert size={14} /> Blocked</span>
                        ) : (
                           <span className="flex items-center gap-1 text-emerald-500 font-bold text-xs"><CheckCircle size={14} /> Active</span>
                        )}
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {u.role !== 'admin' && (
                            <>
                              <button 
                                onClick={() => handleUserAction(u._id, u.isBlocked ? 'unblock' : 'block')}
                                className={`p-2 rounded-lg transition-all ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                                title={u.isBlocked ? "Unblock User" : "Block User"}
                              >
                                {u.isBlocked ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
                              </button>
                              <button 
                                onClick={() => handleUserAction(u._id, 'ban')}
                                className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"
                                title="Ban User"
                              >
                                <Ban size={18} />
                              </button>
                              <button 
                                onClick={() => handleUserAction(u._id, 'delete')}
                                className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all"
                                title="Delete User"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {loading && (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
              
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12">
                   <p className="text-slate-400 font-bold">No citizens found matching search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
