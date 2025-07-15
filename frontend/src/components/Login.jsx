import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/useUser';

const API_URL = import.meta.env.VITE_API_URL;
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.data.valid) {
            const role = response.data.user.role;
            if (role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/user');
            }
          } else {
            localStorage.removeItem('token');
          }
        } catch {
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password });
      login(res.data.user, res.data.token); // Use context login
      const role = res.data.user?.role;
      if (role === 'admin' && isAdmin) {
        navigate('/admin');
      } else if (role === 'user' && !isAdmin) {
        navigate('/user');
      } else {
        setError('Invalid credentials or role mismatch');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-8 sm:p-10">
        <h2 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center tracking-tight">Sign in to Vlogzy</h2>
        <div className="flex justify-center mb-6 gap-2">
          <button
            className={`px-6 py-2 rounded-l-lg font-semibold transition-colors duration-200 ${!isAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setIsAdmin(false)}
          >
            User
          </button>
          <button
            className={`px-6 py-2 rounded-r-lg font-semibold transition-colors duration-200 ${isAdmin ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setIsAdmin(true)}
          >
            Admin
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg font-semibold text-lg shadow-md hover:scale-105 transition">Sign In</button>
          {error && <div className="text-red-500 text-center font-medium mt-2">{error}</div>}
        </form>
        <div className="my-6 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-600 underline font-semibold hover:text-indigo-800 transition">Register</Link>
        </div>
      </div>
    </div>
  );
} 