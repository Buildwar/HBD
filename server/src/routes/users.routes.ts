import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../controllers/users.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';

export const usersRouter = Router();

usersRouter.use(authenticateJwt);

usersRouter.get('/roles', getRoles);
usersRouter.get('/', requireRole(['ADMIN']), getUsers);
usersRouter.post('/', requireRole(['ADMIN']), createUser);
usersRouter.patch('/:id', requireRole(['ADMIN']), updateUser);
usersRouter.delete('/:id', requireRole(['ADMIN']), deleteUser);

