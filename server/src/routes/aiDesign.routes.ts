import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { AIDesignController } from '../controllers/aiDesign.controller.js';

const router = Router();

// Estado del proveedor de IA
router.get('/provider-status', authenticateJwt, AIDesignController.getProviderStatus);

// Análisis espacial inteligente
router.post('/analyze-room', authenticateJwt, AIDesignController.analyzeRoom);
router.post('/analyze-project', authenticateJwt, AIDesignController.analyzeProject);

// Generación de propuestas con validación geométrica
router.post('/proposals', authenticateJwt, AIDesignController.generateProposals);

// Asistente Copilot estructurado
router.post('/copilot', authenticateJwt, AIDesignController.processCopilotCommand);

// Aplicación y persistencia de variantes
router.post('/apply', authenticateJwt, AIDesignController.applyProposal);
router.post('/save-variant', authenticateJwt, AIDesignController.saveProposalAsVariant);

// Historial
router.get('/history/:projectId', authenticateJwt, AIDesignController.getProjectHistory);

export const aiDesignRoutes = router;
