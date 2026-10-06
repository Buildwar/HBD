# HBD — Home Board Designer

> **Diseña, mide, visualiza y renderiza tu vivienda.**  
> Plataforma profesional integral para digitalizar planos arquitectónicos, calcular distancias y superficies con precisión geométrica, crear modelos 2D/3D interactivos, simular acabados fotorrealistas con IA y evolucionar hacia el gemelo digital de la vivienda.

---

## 👤 Identidad, Autoría y Propiedad

- **Producto**: HBD (Home Board Designer)
- **Autor y Propietario**: `Adrián Palma`
- **Versión Actual**: `9.0.0`
- **Copyright**: `© 2026 Adrián Palma — HBD (Home Board Designer)`
- **Repositorio Oficial**: `https://github.com/Buildwar/HBD.git`
- **Rama Principal**: `main`
- **Puerto Oficial de la Aplicación**: `3003` (`http://localhost:3003`)

---

## 🏗️ Arquitectura General y Flujo de Despliegue

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   VS CODE    │ ──► │  TEST/BUILD  │ ──► │    GITHUB    │ ──► │    GHCR      │
  │ (Desarrollo) │     │ (Validación) │     │  (Actions)   │     │  (Imágenes)  │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                        │
                                                                        ▼
                                                                ┌──────────────┐
                                                                │  PORTAINER   │
                                                                │ (Producción) │
                                                                └──────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS con Sistema de Tokens Dinámicos, Three.js, Lucide Icons, i18next, React Router |
| **Backend** | Node.js (v22), Express, TypeScript, Prisma ORM, Zod, Bcrypt, JSON Web Tokens (JWT) |
| **Base de Datos** | PostgreSQL 16 (Persistencia desacoplada en volúmenes Docker) |
| **Render & 3D** | Three.js WebGL, PCF Soft Shadows, ACES Filmic Tone Mapping, Algoritmos SAT/OBB |
| **IA & Visión** | AIDesignEngine (V8) y AIVisionEngine (V9) con arquitectura desacoplada de proveedores |
| **DevOps & CI/CD** | Docker, Docker Compose, Portainer Stacks, GitHub Actions, GHCR (`ghcr.io`) |

---

## 🚀 Puesta en Marcha

### 1. Requisitos Previos
- **Node.js** v22.x o superior
- **npm** v10.x o superior
- **Docker** y **Docker Compose** (opcional para desarrollo, obligatorio para producción)

### 2. Configuración de Variables de Entorno
Copia la plantilla de configuración:
```bash
cp .env.example .env
```
Ajusta los valores en `.env` según tu entorno local (consulta `.env.example` para la documentación detallada).

### 3. Desarrollo Local
```bash
# 1. Instalar dependencias en la raíz y workspaces
npm install

# 2. Generar cliente Prisma
npm run prisma:generate

# 3. Iniciar entorno de desarrollo concurrente (Server :4000 + Client :3003)
npm run dev
```

Acceso:
- **Frontend**: [http://localhost:3003](http://localhost:3003)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Healthcheck**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 🐳 Despliegue con Docker

### Desarrollo y Verificación Local
```bash
# Construir e iniciar todos los servicios con base de datos
npm run docker:up

# O directamente con Docker Compose:
docker compose up -d --build

# Ver logs de los servicios
docker compose logs -f

# Detener los servicios
npm run docker:down
```

---

## 🚢 Despliegue en Producción con Portainer

HBD está preparado para desplegarse en **Portainer** mediante Stacks apuntando al repositorio de Git, utilizando imágenes precompiladas de **GitHub Container Registry (GHCR)**:

1. En Portainer, crea un nuevo **Stack** con método **Repository**.
2. **Repository URL**: `https://github.com/Buildwar/HBD.git`
3. **Repository reference**: `refs/heads/main`
4. **Compose path**: `docker-compose.portainer.yml`
5. Configura las variables de entorno (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `JWT_SECRET`, etc.).
6. Haz clic en **Deploy the stack**.

> 📖 Para una guía paso a paso detallada, consulta [docs/portainer.md](docs/portainer.md).

---

## 📦 Sistema de Release y Publicación Controlada

La publicación de versiones a GitHub y GHCR es **100% controlada y manual**. No existen autocommits ni publicaciones automáticas por guardado.

Para publicar una versión:
```bash
# En Windows (PowerShell):
npm run release

# En Linux/macOS (Bash):
npm run release:sh
```

El script ejecutará automáticamente:
1. Comprobación de estado Git y rama (`main`).
2. Comprobación del repositorio remoto `origin`.
3. Ejecución de `npm run lint`.
4. Ejecución de `npm run typecheck`.
5. Ejecución de `npm run test` (suite completa de pruebas).
6. Ejecución de `npm run build`.
7. Solicitud de confirmación interactiva `[S/N]`.
8. Si se confirma: creación del tag `v<version>`, commit y push hacia `origin`.
9. GitHub Actions compilará y publicará las imágenes en GHCR (`ghcr.io/buildwar/hbd-server` y `hbd-client`).

---

## 🔄 Rollback (Reversión de Versión)

Si una versión publicada presenta anomalías:
1. Accede al Stack `hbd` en Portainer.
2. En las variables de entorno, cambia `HBD_VERSION` a la versión anterior estable (ej. `9.0.0`).
3. Haz clic en **Update the stack**.
4. La aplicación volverá inmediatamente a la versión anterior sin afectar los volúmenes persistentes de base de datos ni uploads.

---

## 🧪 Scripts de npm Disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia backend y frontend simultáneamente en modo desarrollo |
| `npm run build` | Compila `@hbd/shared`, `@hbd/server` y `@hbd/client` para producción |
| `npm run lint` | Ejecuta validación de tipos y sintaxis en todos los workspaces |
| `npm run typecheck` | Comprobación estricta de TypeScript |
| `npm run test` | Ejecuta la suite de pruebas unitarias y de integración de todos los módulos |
| `npm run docker:build`| Construye localmente las imágenes Docker |
| `npm run docker:up` | Levanta los contenedores en segundo plano |
| `npm run docker:down`| Detiene los contenedores Docker |
| `npm run release` | Ejecuta el asistente interactivo de release y publicación |

---

## 📚 Documentación Adicional

- [Flujo Oficial de Despliegue](docs/deployment-flow.md)
- [Guía de GitHub Actions](docs/github-actions.md)
- [Guía de Portainer](docs/portainer.md)
- [Guía de Contribución](CONTRIBUTING.md)
- [Política de Seguridad](SECURITY.md)
- [Historial de Cambios (Changelog)](CHANGELOG.md)

---

## 📜 Licencia y Derechos de Autor

Desarrollado y mantenido por **Adrián Palma**.  
© 2026 Adrián Palma — HBD (Home Board Designer). Todos los derechos reservados.
