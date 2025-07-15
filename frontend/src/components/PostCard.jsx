import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/useUser';

const API_URL = import.meta.env.VITE_API_URL;

export default function PostCard({ post, onDelete, onEdit, isOwner = false, isAdmin = false }) {
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const menuRef = useRef(null);

  const { token, user, likedPostIds, fetchLikedPosts } = useUser();

  const navigate = useNavigate();

  
  const liked = likedPostIds && likedPostIds.includes(String(post._id));

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

  const handleLike = async () => {
    if (!token) {
      alert('Please login to like posts');
      return;
    }
    if (loading) return; // Prevent double click
    setLoading(true);
    try {
      if (liked) {
        await axios.delete(`${API_URL}/api/likes`, {
          data: { postId: post._id },
          headers: { Authorization: `Bearer ${token}` }
        });
        setLikeCount(prev => prev - 1);
      } else {
        await axios.post(`${API_URL}/api/likes`, { postId: post._id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLikeCount(prev => prev + 1);
      }
      // Instantly update likedPostIds for UI
      if (user && user.id && fetchLikedPosts) {
        console.log('Calling fetchLikedPosts with user.id:', user.id);
        await fetchLikedPosts(user.id);
      } else {
        console.log('No user or user.id for fetchLikedPosts:', user);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Only show error if it's not a duplicate like/unlike
      const msg = error.response?.data?.message;
      if (msg && msg !== 'Post already liked' && msg !== 'Like not found') {
        alert(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/comments/post/${post._id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/comments`, {
        content: newComment,
        postId: post._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      setCommentCount(prev => prev + 1);
      loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentCount(prev => prev - 1);
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      }
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  // Dropdown menu for edit/delete
  const showMenu = isOwner || isAdmin;

  return (
    <div
      className="cursor-pointer"
      onClick={(e) => {
        // Prevent navigation if like or comment button is clicked
        if (
          e.target.closest('.like-btn') ||
          e.target.closest('.comment-btn') ||
          e.target.closest('form') // prevent for comment form
        ) {
          return;
        }
        navigate(`/vlog/${post._id}`);
      }}
    >
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-0 mb-6 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image on the left */}
          {post.image ? (
            <img
              src={`${API_URL}/uploads/${post.image}`}
              alt={post.title}
              className="w-full sm:w-56 h-56 object-cover sm:rounded-l-xl sm:rounded-tr-none rounded-t-xl"
            />
          ) : (
            <div className="w-full sm:w-56 h-56 bg-gray-200 flex items-center justify-center text-4xl text-gray-400 sm:rounded-l-xl sm:rounded-tr-none rounded-t-xl">
              📷
            </div>
          )}
          {/* Content on the right */}
          <div className="flex-1 flex flex-col p-6 relative h-56" style={{ minHeight: '14rem', maxHeight: '14rem' }}>
            {/* Three-dot menu */}
            {showMenu && (
              <div className="absolute top-4 right-4 z-10" ref={menuRef}>
                <button
                  className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                  aria-label="Show options"
                >
                  <FiMoreVertical className="text-2xl text-gray-500" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-fade-in">
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(post); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(post._id); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
            <h3
              className="text-xl font-bold text-gray-900 mb-2 pr-10 hover:underline cursor-pointer"
              onClick={e => { e.stopPropagation(); navigate(`/vlog/${post._id}`); }}
            >
              {post.title}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              By {post.authorId?.username || 'Unknown'}
              {post.category && (
                <> on <span className="text-indigo-600">{post.category}</span></>
              )}
              {' '}• {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <div className="mb-4" style={{ minHeight: '4.5em', maxHeight: '4.5em', overflow: 'hidden', position: 'relative' }}>
              <p className="text-gray-700 line-clamp-3">
                {post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content}
              </p>
              {post.content.length > 200 && (
                <button
                  className="absolute bottom-0 right-0 text-indigo-600 hover:underline bg-white px-2 py-1 text-sm font-medium"
                  onClick={e => { e.stopPropagation(); navigate(`/vlog/${post._id}`); }}
                >
                  Read more
                </button>
              )}
            </div>
            <div className="flex items-center gap-6 mb-4 mt-auto">
              <button
                onClick={handleLike}
                disabled={loading}
                className={`like-btn flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  liked
                    ? 'bg-red-100 text-red-500 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">
                  {liked ? (
                    <span role="img" aria-label="liked">❤️</span>
                  ) : (
                    <span role="img" aria-label="not liked">🤍</span>
                  )}
                </span>
                <span>{likeCount}</span>
              </button>
              <button
                onClick={toggleComments}
                className="comment-btn flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <span className="text-lg">💬</span>
                <span>{commentCount}</span>
              </button>
            </div>
            {showComments && (
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold text-gray-900 mb-3">Comments</h4>
                {token && (
                  <form onSubmit={handleComment} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </form>
                )}
                {comments.length > 1 && !showAllComments && (
                  <button
                    className="text-indigo-600 hover:underline mb-2"
                    onClick={e => { e.preventDefault(); setShowAllComments(true); }}
                  >
                    Show all comments
                  </button>
                )}
                {showAllComments ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {comment.authorId?.username || 'Unknown'}
                            </p>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {(isAdmin || comment.authorId?._id === localStorage.getItem('userId')) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.length > 0 ? (
                      <div key={comments[0]._id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {comments[0].authorId?.username || 'Unknown'}
                            </p>
                            <p className="text-gray-700 text-sm">{comments[0].content}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(comments[0].createdAt).toLocaleString()}
                            </p>
                          </div>
                          {(isAdmin || comments[0].authorId?._id === localStorage.getItem('userId')) && (
                            <button
                              onClick={() => handleDeleteComment(comments[0]._id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 