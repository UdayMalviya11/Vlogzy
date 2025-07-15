import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();
export default UserContext;

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [likedPostIds, setLikedPostIds] = useState([]);

  const fetchLikedPosts = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/likes/user/${userId}`);
      setLikedPostIds(res.data.likedPostIds || []);
    } catch {
      setLikedPostIds([]);
    }
  };

  const login = (userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('token', tokenValue);
    if (userData?.id) fetchLikedPosts(userData.id);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLikedPostIds([]);
    localStorage.removeItem('token');
  };

  // Fetch the latest user data
  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.valid && res.data.user) {
        setUser(res.data.user);
        if (res.data.user.id) fetchLikedPosts(res.data.user.id);
      }
    } catch {
      // Optionally handle error
    }
  };

  useEffect(() => {
    // On mount or when user/token changes, fetch liked posts if logged in
    if (user && user.id) {
      fetchLikedPosts(user.id);
    } else {
      setLikedPostIds([]);
    }
  }, [user, token]);

  // Ensure user is set in context on mount if token exists
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token]);

  return (
    <UserContext.Provider value={{ user, token, login, logout, fetchUser, likedPostIds, fetchLikedPosts }}>
      {children}
    </UserContext.Provider>
  );
} 