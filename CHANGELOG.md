# Changelog — HBD (Home Board Designer)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [9.0.0] - 2026-09-29

### Infrastructure
- Configuración de repositorio oficial en GitHub (`https://github.com/adrianpalma360-create/HBD.git`).
- Configuración de pipelines de GitHub Actions:
  - `ci.yml`: Integración continua, comprobación estricta de TypeScript, linting, tests y compilación en PRs y pushes a ramas principales.
  - `docker.yml`: Publicación automatizada multi-stage en GitHub Container Registry (`ghcr.io`) basada en tags de versión semántica y `workflow_dispatch`.
- Creación de especificación `docker-compose.portainer.yml` optimizada para Portainer Stacks sin requerir compilación en el servidor destino.
- Actualización de `docker-compose.yml` para validación y desarrollo local con healthchecks automáticos.
- Creación de `.dockerignore` y ampliación de `.gitignore` para exclusión exhaustiva de secretos, logs, temporales y dependencias.
- Implementación de scripts de release interactivo manual (`scripts/release.ps1` y `scripts/release.sh`) con comprobaciones previas de integridad.
- Documentación completa de despliegue (`docs/github-actions.md`, `docs/portainer.md`, `docs/deployment-flow.md`, `CONTRIBUTING.md`, `SECURITY.md`).

### Added
- Endpoint de comprobación de salud `/health` y `/api/health` para sondas de Docker y Portainer.
- Integración y soporte completo de los motores de arquitectura: Motor 2D, Motor 3D, Motor de Visualización y Render, Motor de IA de Diseño (V8) y Motor de Visión Artificial (V9).

### Security
- Aislamiento total de credenciales y secretos del código fuente hacia variables de entorno seguras.
- Eliminación de referencias sensibles y documentación de variables de producción en `.env.example`.
- Configuración de imágenes en modo producción y políticas de rollback sin pérdida de datos en volúmenes persistentes.
