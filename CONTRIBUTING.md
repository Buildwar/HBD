# Guía de Contribución y Desarrollo — HBD

Gracias por contribuir a **HBD (Home Board Designer)**. Este documento establece las normas y flujo de trabajo técnico para el desarrollo, control de versiones y publicaciones.

---

## 1. Identidad y Autoría

- **Nombre del Software**: HBD (Home Board Designer)
- **Autor y Propietario**: Adrián Palma
- **Copyright**: © 2026 Adrián Palma — HBD (Home Board Designer)
- **Repositorio Oficial**: `https://github.com/adrianpalma360-create/HBD.git`
- **Rama Principal**: `main`

---

## 2. Flujo de Trabajo en Desarrollo

1. **Trabajo Local**:
   - Todo el desarrollo se realiza en el entorno de desarrollo local con VS Code.
   - Ejecutar servidor y cliente simultáneamente con:
     ```bash
     npm run dev
     ```
2. **Validaciones Previas a Commits**:
   - Antes de realizar cualquier commit local, validar la integridad del código:
     ```bash
     npm run lint
     npm run typecheck
     npm run test
     npm run build
     ```
3. **Mensajes de Commit (Conventional Commits)**:
   - Utilizar el estándar Conventional Commits:
     - `feat: <nueva funcionalidad>`
     - `fix: <corrección de error>`
     - `refactor: <reestructuración sin cambio de comportamiento>`
     - `docs: <documentación>`
     - `chore: <mantenimiento o configuración>`
     - `ci: <integración continua o workflows>`
     - `test: <adición o modificación de pruebas>`

---

## 3. Política de Publicación y Releases

- **Prohibición de Autocommit/Autopush**: No se permite la publicación automática por guardado de archivo o watchers. Cada publicación a GitHub debe ser explícitamente decidida y validada.
- **Proceso de Release**:
  - Para publicar una versión validada, ejecutar:
    ```bash
    npm run release
    ```
  - El script verificará el estado del repositorio, rama actual, tests y compilación, y solicitará confirmación explícita antes de crear el tag semántico y hacer `git push`.
