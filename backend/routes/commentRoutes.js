import { Router } from 'express';
import { 
  createComment, 
  getCommentsByPost, 
  deleteComment, 
  getAllComments 
} from '../controllers/commentController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

// Create a comment (authenticated users)
router.post('/', authenticate, createComment);

// Get comments for a specific post (public)
router.get('/post/:postId', getCommentsByPost);

// Delete a comment (author or admin)
router.delete('/:id', authenticate, deleteComment);

// Get all comments (admin only)
router.get('/all', authenticate, isAdmin, getAllComments);

export default router; 