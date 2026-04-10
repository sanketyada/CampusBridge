import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ResourcePage from './pages/ResourcePage';
import AIChatPage from './pages/AIChatPage';
import MentorshipPage from './pages/MentorshipPage';
import ProfilePage from './pages/ProfilePage';
import { LogOut, Home as HomeIcon, MessageSquare, BookOpen, Bot, LogIn, Menu, X } from 'lucide-react';
import api, { API_BASE_URL } from './services/api';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Internal Layout Logic
const LayoutContent = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const NavLinks = () => (
    <div className="flex flex-col gap-2">
      <Link to="/" className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold">
        <HomeIcon size={20} /> Feed
      </Link>
      <Link to="/resources" className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold">
        <BookOpen size={20} /> Resources
      </Link>
      <Link to="/mentorship" className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold">
        <MessageSquare size={20} /> Mentorship
      </Link>
      <Link to="/ai-assistant" className="flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold">
        <Bot size={20} /> AI Assistant
      </Link>
    </div>
  );

  const UserSection = () => (
    <div className="mt-auto pt-6 border-t border-slate-100">
      {user ? (
        <>
          <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 overflow-hidden border border-indigo-100 group-hover:border-indigo-300">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_BASE_URL}${user.profilePicture}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                user.name?.[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">View Profile</p>
            </div>
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl font-bold mt-4">
            <LogOut size={20} /> Logout
          </button>
        </>
      ) : (
        <Link to="/login" className="flex items-center gap-3 p-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
          <LogIn size={20} /> Login
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 🟢 Desktop Sidebar */}
      <nav className="desktop-sidebar bg-white border-r border-slate-200 p-6 hidden lg:flex flex-col z-30">
        <h1 className="text-2xl font-black text-indigo-600 mb-8 italic">CampusBridge</h1>
        <NavLinks />
        <UserSection />
      </nav>

      {/* 🔵 Mobile Topbar */}
      <div className="mobile-topbar z-40">
        <h1 className="text-xl font-black text-indigo-600 italic">CampusBridge</h1>
        <button onClick={() => setIsMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* 🔴 Mobile Sidebar Drawer */}
      <div className={`overlay ${isMenuOpen ? 'visible' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
      <div className={`mobile-sidebar-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-indigo-600 italic">CampusBridge</h1>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <X size={24} />
          </button>
        </div>
        <NavLinks />
        <div className="mt-8">
          <UserSection />
        </div>
      </div>

      {/* 🟡 Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LayoutContent><FeedPage /></LayoutContent>} />
          <Route path="/resources" element={<LayoutContent><ResourcePage /></LayoutContent>} />
          <Route path="/mentorship" element={<LayoutContent><MentorshipPage /></LayoutContent>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><LayoutContent><AIChatPage /></LayoutContent></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><LayoutContent><ProfilePage /></LayoutContent></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
