import { Router } from 'express';
import { login, register, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/me', authenticateJwt, getMe);
authRouter.patch('/profile', authenticateJwt, updateProfile);
authRouter.post('/change-password', authenticateJwt, changePassword);
