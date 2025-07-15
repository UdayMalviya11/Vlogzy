import { useContext } from 'react';
import PostsContext from './PostsContext';

export function usePosts() {
  return useContext(PostsContext);
} 