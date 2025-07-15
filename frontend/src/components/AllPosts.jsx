import { useEffect, useState } from 'react';
import { useAllPosts } from '../context/useAllPosts';
import Header from './Header';
import PostCard from './PostCard';
import { useUser } from '../context/useUser';
import { useNavigate } from 'react-router-dom';
import PostFilterBar from './PostFilterBar';

const CATEGORIES = [
  'All posts',
  'General',
  'Web Design',
  'Development',
  'Database',
];

export default function AllPosts() {
  const { allPosts, fetchAllPosts, loadingAllPosts, error } = useAllPosts();
  const { token } = useUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All posts');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    if (token) fetchAllPosts();
  }, [token]);

  // Filter by category and search
  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = category === 'All posts' || post.category === category;
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <Header />
      <div className="max-w-4xl mx-auto pb-8 px-2 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">All Vlogs</h2>
          <button
            onClick={() => navigate('/user')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-indigo-700 transition-all duration-300"
          >
            My Vlogs
          </button>
        </div>
        <PostFilterBar
          categories={CATEGORIES}
          activeCategory={category}
          onCategoryChange={setCategory}
          searchValue={search}
          onSearchChange={setSearch}
        />
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
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
              <PostCard key={post._id} post={post} />
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