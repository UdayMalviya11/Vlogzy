import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';
import { getAllPosts } from '../controllers/adminController.js';

const router = Router();

router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/posts', authenticate, isAdmin, getAllPosts);

export default router; 