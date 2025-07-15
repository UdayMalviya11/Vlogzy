import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { useEffect, useState } from 'react';
import PostCard from './components/PostCard';
import VlogDetail from './components/VlogDetail';
import AllPosts from './components/AllPosts';

function Popular() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPopular = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/posts/popular');
        const data = await res.json();
        setPosts(data);
        setCurrentPage(1); // Reset to first page on fetch
      } catch {
        setError('Failed to load popular vlogs');
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100">
      <Header />
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-4">🔥 Popular Vlogs</h1>
        <p className="text-lg text-gray-700 mb-8">These are the most liked vlogs on Vlogzy!</p>
        {error && <div className="text-red-500">{error}</div>}
        <div className="space-y-6 text-left">
          {loading ? (
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
          {!loading && posts.length === 0 && (
            <div className="text-gray-500 py-8">No popular vlogs yet.</div>
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
                className={`px-4 py-2 rounded-full border font-semibold shadow-sm transition mx-1 focus:outline-none focus:ring-2 focus:ring-orange-400 ${currentPage === i + 1 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/popular" element={<Popular />} />
        <Route path="/vlog/:id" element={<VlogDetail />} />
        <Route path="/" element={<ProtectedRoute><AllPosts /></ProtectedRoute>} />
        <Route 
          path="/user" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
