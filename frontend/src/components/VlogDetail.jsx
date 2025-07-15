import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

const API_URL = import.meta.env.VITE_API_URL;

function CommentItem({ comment, postId, token, onReply }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to reply");
      return;
    }
    if (!replyText.trim()) {
      alert("Please enter a reply");
      return;
    }
    try {
      setLoadingReply(true);
      await axios.post(
        `${API_URL}/api/comments`,
        {
          content: replyText,
          postId,
          parent: comment._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReplyText("");
      setShowReply(false);
      onReply();
    } catch (error) {
      alert("Error posting reply", error);
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm text-gray-900">
            {comment.authorId?.username || "Unknown"}
          </p>
          <p className="text-gray-700 text-sm">{comment.content}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="mt-2">
        {token && (
          <button
            className="text-indigo-600 text-xs hover:underline mr-2"
            onClick={() => setShowReply((v) => !v)}
          >
            {showReply ? "Cancel" : "Reply"}
          </button>
        )}
      </div>
      {showReply && (
        <form onSubmit={handleReply} className="flex gap-2 mt-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loadingReply}
          />
          <button
            type="submit"
            disabled={loadingReply || !replyText.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingReply ? "Posting..." : "Reply"}
          </button>
        </form>
      )}
      {/* Render replies recursively */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 mt-2 border-l-2 border-indigo-100">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              postId={postId}
              token={token}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoadingPost(true);
        const res = await axios.get(`${API_URL}/api/posts/${id}`);
        setPost(res.data);
      } catch {
        setPost(null);
      } finally {
        setLoadingPost(false);
      }
    };
    const fetchComments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/comments/post/${id}`);
        setComments(res.data);
      } catch {
        setComments([]);
      }
    };
    fetchPost();
    fetchComments();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert("Please login to comment");
      return;
    }
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/api/comments`,
        {
          content: newComment,
          postId: id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewComment("");
      // Reload comments
      const res = await axios.get(`${API_URL}/api/comments/post/${id}`);
      setComments(res.data);
    } catch (error) {
      alert("Error posting comment", error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-indigo-50">
        <Header />
        <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-10 animate-pulse">
          {/* Content Skeleton */}
          <div className="flex-1">
            <div className="h-10 w-2/3 bg-gray-200 rounded mb-4" />{" "}
            {/* Title */}
            <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" /> {/* Meta */}
            <div className="space-y-2 mb-8">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
          {/* Image and Comments Skeleton */}
          <div className="w-full md:w-96 flex flex-col items-center">
            <div className="w-full h-60 bg-gray-200 rounded-2xl mb-6" />
            <div className="w-full bg-white rounded-xl shadow p-4">
              <div className="h-6 w-32 bg-gray-200 rounded mb-3" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-3">
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-3/4 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-1/4 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-16 text-center text-gray-500"></div>
      </div> 
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50">
      <Header />
      <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col md:flex-row gap-10">
        {/* Content */}
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="mb-2 text-gray-600 text-sm">
            Written By{" "}
            <span className="font-semibold">
              {post.authorId?.username || "Unknown"}
            </span>
            {post.category && (
              <span>
                {" "}
                on <span className="text-indigo-600">{post.category}</span>
              </span>
            )}
            <span> • {new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-lg text-gray-800 mb-8">{post.content}</p>
        </div>
        {/* Image and Comments */}
        <div className="w-full md:w-96 flex flex-col items-center">
          {post.image ? (
            <img
              src={`${API_URL}/uploads/${post.image}`}
              alt={post.title}
              className="w-full h-60 object-cover rounded-2xl mb-6 shadow-lg"
            />
          ) : (
            <div className="w-full h-60 bg-gray-200 flex items-center justify-center text-5xl text-gray-400 rounded-2xl mb-6">
              📷
            </div>
          )}
          {/* Comments Section */}
          <div className="w-full bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-lg mb-3">Comments</h3>
            {token && (
              <form onSubmit={handleComment} className="mb-4 flex gap-2">
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
                  {loading ? "Posting..." : "Post"}
                </button>
              </form>
            )}
            <div className="max-h-60 overflow-y-auto space-y-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    postId={id}
                    token={token}
                    onReply={async () => {
                      // Reload comments after reply
                      const res = await axios.get(`${API_URL}/api/comments/post/${id}`);
                      setComments(res.data);
                    }}
                  />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
