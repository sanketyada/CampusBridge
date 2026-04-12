import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import '../assets/Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'BCA',
    yearOfStudy: 1,
    company: '',
    achievements: ''
  });
  
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card max-w-lg"
      >
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the CampusBridge ecosystem</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="name"
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email"
                placeholder="john@university.edu" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label>I am a...</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="alumni">Alumni / Professional</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department</label>
              <select name="department" value={formData.department} onChange={handleChange}>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="BCOM">B.COM</option>
                <option value="BSC">B.SC</option>
                <option value="BA">B.A</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
                <option value="MSC">M.SC</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="form-group">
              <label>Year of Study</label>
              <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange}>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          )}

          {formData.role === 'alumni' && (
            <>
              <div className="form-group">
                <label>Current Company</label>
                <input 
                  type="text" 
                  name="company"
                  placeholder="e.g. Google, Microsoft" 
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Key Achievements</label>
                <textarea 
                  name="achievements"
                  placeholder="Tell us about your professional milestones..." 
                  value={formData.achievements}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200"
                />
              </div>
            </>
          )}

          <button className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
