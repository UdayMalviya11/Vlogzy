import { Router } from 'express';
import { register, login, verify } from '../controllers/authController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);

export default router; 