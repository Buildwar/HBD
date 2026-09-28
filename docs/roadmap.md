# Roadmap Oficial — HBD (Home Board Designer)

Estado de desarrollo por fases:

---

### FASE 1 — FOUNDATION [✓ TERMINADO]
- [x] Estructura modular monorepo con TypeScript (`client`, `server`, `shared`).
- [x] Backend Express + Prisma ORM + PostgreSQL.
- [x] Frontend React + Vite + Tailwind CSS + Lucide Icons.
- [x] Autenticación JWT, sesiones seguras y hashing Bcrypt.
- [x] Sistema de Roles (ADMIN, DESIGNER, USER, VIEWER) y permisos RBAC.
- [x] Panel de Control / Dashboard interactivo con métricas de vivienda.
- [x] Módulo de Proyectos (CRUD, multi-planta, habitaciones y áreas).
- [x] Sistema de Configuración completa con 12 pestañas.
- [x] Sistema de Temas (Dark UI moderno Spotify-inspired, claro, colores de acento, bordes y densidad).
- [x] Internacionalización i18n nativa (Español / Inglés).
- [x] Sección "Acerca de" con autoría (`apalma`), versión (`1.0.0`) y copyright centralizados.
- [x] Dockerfile (multi-stage) y Docker Compose.
- [x] Despliegue listo para Portainer (`docker-compose.portainer.yml`).
- [x] Pipeline de CI/CD para GitHub Actions (`.github/workflows/ci.yml`).
- [x] Documentación técnica completa (`docs/`).

---

### FASE 2 — PLANOS [🟡 EN DESARROLLO]
- [x] Modelado de base de datos de planos (`floor_plans`) y estados.
- [x] Interfaz de módulo de planos arquitectónicos.
- [ ] Subida y procesamiento de PDFs vectoriales vs imágenes rasterizadas.
- [ ] Detección automática de escala numérica y gráfica (píxeles → metros).
- [ ] Herramienta de calibración de referencia manual ("3,42 m").
- [ ] Pantalla de validación y confirmación de elementos detectados.

---

### FASE 3 — GEOMETRÍA & EDITOR 2D [○ PENDIENTE]
- [x] Esquema relacional de paredes (`walls`), habitaciones (`rooms`), puertas y ventanas.
- [ ] Lienzo interactivo 2D (pan, zoom, snapping, cuadrícula).
- [ ] Creación y edición paramétrica de paredes y tabiques.
- [ ] Cálculo dinámico de superficies poligonales ($m^2$) e intersecciones.
- [ ] Herramienta "Medir" punto-a-punto y cota en tiempo real.

---

### FASE 4 — MOBILIARIO & VALIDACIÓN ESPACIAL [🟡 PREPARADO EN BD / UI]
- [x] Categorías de mobiliario y catálogo inicial en base de datos.
- [x] Modelado de colocación espacial (`furniture_placements`).
- [ ] Creación de muebles personalizados con ancho, fondo y alto.
- [ ] Arrastre, rotación y duplicación en el plano 2D.
- [ ] Función "¿Cabe aquí?" con detección de colisiones con paredes y puertas.
- [ ] Comprobación de zonas de paso mínimas y circulación.

---

### FASE 5 — MODELO 3D [○ PENDIENTE]
- [ ] Conversión paramétrica del modelo 2D a mallas 3D (Three.js / WebGL).
- [ ] Extrusión de paredes con huecos de puertas y ventanas.
- [ ] Controles de cámara: orbit, vista superior, habitación y primera persona.
- [ ] Suelos y techos con asignación de materiales.

---

### FASE 6 — IA MODULAR [○ PENDIENTE]
- [ ] Capa modular desacoplada para OCR y visión de planos.
- [ ] Reconocimiento de tipología de muebles a partir de fotografías.
- [ ] Asistente de distribución espacial.

---

### FASE 7 — RENDERIZADO [○ PENDIENTE]
- [x] Modelo de datos para almacenamiento de renders.
- [ ] Generación de perspectivas cenitales y fotorrealistas.
- [ ] Iluminación ambiental y materiales avanzados.

---

### FASE 8 — GEMELO DIGITAL DE LA VIVIENDA [○ PENDIENTE]
- [ ] Trazado de instalaciones (electricidad, fontanería, climatización).
- [ ] Estimación de presupuestos de reforma y mediciones de materiales.
- [ ] Inventario de activos y mantenimiento del hogar.
