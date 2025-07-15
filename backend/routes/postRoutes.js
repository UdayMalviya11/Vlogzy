import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createPost, getAllPosts, getUserPosts, updatePost, deletePost, getPopularPosts, getPostById } from '../controllers/postController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Fixed: use 'uploads/'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', authenticate, upload.single('image'), createPost);
router.put('/:id', authenticate, upload.single('image'), updatePost);

router.get('/me', authenticate, getUserPosts);
router.get('/all', authenticate, getAllPosts);
router.get('/popular', getPopularPosts);
router.get('/:id', getPostById);
router.delete('/:id', authenticate, deletePost);

export default router; 