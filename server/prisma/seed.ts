import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed controlado y no destructivo de HBD...');

  // 1. Roles
  const rolesData = [
    { name: 'ADMIN', description: 'Administrador total del sistema y usuarios' },
    { name: 'DESIGNER', description: 'Diseñador con acceso completo a proyectos y mobiliario' },
    { name: 'USER', description: 'Usuario estándar con gestión de sus propios proyectos' },
    { name: 'VIEWER', description: 'Visor con acceso de solo lectura' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: r.description },
    });
    roleMap[r.name] = role.id;
  }
  console.log('✓ Roles verificados');

  // 2. Permisos
  const permissionsData = [
    { code: 'PROJECT_CREATE', name: 'Crear Proyectos', description: 'Permite crear nuevos proyectos' },
    { code: 'PROJECT_EDIT', name: 'Editar Proyectos', description: 'Permite editar proyectos existentes' },
    { code: 'PROJECT_DELETE', name: 'Eliminar Proyectos', description: 'Permite eliminar proyectos' },
    { code: 'PLAN_UPLOAD', name: 'Subir Planos', description: 'Permite cargar planos PDF e imágenes' },
    { code: 'PLAN_ANALYZE', name: 'Analizar Planos', description: 'Permite ejecutar el análisis geométrico con IA' },
    { code: 'USERS_MANAGE', name: 'Gestionar Usuarios', description: 'Permite administrar cuentas de usuarios y roles' },
    { code: 'SETTINGS_MANAGE', name: 'Gestionar Configuración', description: 'Permite modificar configuración global' },
  ];

  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });

    // Asociar todos los permisos al rol ADMIN
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: roleMap['ADMIN'],
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: roleMap['ADMIN'],
        permissionId: perm.id,
      },
    });
  }
  console.log('✓ Permisos verificados');

  // 3. Categorías de Mobiliario
  const categoriesData = [
    { name: 'Sofás y Sillones', slug: 'sofas', icon: 'Armchair', description: 'Sofás, sillones, pufs y divanes' },
    { name: 'Camas y Dormitorio', slug: 'camas', icon: 'Bed', description: 'Camas individuales, dobles y literas' },
    { name: 'Mesas y Comedor', slug: 'mesas', icon: 'Utensils', description: 'Mesas de comedor, auxiliares y de centro' },
    { name: 'Sillas y Taburetes', slug: 'sillas', icon: 'Chair', description: 'Sillas de comedor, oficina y taburetes' },
    { name: 'Armarios y Almacenaje', slug: 'armarios', icon: 'Archive', description: 'Armarios roperos, cómodas y estanterías' },
    { name: 'Escritorios y Trabajo', slug: 'escritorios', icon: 'Laptop', description: 'Mesas de estudio y oficina' },
    { name: 'Muebles TV y Salón', slug: 'muebles-tv', icon: 'Tv', description: 'Muebles multimedia y librerías' },
    { name: 'Cocina y Electrodomésticos', slug: 'cocina', icon: 'Refrigerator', description: 'Módulos de cocina, encimeras y electrodomésticos' },
    { name: 'Baño y Sanitarios', slug: 'bano', icon: 'Bath', description: 'Lavabos, inodoros, platos de ducha y bañeras' },
    { name: 'Iluminación', slug: 'iluminacion', icon: 'Lamp', description: 'Lámparas de techo, pie y apliques' },
    { name: 'Decoración y Plantas', slug: 'decoracion', icon: 'Flower2', description: 'Espejos, alfombras y plantas' },
  ];

  for (const cat of categoriesData) {
    await prisma.furnitureCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: cat,
    });
  }
  console.log('✓ Categorías de mobiliario verificadas');

  // 4. Usuario Administrador Inicial
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hbd.local';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  let adminUser = existingAdmin;
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin_HBD', 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: process.env.ADMIN_USERNAME || 'admin',
        name: process.env.ADMIN_NAME || 'Administrador del Sistema',
        passwordHash,
        roleId: roleMap['ADMIN'],
        language: 'es',
      },
    });
    console.log(`✓ Usuario Administrador inicial creado: ${adminEmail}`);
  } else {
    console.log(`✓ Usuario Administrador ya existente: ${adminEmail}`);
  }

  // 5. Proyecto de Demostración Residencial (si el admin no tiene proyectos)
  if (adminUser) {
    const existingProjects = await prisma.project.count({ where: { userId: adminUser.id } });
    if (existingProjects === 0) {
      const demoProject = await prisma.project.create({
        data: {
          name: 'Piso Residencial Centro',
          description: 'Proyecto de prueba y validación geométrica de vivienda.',
          address: 'Calle Mayor 12, Planta 3',
          propertyType: 'residential',
          userId: adminUser.id,
          floors: {
            create: {
              name: 'Planta Principal',
              level: 0,
              order: 0,
              heightM: 2.60,
              rooms: {
                create: [
                  {
                    name: 'Salón - Comedor',
                    roomType: 'living_room',
                    polygon: [
                      { x: 0, y: 0 },
                      { x: 6.2, y: 0 },
                      { x: 6.2, y: 4.5 },
                      { x: 0, y: 4.5 },
                    ],
                    areaM2: 27.9,
                    widthM: 6.2,
                    lengthM: 4.5,
                    heightM: 2.6,
                    color: '#3b82f6',
                  },
                  {
                    name: 'Dormitorio Principal',
                    roomType: 'bedroom',
                    polygon: [
                      { x: 6.2, y: 0 },
                      { x: 10.2, y: 0 },
                      { x: 10.2, y: 3.8 },
                      { x: 6.2, y: 3.8 },
                    ],
                    areaM2: 15.2,
                    widthM: 4.0,
                    lengthM: 3.8,
                    heightM: 2.6,
                    color: '#10b981',
                  },
                ],
              },
            },
          },
        },
      });
      console.log(`✓ Proyecto de demostración creado: ${demoProject.name}`);
    }
  }

  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
