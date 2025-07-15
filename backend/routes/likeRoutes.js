import { Router } from 'express';
import {
  likePost,
  unlikePost,
  getLikeCount,
  getUserLikedPosts
} from '../controllers/likeController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Like a post (authenticated users)
router.post('/', authenticate, likePost);

// Unlike a post (authenticated users)
router.delete('/', authenticate, unlikePost);

// Get like count for a post (public)
router.get('/:postId/count', getLikeCount);

// Get all post IDs liked by a user (authenticated users or public, depending on your needs)
router.get('/user/:userId', getUserLikedPosts);

export default router; 