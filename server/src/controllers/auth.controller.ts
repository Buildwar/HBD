import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'El usuario o email es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const registerSchema = z.object({
  email: z.string().email('Email no válido'),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  language: z.string().optional().default('es'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  language: z.string().optional(),
  themePreferences: z.record(z.any()).optional(),
  avatar: z.string().optional().nullable(),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() },
        ],
      },
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

    if (!user) {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'La cuenta está desactivada. Contacta al administrador.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    const userDto = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      language: user.language,
      themePreferences: user.themePreferences as any,
      roleId: user.roleId,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        permissions: user.role.permissions.map((p) => ({
          id: p.permission.id,
          code: p.permission.code,
          name: p.permission.name,
          description: p.permission.description,
        })),
      },
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    await logger.audit('AUTH', `Inicio de sesión exitoso para ${user.username}`, user.id);

    res.json({
      success: true,
      data: {
        user: userDto,
        token,
        expiresIn: ENV.JWT_EXPIRES_IN,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, name, password, language } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      res.status(409).json({ success: false, message: 'Ya existe un usuario con este email o nombre de usuario.' });
      return;
    }

    let defaultRole = await prisma.role.findUnique({ where: { name: 'USER' } });
    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: 'USER',
          description: 'Usuario estándar con acceso a proyectos propios',
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        name,
        passwordHash,
        language: language || 'es',
        roleId: defaultRole.id,
      },
      include: {
        role: true,
      },
    });

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    await logger.audit('AUTH', `Nuevo usuario registrado: ${newUser.username}`, newUser.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
          language: newUser.language,
          themePreferences: newUser.themePreferences as any,
          roleId: newUser.roleId,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        },
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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

    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        language: user.language,
        themePreferences: user.themePreferences,
        roleId: user.roleId,
        role: {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description,
          permissions: user.role.permissions.map((p) => p.permission.code),
        },
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    const data = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.language && { language: data.language }),
        ...(data.themePreferences && { themePreferences: data.themePreferences }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
      include: {
        role: true,
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        language: updatedUser.language,
        themePreferences: updatedUser.themePreferences,
        roleId: updatedUser.roleId,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors?.[0]?.message || error.message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'La contraseña actual no es correcta.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await logger.audit('AUTH', `Contraseña cambiada para ${user.username}`, user.id);

    res.json({ success: true, message: 'Contraseña actualizada con éxito.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
