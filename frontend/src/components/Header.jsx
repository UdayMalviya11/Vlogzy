import { useUser } from '../context/useUser';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

const CATEGORIES = [
  'All posts',
  'Web Design',
  'Development',
  'Database',
  'Search Engines',
  'Marketing',
];

export default function Header() {
  const { token, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="bg-white shadow mb-8">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-indigo-700 cursor-pointer mb-4 md:mb-0" onClick={() => navigate('/')}>Vlogzy</h1>
        <div className="mt-2 md:mt-0 w-full md:w-auto">
          {token ? (
            <div className="flex flex-col md:flex-row gap-2 md:gap-8 w-full md:w-auto">
              {location.pathname === '/popular' ? (
                <button
                  onClick={() => navigate('/')}
                  className="text-indigo-700 font-semibold hover:underline py-2 px-4 rounded-lg w-full md:w-auto text-base md:text-sm"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate('/popular')}
                  className="text-orange-600 font-semibold hover:underline py-2 px-4 rounded-lg w-full md:w-auto text-base md:text-sm"
                >
                  Popular
                </button>
              )}
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-red-600 font-semibold hover:underline py-2 px-4 rounded-lg w-full md:w-auto text-base md:text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <button onClick={() => navigate('/login')} className="text-indigo-700 font-semibold hover:underline py-2 px-4 rounded-lg w-full md:w-auto text-base md:text-sm">Login</button>
              <button onClick={() => navigate('/register')} className="text-indigo-700 font-semibold hover:underline py-2 px-4 rounded-lg w-full md:w-auto text-base md:text-sm">Register</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 