import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJwt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Sesión no válida o no autenticada.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Usuario inexistente o inactivo.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: user.role.permissions.map((p) => p.permission.code),
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token expirado o inválido.' });
  }
};
