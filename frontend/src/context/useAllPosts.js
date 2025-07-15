import { useContext } from 'react';
import AllPostsContext from './AllPostsContext';

export function useAllPosts() {
  return useContext(AllPostsContext);
} 