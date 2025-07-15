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
      className="group cursor-pointer transition-shadow duration-200 hover:shadow-xl focus-within:shadow-2xl rounded-xl bg-white mb-6 border border-gray-100"
      onClick={(e) => {
        if (
          e.target.closest('.like-btn') ||
          e.target.closest('.comment-btn') ||
          e.target.closest('form')
        ) {
          return;
        }
        navigate(`/vlog/${post._id}`);
      }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        {post.image ? (
          <img
            src={`${API_URL}/uploads/${post.image}`}
            alt={post.title}
            className="w-full h-40 xs:h-48 sm:w-56 sm:h-56 object-cover rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none transition duration-200 group-hover:brightness-95"
          />
        ) : (
          <div className="w-full sm:w-56 h-56 bg-gray-100 flex items-center justify-center text-4xl text-gray-300 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none">
            📷
          </div>
        )}
        {/* Content */}
        <div className="flex-1 flex flex-col p-3 sm:p-5 relative h-56 min-h-[12rem] sm:min-h-[14rem] max-h-[16rem]">
          {/* Menu */}
          {showMenu && (
            <div className="absolute top-4 right-4 z-10" ref={menuRef}>
              <button
                className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors"
                onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
                aria-label="Show options"
              >
                <FiMoreVertical className="text-2xl text-gray-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-fade-in transition-all duration-200">
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
            className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-1 pr-10 hover:underline cursor-pointer transition-colors break-words"
            onClick={e => { e.stopPropagation(); navigate(`/vlog/${post._id}`); }}
          >
            {post.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-2">
            By <span className="font-medium">{post.authorId?.username || 'Unknown'}</span>
            {post.category && (
              <> on <span className="text-indigo-600">{post.category}</span></>
            )}
            {' '}• {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <div className="mb-3 min-h-[2.5em] sm:min-h-[3.5em] max-h-[5em] overflow-hidden relative">
            <p className="text-gray-700 text-sm line-clamp-3">
              {post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content}
            </p>
            {post.content.length > 200 && (
              <button
                className="absolute bottom-0 right-0 text-indigo-600 hover:underline bg-white px-2 py-1 text-xs font-medium transition-colors"
                onClick={e => { e.stopPropagation(); navigate(`/vlog/${post._id}`); }}
              >
                Read more
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 mb-3 mt-auto flex-wrap">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`like-btn flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-200 text-sm font-medium shadow-sm ${
                liked
                  ? 'bg-red-100 text-red-500 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={liked ? 'Unlike post' : 'Like post'}
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
              className="comment-btn flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm font-medium shadow-sm"
              aria-label="Show comments"
            >
              <span className="text-lg">💬</span>
              <span>{commentCount}</span>
            </button>
          </div>
          {showComments && (
            <div className="border-t pt-3 mt-2 animate-fade-in transition-all duration-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Comments</h4>
              {token && (
                <form onSubmit={handleComment} className="mb-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !newComment.trim()}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {loading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              )}
              {comments.length > 1 && !showAllComments && (
                <button
                  className="text-indigo-600 hover:underline mb-2 text-xs font-medium"
                  onClick={e => { e.preventDefault(); setShowAllComments(true); }}
                >
                  Show all comments
                </button>
              )}
              {showAllComments ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment._id} className="bg-gray-50 rounded-lg p-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-xs text-gray-900">
                            {comment.authorId?.username || 'Unknown'}
                          </p>
                          <p className="text-gray-700 text-xs">{comment.content}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {(isAdmin || comment.authorId?._id === localStorage.getItem('userId')) && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium ml-2"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-gray-500 text-center py-2 text-xs">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {comments.length > 0 ? (
                    <div key={comments[0]._id} className="bg-gray-50 rounded-lg p-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-xs text-gray-900">
                            {comments[0].authorId?.username || 'Unknown'}
                          </p>
                          <p className="text-gray-700 text-xs">{comments[0].content}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {new Date(comments[0].createdAt).toLocaleString()}
                          </p>
                        </div>
                        {(isAdmin || comments[0].authorId?._id === localStorage.getItem('userId')) && (
                          <button
                            onClick={() => handleDeleteComment(comments[0]._id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium ml-2"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-2 text-xs">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 