import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  name: z.string().min(2),
  password: z.string().min(6),
  roleId: z.string().min(1),
  language: z.string().optional().default('es'),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
  isActive: z.boolean().optional(),
  language: z.string().optional(),
  password: z.string().min(6).optional(),
});

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      language: u.language,
      themePreferences: u.themePreferences,
      roleId: u.roleId,
      role: u.role,
      isActive: u.isActive,
      projectsCount: u._count.projects,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    res.json({ success: true, data: sanitizedUsers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase() },
          { username: data.username.toLowerCase() },
        ],
      },
    });

    if (existing) {
      res.status(409).json({ success: false, message: 'El usuario o email ya está en uso.' });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        name: data.name,
        passwordHash,
        roleId: data.roleId,
        language: data.language,
      },
      include: { role: true },
    });

    await logger.audit('AUTH', `Usuario creado por admin: ${newUser.username}`, req.user!.id);

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        language: newUser.language,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    // Protection: Prevent deactivating the last active ADMIN
    if (data.isActive === false && targetUser.role.name === 'ADMIN') {
      const activeAdminsCount = await prisma.user.count({
        where: {
          role: { name: 'ADMIN' },
          isActive: true,
        },
      });

      if (activeAdminsCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'No se puede desactivar el único administrador activo del sistema.',
        });
        return;
      }
    }

    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.roleId && { roleId: data.roleId }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.language && { language: data.language }),
        ...(passwordHash && { passwordHash }),
      },
      include: { role: true },
    });

    await logger.audit('AUTH', `Usuario ${updatedUser.username} actualizado por admin`, req.user?.id);

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        language: updatedUser.language,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta de usuario en sesión activa.',
      });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    if (targetUser.role.name === 'ADMIN') {
      const activeAdminsCount = await prisma.user.count({
        where: {
          role: { name: 'ADMIN' },
          isActive: true,
        },
      });

      if (activeAdminsCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'No se puede eliminar el único administrador del sistema.',
        });
        return;
      }
    }

    // Delete user (cascade will handle foreign keys defined in schema or remove relations)
    await prisma.user.delete({ where: { id } });

    await logger.audit('AUTH', `Usuario ${targetUser.username} eliminado por admin`, req.user?.id);

    res.json({ success: true, message: `Usuario ${targetUser.username} eliminado correctamente.` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: roles });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
