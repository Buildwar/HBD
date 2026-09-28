import { Router } from 'express';
import { getAboutInfo } from '../controllers/about.controller.js';

export const aboutRouter = Router();

aboutRouter.get('/', getAboutInfo);
