import { useState, useEffect } from 'react';
import PostCard from './PostCard.jsx';
import Header from './Header.jsx';
import { usePosts } from '../context/usePosts';
import { useUser } from '../context/useUser';
// import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PostFilterBar from './PostFilterBar.jsx';

export default function UserDashboard() {
  const { posts, loadingPosts, fetchPosts, error } = usePosts();
  const { token } = useUser();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editCategory, setEditCategory] = useState('General');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const [filter, setFilter] = useState('newest');

  useEffect(() => {
    if (token) fetchPosts(token);
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts(token);
    } catch {
      // handle error
    }
  };

  const startEdit = (post) => {
    setEditingId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImage(null);
    setEditCategory(post.category || 'General');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editTitle);
      formData.append('content', editContent);
      formData.append('category', editCategory);
      if (editImage) formData.append('image', editImage);
      await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${editingId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      setEditingId(null);
      setEditTitle('');
      setEditContent('');
      setEditImage(null);
      setEditCategory('General');
      fetchPosts(token);
    } catch {
      // handle error
    }
  };

  // Filter, sort, and then paginate
  const filteredPosts = [...posts]
    .filter(post => {
      const matchesCategory = editCategory === 'All posts' || post.category === editCategory;
      const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (filter === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filter === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filter === 'popular') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return 0;
    });
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, editCategory, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200">
      <Header />
      <div className="max-w-4xl mx-auto -mt-4 pb-8 px-2 sm:px-0">
        <button onClick={() => navigate('/')} className="mb-4 text-indigo-600 hover:underline">&larr; Back to All Posts</button>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">My Vlogs</h2>
        </div>
        <PostFilterBar
          activeCategory={editCategory}
          onCategoryChange={cat => { setEditCategory(cat); setCurrentPage(1); }}
          searchValue={search}
          onSearchChange={val => { setSearch(val); setCurrentPage(1); }}
          filterValue={filter === 'newest' ? 'Latest' : filter === 'oldest' ? 'Oldest' : ''}
          onFilterChange={val => setFilter(val === 'Latest' ? 'newest' : val === 'Oldest' ? 'oldest' : 'newest')}
        />
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* Edit Form */}
        {editingId && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Vlog</h3>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    required
                  >
                    <option value="General">General</option>
                    <option value="Web Design">Web Design</option>
                    <option value="Development">Development</option>
                    <option value="Database">Database</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditImage(e.target.files[0])}
                    className="w-full border border-gray-300 p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-all duration-300">Save</button>
                  <button type="button" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300 transition-all duration-300" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </form>
            </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {loadingPosts ? (
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
            <>
              {/* Remove the old filter buttons UI above the posts list */}
              {paginatedPosts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onDelete={handleDelete}
                  onEdit={startEdit}
                  isOwner={true}
                />
              ))}
            </>
          )}
          {!loadingPosts && filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No vlogs yet. Create your first vlog!</p>
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