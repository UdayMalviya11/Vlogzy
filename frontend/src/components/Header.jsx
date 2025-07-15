import { useUser } from '../context/useUser';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="mt-4 md:mt-0">
          {token ? (
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/popular')}
                className="text-orange-600 font-semibold hover:underline"
              >
                Popular
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="text-red-600 font-semibold hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => navigate('/login')} className="text-indigo-700 font-semibold hover:underline">Login</button>
              <button onClick={() => navigate('/register')} className="text-indigo-700 font-semibold hover:underline">Register</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 