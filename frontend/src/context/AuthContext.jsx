import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify token with backend
          // const res = await api.get('/auth/me');
          // setUser(res.data);
        } catch (err) {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/login', userData);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
