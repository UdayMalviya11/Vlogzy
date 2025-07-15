import { FiSearch, FiFilter } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export default function PostFilterBar({
  categories = [
    'All posts',
    'General',
    'Web Design',
    'Development',
    'Database',
  ],
  activeCategory = 'All posts',
  onCategoryChange,
  searchValue = '',
  onSearchChange,
  filterValue = 'Latest',
  onFilterChange,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="flex items-center bg-white rounded-full shadow px-4 py-2 gap-2 w-full md:w-auto mb-6">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onCategoryChange && onCategoryChange(cat)}
          className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-blue-700 text-white' : 'bg-transparent text-black hover:bg-blue-100'}`}
        >
          {cat}
        </button>
      ))}
      <span className="mx-2 hidden md:inline-block border-l h-6 border-gray-300" />
      <div className="relative ml-auto" style={{ flex: 1, maxWidth: '16rem' }}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiSearch /></span>
        <input
          type="text"
          value={searchValue}
          onChange={e => onSearchChange && onSearchChange(e.target.value)}
          placeholder="search a post..."
          className="pl-10 pr-4 py-2 rounded-full bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full"
        />
      </div>
      <div className="relative ml-2" ref={dropdownRef}>
        <button
          type="button"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
          onClick={() => setDropdownOpen(v => !v)}
        >
          <FiFilter className="text-xl text-gray-500" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              className={`block w-full text-left px-4 py-2 hover:bg-blue-50 rounded-t-lg ${filterValue === 'Latest' ? 'font-bold text-blue-700' : 'text-gray-700'}`}
              onClick={() => { onFilterChange && onFilterChange('Latest'); setDropdownOpen(false); }}
            >
              Latest
            </button>
            <button
              className={`block w-full text-left px-4 py-2 hover:bg-blue-50 rounded-b-lg ${filterValue === 'Oldest' ? 'font-bold text-blue-700' : 'text-gray-700'}`}
              onClick={() => { onFilterChange && onFilterChange('Oldest'); setDropdownOpen(false); }}
            >
              Oldest
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 