import { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from './PostCard.jsx';
import Header from './Header.jsx';
import { useUser } from '../context/useUser';
import { useAllPosts } from '../context/useAllPosts';
import PostFilterBar from './PostFilterBar.jsx';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const { token } = useUser();
  const { allPosts, fetchAllPosts, loadingAllPosts, error } = useAllPosts();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const [category, setCategory] = useState('All posts');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Add startEdit function
  const startEdit = (post) => {
    navigate(`/edit/${post._id}`);
  };

  useEffect(() => {
    if (token) fetchAllPosts();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllPosts();
    } catch {
      // error is handled in context fetch
    }
  };

  // Filter posts by category and search
  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = category === 'All posts' || post.category === category;
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Paginate filteredPosts
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200">
      <Header />
      <div className="max-w-4xl mx-auto -mt-4 pb-8 px-2 sm:px-0">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-purple-700">All User Vlogs</h2>
          </div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
        </div>
        <PostFilterBar
          activeCategory={category}
          onCategoryChange={cat => { setCategory(cat); setCurrentPage(1); }}
          searchValue={search}
          onSearchChange={val => { setSearch(val); setCurrentPage(1); }}
        />
        <div className="space-y-6">
          {loadingAllPosts ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-0 mb-6 overflow-hidden animate-pulse">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-56 h-56 bg-gray-200 flex items-center justify-center sm:rounded-l-xl sm:rounded-tr-none rounded-t-xl mb-4 sm:mb-0" />
                  <div className="flex-1 flex flex-col p-6">
                    <div className="h-6 w-1/2 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-4" />
                    <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
                    <div className="flex gap-4 mt-auto">
                      <div className="h-8 w-20 bg-gray-200 rounded-full" />
                      <div className="h-8 w-20 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            paginatedPosts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
                onEdit={startEdit}
                isAdmin={true}
              />
            ))
          )}
          {!loadingAllPosts && filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No vlogs found.</p>
            </div>
          )}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-full border font-semibold shadow-sm transition mx-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 