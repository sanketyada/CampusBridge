import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const GuestBanner = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-6 lg:p-8 text-white mb-8 shadow-xl shadow-indigo-100 relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h2 className="text-xl lg:text-2xl font-black flex items-center justify-center md:justify-start gap-2 mb-2">
            Welcome to CampusBridge <Sparkles className="text-amber-300" />
          </h2>
          <p className="text-indigo-100 font-medium">Join the community to upload resources, interact with mentors, and share your journey.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/register" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black hover:bg-slate-50 transition-all flex items-center gap-2">
            Join Now <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="bg-indigo-500 text-white border border-indigo-400 px-6 py-3 rounded-xl font-black hover:bg-indigo-400 transition-all">
            Login
          </Link>
        </div>
      </div>
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
    </div>
  );
};

export default GuestBanner;
