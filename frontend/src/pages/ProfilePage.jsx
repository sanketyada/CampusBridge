import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Edit3, Save, User, FileText } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';
import { ProfileSkeleton } from '../components/Skeleton';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(!!userId);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isOwnProfile = !userId || String(userId) === String(authUser?._id);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (!authUser) return;

    if (isOwnProfile) {
      setProfileUser(authUser);
      setBio(authUser.bio || '');
      setProfileError('');
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    setProfileError('');
    api
      .get(`/users/${userId}`)
      .then((res) => {
        if (!cancelled) {
          setProfileUser(res.data);
          setBio(res.data.bio || '');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfileError('This profile could not be loaded.');
          setProfileUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, authUser, isOwnProfile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isOwnProfile) return;
    try {
      setLoading(true);
      const res = await api.put('/users/profile', { bio });
      localStorage.setItem('user', JSON.stringify({ ...authUser, bio: res.data.bio }));
      setProfileUser((prev) => ({ ...prev, bio: res.data.bio }));
      setSuccessMsg('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await api.post('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = { ...authUser, profilePicture: res.data.profilePicture };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileUser(updatedUser);
      setSuccessMsg('Profile picture updated!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Upload failed. Images only, max 2MB.');
    } finally {
      setUploading(false);
    }
  };

  if (!authUser) return <ProfileSkeleton />;
  if (profileLoading) {
    return (
      <div className="flex justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }
  if (profileError || !profileUser) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <p className="text-slate-600 font-bold mb-4">{profileError || 'Profile not found.'}</p>
        <Link to="/" className="text-indigo-600 font-bold hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {successMsg && (
        <div className="fixed top-24 right-8 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
          {successMsg}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 mt-8 text-center md:text-left">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white p-2 shadow-xl">
              {profileUser.profilePicture ? (
                <img
                  src={
                    profileUser.profilePicture.startsWith('http')
                      ? profileUser.profilePicture
                      : `${API_BASE_URL}${profileUser.profilePicture}`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-indigo-50 flex items-center justify-center text-4xl font-black text-indigo-600 uppercase">
                  {profileUser.name?.[0]}
                </div>
              )}
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all">
                <Camera size={18} />
                <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-black text-slate-800">{profileUser.name}</h1>
            <p className="text-indigo-600 font-bold uppercase tracking-widest text-xs mt-1">{profileUser.role}</p>
            {profileUser.department && (
              <p className="text-slate-500 text-sm font-bold mt-1">
                {profileUser.department}
                {profileUser.yearOfStudy ? ` · Year ${profileUser.yearOfStudy}` : ''}
              </p>
            )}
            {profileUser.role === 'alumni' && profileUser.company && (
              <p className="text-slate-600 text-sm font-medium mt-2">{profileUser.company}</p>
            )}
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mb-2 px-6 py-2 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              {isEditing ? 'Cancel' : (
                <>
                  <Edit3 size={18} /> Edit Profile
                </>
              )}
            </button>
          )}
        </div>

        <div className="mt-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">About</h3>
          {isOwnProfile && isEditing ? (
            <form onSubmit={handleUpdateProfile}>
              <textarea
                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-600 outline-none transition-all text-slate-700 min-h-[150px]"
                placeholder="Tell us about your academic journey or professional goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <Save size={18} /> {loading ? 'Saving...' : 'Save Bio'}
              </button>
            </form>
          ) : (
            <p className="text-slate-600 text-lg leading-relaxed italic">
              {profileUser.bio ||
                (isOwnProfile
                  ? 'No bio added yet. Click edit to share something about yourself!'
                  : 'No bio yet.')}
            </p>
          )}
        </div>

        {profileUser.role === 'alumni' && profileUser.achievements && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Achievements</h3>
            <p className="text-slate-600 leading-relaxed">{profileUser.achievements}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Contributions</h2>
          </div>
          <p className="text-slate-400 italic">
            {isOwnProfile
              ? 'Coming soon: your posts and shared resources listed here.'
              : 'Shared materials and doubts from this member will appear here in a future update.'}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Campus role</h2>
          </div>
          <p className="text-slate-600 font-medium capitalize">{profileUser.role}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
