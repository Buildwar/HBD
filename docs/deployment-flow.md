# Flujo Oficial de Desarrollo y Despliegue de HBD

Este documento describe el ciclo de vida técnico completo de **HBD (Home Board Designer)** desde el desarrollo local en VS Code hasta su despliegue productivo en Portainer.

---

## 1. Diagrama de Arquitectura del Flujo

```
  ┌─────────────────────────────────────────────────────────┐
  │                    1. DESARROLLO LOCAL                  │
  │  • VS Code: desarrollo de código y componentes           │
  │  • npm run dev: servidor backend (:4000) y cliente (:3003)│
  │  • Base de datos local o Docker de desarrollo           │
  └────────────────────────────┬────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                2. VALIDACIÓN Y TEST LOCAL               │
  │  • npm run lint     (Verificación estricta TypeScript)   │
  │  • npm run test     (Suite completa de pruebas unitarias)│
  │  • npm run build    (Compilación limpia de bundles)      │
  │  • Commits locales bajo Conventional Commits             │
  └────────────────────────────┬────────────────────────────┘
                               │
                       Decisión Manual de Release
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                3. PUBLICACIÓN CONTROLADA                │
  │  • npm run release (Ejecuta scripts/release.ps1 o .sh)  │
  │  • Re-validación integral de lint, types, tests y build │
  │  • Confirmación explícita del usuario [S/N]             │
  │  • Creación del tag semántico (ej. v9.0.0)              │
  │  • Push de commits y tags al repositorio remoto         │
  └────────────────────────────┬────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │              4. REPOSITORIO GITHUB (ORIGIN)             │
  │  https://github.com/Buildwar/HBD.git                    │
  │  Rama principal: main                                   │
  └────────────────────────────┬────────────────────────────┘
                               │
                        Evento de Tag (v*)
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │                  5. GITHUB ACTIONS (CI/CD)              │
  │  • Workflow: .github/workflows/docker.yml               │
  │  • Checkout y dependencias limpias                      │
  │  • Verificación de tests (si fallan, no se publica)     │
  │  • Docker Build multi-stage optimizado                  │
  │  • Login seguro mediante GITHUB_TOKEN                   │
  └────────────────────────────┬────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │         6. GITHUB CONTAINER REGISTRY (GHCR.IO)          │
  │  • ghcr.io/buildwar/hbd-server:9.0.0, latest            │
  │  • ghcr.io/buildwar/hbd-client:9.0.0, latest            │
  └────────────────────────────┬────────────────────────────┘
                               │
                     Despliegue Controlado
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │              7. GESTIÓN MEDIANTE PORTAINER              │
  │  • Stack conectado a docker-compose.portainer.yml       │
  │  • Descarga directa de imágenes precompiladas de GHCR   │
  │  • Cero compilación en el servidor productivo           │
  │  • Variables y secretos gestionados en UI de Portainer  │
  └────────────────────────────┬────────────────────────────┘
                               │
                               ▼
  ┌─────────────────────────────────────────────────────────┐
  │               8. SERVIDOR EN PRODUCCIÓN                 │
  │  • Frontend SPA disponible en http://localhost:3003     │
  │  • Persistencia garantizada en volúmenes Docker         │
  │  • Healthcheck activo y monitorizado                    │
  │  • Capacidad inmediata de Rollback ante incidencias     │
  └─────────────────────────────────────────────────────────┘
```

---

## 2. Principios de Operación

1. **Aislamiento de Entornos**: El código se desarrolla y prueba localmente sin afectar el entorno de producción.
2. **Inmutabilidad de Artefactos**: Cada versión etiquetada genera una imagen Docker inmutable en GHCR con su versión semántica exacta y SHA asociado.
3. **Persistencia Desacoplada**: El código de la aplicación reside en contenedores efímeros; los datos del usuario (base de datos PostgreSQL y uploads) residen en volúmenes permanentes.
4. **Control Total del Desarrollador**: Las publicaciones a GitHub y las actualizaciones en Portainer son siempre acciones deliberadas y controladas.
