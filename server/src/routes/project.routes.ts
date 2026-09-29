import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  createFloor,
  duplicateProject,
} from '../controllers/project.controller.js';
import { authenticateJwt } from '../middlewares/auth.middleware.js';

export const projectRouter = Router();

projectRouter.use(authenticateJwt);

projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectById);
projectRouter.post('/', createProject);
projectRouter.post('/:id/duplicate', duplicateProject);
projectRouter.patch('/:id', updateProject);
projectRouter.delete('/:id', deleteProject);
projectRouter.post('/:id/floors', createFloor);
