/**
 * HBD — FASE V24 / 1.24.0: HBD AI COPILOT
 * Express Routes for Copilot Chat, Conversations, Actions, Tools & Usage
 * 
 * Autor: Adrián Palma
 * Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
 */

import { Router } from 'express';
import { CopilotController } from '../controllers/copilot.controller.js';

export const copilotRouter = Router();

// 1. Chat & Execution Pipeline
copilotRouter.post('/copilot/chat', CopilotController.chat);
copilotRouter.post('/chat', CopilotController.chat);

// 2. Conversation Management
copilotRouter.get('/conversations', CopilotController.getConversations);
copilotRouter.post('/conversations', CopilotController.createConversation);
copilotRouter.get('/conversations/:id', CopilotController.getConversationById);
copilotRouter.delete('/conversations/:id', CopilotController.deleteConversation);

// 3. Action Lifecycle & Confirmation
copilotRouter.post('/actions/:id/confirm', CopilotController.confirmAction);
copilotRouter.post('/actions/:id/cancel', CopilotController.cancelAction);
copilotRouter.post('/actions/:id/reject', CopilotController.cancelAction);

// 4. Tools, Interactions & Usage Analytics
copilotRouter.get('/tools', CopilotController.getTools);
copilotRouter.get('/interactions', CopilotController.getInteractions);
copilotRouter.get('/usage', CopilotController.getUsage);

export default copilotRouter;
