# HBD — Home Board Designer

> **Diseña, mide y visualiza tu vivienda.**  
> Plataforma profesional para digitalizar planos arquitectónicos, calcular distancias y superficies con precisión geométrica, crear modelos 2D/3D interactivos y evolucionar hacia el gemelo digital de la vivienda.

---

## 🚀 Características Principales (Fase 1 Foundation)

- 📐 **Arquitectura Desacoplada**: Separación estricta entre la propuesta de visión/IA y el motor de cálculo geométrico de precisión.
- 🏢 **Gestión Multi-Planta y Proyectos**: Soporte integral para viviendas unifamiliares, pisos, oficinas y plantas ilimitadas (Baja, 1ª, Garaje, etc.).
- 🎨 **Tema Dark Modern (Spotify-inspired)**: Interfaz oscura, tarjetas limpias, acentos vivos personalizables, ajuste de densidad y radio de bordes.
- 🔐 **Seguridad & RBAC**: Autenticación JWT, contraseñas hasheadas con Bcrypt y control de acceso por roles (ADMIN, DESIGNER, USER, VIEWER).
- 🌐 **Internacionalización (i18n)**: Soporte completo e integrado para Español e Inglés sin claves internas expuestas.
- ⚙️ **Configuración & Autoría Centralizada**: Identidad y versión (`1.0.0`) administradas desde un único punto de verdad, visibles en la sección **Configuración → Acerca de**.
- 🐳 **Docker & Portainer Ready**: Listo para desarrollo y producción con Docker Compose y Portainer stack.
- 🤖 **CI/CD Automatizado**: Workflow de GitHub Actions para validación de tipos, tests y construcción de imágenes Docker.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18/19, TypeScript, Vite, Tailwind CSS, Lucide Icons, i18next, React Router |
| **Backend** | Node.js, Express, TypeScript, Zod, Bcrypt, JSON Web Tokens (JWT) |
| **Base de Datos** | PostgreSQL, Prisma ORM (Migraciones controladas, Seeds no destructivos) |
| **DevOps** | Docker, Docker Compose, Portainer, GitHub Actions CI/CD |

---

## 📦 Puesta en Marcha Rápida

### Opción 1: Con Docker Compose (Recomendado)

```bash
# 1. Clonar el repositorio y configurar variables de entorno
cp .env.example .env

# 2. Levantar el stack completo (PostgreSQL + API + Web)
docker compose up --build -d
```

- **Frontend**: [http://localhost:3003](http://localhost:3003)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Usuario Administrador inicial**: `admin` (o `admin@hbd.local`) / `admin_HBD`

---

### Opción 2: Desarrollo Local

```bash
# 1. Instalar dependencias en los workspaces
npm install

# 2. Configurar base de datos
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 3. Iniciar servidores de desarrollo
npm run dev
```

---

## 📚 Documentación

En la carpeta [`docs/`](file:///D:/PROGRAMAS/HBD/docs) encontrarás la documentación técnica detallada:
- [`docs/architecture.md`](file:///D:/PROGRAMAS/HBD/docs/architecture.md): Principios arquitectónicos y flujo del motor geométrico.
- [`docs/development.md`](file:///D:/PROGRAMAS/HBD/docs/development.md): Guía de desarrollo local paso a paso.
- [`docs/deployment.md`](file:///D:/PROGRAMAS/HBD/docs/deployment.md): Despliegue con Docker y Portainer.
- [`docs/database.md`](file:///D:/PROGRAMAS/HBD/docs/database.md): Estructura del modelo de datos y relaciones.
- [`docs/roadmap.md`](file:///D:/PROGRAMAS/HBD/docs/roadmap.md): Estado detallado de las 8 fases del proyecto.

---

## 👤 Autoría y Créditos

- **Desarrollador y Propietario**: `apalma`
- **Proyecto**: HBD — Home Board Designer
- **Versión**: `1.0.0`
- **Copyright**: `© 2026 apalma — HBD (Home Board Designer)`
