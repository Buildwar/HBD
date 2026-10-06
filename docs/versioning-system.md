# HBD — Sistema Oficial de Versionado Semántico y Fases del Roadmap

**Autor:** Adrián Palma  
**Copyright:** © 2026 Adrián Palma — HBD (Home Board Designer). Todos los derechos reservados.

---

## 1. Separación Conceptual: Fase vs. Versión

En HBD existen dos conceptos independientes y complementarios:

1. **FASE DEL ROADMAP (`V1`, `V2`, `V3`... `V20`, `V21`...):**
   - Representa el hito funcional y arquitectónico dentro del plan de desarrollo del producto.
   - Mantiene la nomenclatura `V<Número>` en documentación, títulos de módulos y debates de roadmap.

2. **VERSIÓN DEL SOFTWARE (`MAJOR.MINOR.PATCH`):**
   - Representa la versión técnica ejecutable del software adherida al estándar **Semantic Versioning (SemVer)**.
   - Sigue la regla contractual de HBD:
     - **`MAJOR` (1):** Generación principal del producto.
     - **`MINOR`:** Fase funcional del roadmap (`0` para V1, `2` para V2, `20` para V20, `21` para V21, etc.).
     - **`PATCH`:** Correcciones, revisiones, hotfixes o ajustes menores dentro de una misma fase (`1.20.0`, `1.20.1`, `1.20.2`...).

---

## 2. Tabla Oficial de Correspondencias

| Fase del Roadmap | Versión del Software | Descripción / Hito Funcional |
|---|---|---|
| **Fase V1** | `1.0.0` | Core Architecture, Auth & Foundations |
| **Fase V2** | `1.2.0` | Design System, Theming & Multi-Language |
| **Fase V3** | `1.3.0` | Project & Floorplan Management |
| **Fase V4** | `1.4.0` | Floorplan Engine |
| **Fase V5** | `1.5.0` | Furniture Engine |
| **Fase V6** | `1.6.0` | 3D Engine |
| **Fase V7** | `1.7.0` | Rendering & Visualization |
| **Fase V8** | `1.8.0` | AI Design & Interiorism |
| **Fase V9** | `1.9.0` | AI Vision & Multimodal Spatial Recognition |
| **Fase V10** | `1.10.0` | Project & Spatial Intelligence |
| **Fase V11** | `1.11.0` | Construction & Renovation Intelligence |
| **Fase V12** | `1.12.0` | Intelligent Project Planning & Scenario Engine |
| **Fase V13** | `1.13.0` | Intelligent Design Optimization Engine |
| **Fase V14** | `1.14.0` | Professional Project Documentation & Presentation |
| **Fase V15** | `1.15.0` | Construction Execution & Site Management |
| **Fase V16** | `1.16.0` | Real Product Import & Digital Furniture Twin |
| **Fase V17** | `1.17.0` | Project Investment & Total Cost Intelligence |
| **Fase V18** | `1.18.0` | Procurement & Project Purchasing Intelligence |
| **Fase V19** | `1.19.0` | Configuration & System Management |
| **Fase V20** | `1.20.0` | Connected Retail Catalog & Product Placement |
| **Fase V21** | `1.21.0` | Smart Home & Technical Infrastructure *(Futuro)* |
| **Fase V22** | `1.22.0` | Facility Management & Maintenance *(Futuro)* |
| **Fase V23** | `1.23.0` | Advanced Real Estate Valuation *(Futuro)* |
| **Fase V24** | `1.24.0` | Multi-Unit & Urban Scale Design *(Futuro)* |

---

## 3. Reglas de Incremento y Ciclo de Vida

### 3.1 Correcciones y Ajustes (PATCH)
Cuando se efectúa una corrección de errores, refactorización interna o ajuste menor dentro de una fase:
- `1.20.0` → `1.20.1`
- `1.20.1` → `1.20.2`
- `1.20.2` → `1.20.3`

*Nota:* Los incrementos de PATCH **NO** modifican el número de fase del roadmap (permanecen bajo la Fase V20).

### 3.2 Nuevas Fases del Roadmap (MINOR)
Al completar una nueva fase del roadmap:
- `Fase V20` (`1.20.x`) → `Fase V21` (`1.21.0`)
- `Fase V21` (`1.21.x`) → `Fase V22` (`1.22.0`)

### 3.3 Generaciones Mayores (MAJOR)
`MAJOR` permanece en `1` salvo decisión estratégica y explícita de arquitectura para iniciar **HBD 2.0**.

---

## 4. Única Fuente de Verdad (Single Source of Truth)

La versión del software se centraliza en:
1. `version.json` (Raíz del proyecto)
2. `APP_METADATA.version` en `@hbd/shared` (`shared/src/config/app.constants.ts`)
3. `APP_CONFIG.version` en frontend (`client/src/config/app.config.ts`)
4. `package.json` en raíz y en los paquetes de los workspaces (`shared`, `server`, `client`)
5. Motor utilitario `VersionEngine` (`shared/src/utils/version.engine.ts`)

---

## 5. Visualización en la Interfaz de Usuario

Se mantiene la regla estricta de experiencia de usuario:
- La versión del software **ÚNICAMENTE** se visualiza en:
  **Configuración → Acerca de**
- No se muestran badges ni textos de versión (`V20`, `1.20.0`) en:
  - Barra lateral (*Sidebar*)
  - Cabecera (*Navbar*)
  - Dashboard
  - Tarjetas de módulos
  - Modales o páginas funcionales
