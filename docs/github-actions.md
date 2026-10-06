# GitHub Actions — CI & GHCR Publication

Este documento describe la arquitectura de integración continua (CI) y publicación de contenedores (Release) de **HBD (Home Board Designer)** mediante GitHub Actions.

---

## 1. Principios de Integración y Entrega

1. **Sin publicación automática sin control**: Ningún guardado ni push individual publica imágenes a producción sin validación.
2. **Separación estricta entre CI y Release**:
   - **CI (`ci.yml`)**: Valida código en cada push a ramas principales y en Pull Requests.
   - **Release & GHCR (`docker.yml`)**: Compila, verifica y publica imágenes de producción en GitHub Container Registry únicamente ante eventos de versión explícitos (Tags `v*` o `workflow_dispatch`).
3. **Cero secretos en código**: Todas las credenciales sensibles se inyectan a través de secretos y variables de entorno.

---

## 2. Workflows Disponibles

### A. Pipeline de Integración Continua (`ci.yml`)
- **Disparadores**: `push` en ramas `main`, `master`, `develop`; `pull_request` hacia `main`, `master`.
- **Fases**:
  1. **Checkout**: Descarga del código fuente.
  2. **Setup Node.js**: Node 22 con caché de `npm`.
  3. **Dependencies**: `npm ci` limpio.
  4. **Lint & Typecheck**: Verificación TypeScript estricta en `@hbd/shared`, `@hbd/server` y `@hbd/client`.
  5. **Prisma Generation**: Regeneración y tipado del cliente de base de datos.
  6. **Automated Tests**: Ejecución de las suites de prueba de todos los motores del sistema.
  7. **Production Build**: Compilación de paquetes y bundle SPA Vite.
  8. **Dry-run Docker Build**: Comprobación de construcción de contenedores Docker sin realizar `push`.

### B. Pipeline de Release y GHCR (`docker.yml`)
- **Disparadores**: 
  - Creación y subida de tag Git (ej. `v9.0.0`).
  - Disparo manual interactivo mediante la pestaña **Actions → Run workflow** (`workflow_dispatch`).
- **Permisos requeridos**:
  - `contents: read`
  - `packages: write`
- **Registro destino**: `ghcr.io`
- **Imágenes generadas**:
  - `ghcr.io/buildwar/hbd-server:<version>`
  - `ghcr.io/buildwar/hbd-server:latest`
  - `ghcr.io/buildwar/hbd-server:sha-<hash>`
  - `ghcr.io/buildwar/hbd-client:<version>`
  - `ghcr.io/buildwar/hbd-client:latest`
  - `ghcr.io/buildwar/hbd-client:sha-<hash>`

---

## 3. Flujo de Ejecución de un Release

```
  [ Tag v9.0.0 creado ]
            │
            ▼
 ┌──────────────────────┐
 │   GitHub Actions     │
 └──────────┬───────────┘
            │
      1. Instalar y validar
      2. Ejecutar tests (100% pass)
      3. Compilar artefactos
            │
            ├─► Si falla alguna prueba ──► ABORTAR (No se publica imagen)
            │
            ▼
 ┌──────────────────────┐
 │ Docker Build & Push  │
 └──────────┬───────────┘
            │
            ▼
 ┌──────────────────────┐
 │  GHCR (ghcr.io)      │
 │  • hbd-server:9.0.0  │
 │  • hbd-client:9.0.0  │
 └──────────────────────┘
```

---

## 4. Política de 'latest'

La etiqueta `latest` en GHCR únicamente se actualiza cuando una versión supera con éxito todas las pruebas unitarias, de integración, de tipos y la construcción completa de imágenes Docker.
