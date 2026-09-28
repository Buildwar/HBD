import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    if (req.user.roleName === 'ADMIN' || allowedRoles.includes(req.user.roleName)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'No tienes permisos suficientes para realizar esta acción.',
    });
  };
};

export const requirePermission = (permissionCode: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    if (req.user.roleName === 'ADMIN' || req.user.permissions.includes(permissionCode)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: `Permiso requerido: ${permissionCode}`,
    });
  };
};
