import { createContext, useState } from 'react';
import axios from 'axios';

const AllPostsContext = createContext();
export default AllPostsContext;

export function AllPostsProvider({ children }) {
  const [allPosts, setAllPosts] = useState([]);
  const [loadingAllPosts, setLoadingAllPosts] = useState(false);
  const [error, setError] = useState('');

  const fetchAllPosts = async () => {
    try {
      setLoadingAllPosts(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAllPosts(res.data);
    } catch {
      setError('Failed to fetch all posts');
    } finally {
      setLoadingAllPosts(false);
    }
  };

  return (
    <AllPostsContext.Provider value={{ allPosts, setAllPosts, fetchAllPosts, loadingAllPosts, error }}>
      {children}
    </AllPostsContext.Provider>
  );
} 