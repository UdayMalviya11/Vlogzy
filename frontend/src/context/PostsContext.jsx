import { createContext, useState } from 'react';
import axios from 'axios';

const PostsContext = createContext();
export default PostsContext;

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async (token) => {
    try {
      setLoadingPosts(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch {
      setError('Failed to fetch posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  return (
    <PostsContext.Provider value={{ posts, setPosts, fetchPosts, loadingPosts, error }}>
      {children}
    </PostsContext.Provider>
  );
} 