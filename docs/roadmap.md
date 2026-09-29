# Roadmap Oficial — HBD (Home Board Designer)

Estado de desarrollo por versiones:

---

### VERSIÓN 3.0.0 — AUTORÍA OFICIAL & CONSOLIDACIÓN CENTRAL [✓ TERMINADO]
- [x] Establecimiento de **Adrián Palma** como autor oficial y propietario del software en la arquitectura central (`@hbd/shared` -> `APP_METADATA`).
- [x] Separación estricta entre autoría del producto y cuentas de usuario / administrador.
- [x] Copyright formal centralizado con año parametrizado (`© 2026 Adrián Palma — HBD (Home Board Designer)`).
- [x] Suite de tests automáticos anti-regresión para autoría y metadatos (`server/src/__tests__/v3-system.test.ts`).
- [x] Consolidación del sistema de Themes & Design Tokens dinámicos con 8 paletas y selector hexadecimal en tiempo real.
- [x] Gestión de proyectos (Búsqueda, Filtro, Ordenación, Duplicación, Edición y Borrado con `ConfirmDialog`).
- [x] Administración de usuarios y roles RBAC (Crear, Editar, Activar/Desactivar con confirmación).
- [x] Internacionalización completa (i18n) sin textos no traducidos.
- [x] Versión 3.0.0 centralizada y visible en "Configuración → Acerca de".

---

### VERSIÓN 4.0.0 — MOTOR DE PLANOS, GEOMETRÍA & EDITOR 2D [✓ TERMINADO]
- [x] Motor de Geometría Puro (`GeometryEngine`) con Shoelace ($m^2$), distancias, ángulos, intersecciones y snapping.
- [x] Pipeline modular de detección: `PlanParserService`, `ScaleDetectorService`, `TextDetectorService`, `WallDetectorService`, `RoomDetectorService`, `DoorDetectorService`, `WindowDetectorService`, `AnalysisValidatorService`.
- [x] Ingestión de formatos PDF, PNG, JPG, JPEG con almacenamiento desacoplado.
- [x] Calibración métrica precisa (Escala automática + Calibración de 2 puntos de referencia).
- [x] Asignación de niveles de confianza (Alta ≥ 85%, Media 60-84%, Baja < 60%) y validación interactiva.
- [x] Editor 2D interactivo (`FloorplanEditor2D`) con plano original de fondo y control de opacidad (0-100%).
- [x] Herramientas de dibujo en tiempo real (Paredes, Habitaciones, Puertas, Ventanas, Medición de Cotas, Calibración).
- [x] Panel de capas con visibilidad individual y panel de propiedades para edición de entidades.
- [x] Pila Deshacer / Rehacer e indicador de guardado con persistencia transaccional en PostgreSQL.
- [x] Suite de 33 tests automatizados de sistema y cálculo geométrico.

---

### VERSIÓN 5.0.0 — MOTOR DE MOBILIARIO Y VALIDACIÓN ESPACIAL [✓ TERMINADO]
- [x] Catálogo paramétrico de mobiliario residencial estructurado por 15 categorías.
- [x] Creación de muebles personalizados con dimensiones en `cm`, `m` y `mm`.
- [x] Motor de detección de colisiones mediante **Separating Axis Theorem (SAT)** y **OBB**.
- [x] Comprobación de penetración de muros, contención de habitaciones y zonas de paso/abatimiento.
- [x] Algoritmo reactivo de veredicto **"¿CABE AQUÍ?"** (`VALID`, `WARNING`, `INVALID`).
- [x] Integración en el Editor 2D con líneas de cota dinámicas, arrastre y rotación rápida.
- [x] Suite de 28 tests unitarios y de integración para validación espacial.

---

### VERSIÓN 6.0.0 — MOTOR 3D DE VIVIENDA & GEMELO DIGITAL [✓ TERMINADO]
- [x] Motor de conversión 3D puro (`ThreeDConversionEngine`) con escala métrica real ($1\text{ unidad} = 1.0\text{ m}$).
- [x] Generación de muros volumétricos extruidos ($2.50\text{ m}$) con cálculo de grosor y orientación.
- [x] Suelos y techos poligonales triangulados con asignación de materiales.
- [x] Puertas 3D con animación interactiva de apertura y ventanas con antepecho y cristal translúcido reflectivo.
- [x] Mobiliario 3D procedural paramétrico.
- [x] Navegación dual en tiempo real: Modo Órbita y Modo Primera Persona [W][A][S][D] con detección de colisiones contra muros.
- [x] Iluminación dinámica Día/Noche, sombras suaves PCF y herramienta de medición láser 3D.
- [x] Sincronización bidireccional 3D ↔ 2D con persistencia en PostgreSQL.
- [x] Suite de 36 tests unitarios y de integración para el motor 3D.

---

### VERSIÓN 7.0.0 — MOTOR DE VISUALIZACIÓN ARQUITECTÓNICA Y RENDER [✓ TERMINADO]
- [x] Motor de Escenas (`SceneEngine`): Gestión CRUD de escenas, cámaras arquitectónicas con altura de ojo humana ($1.20 - 1.80\text{ m}$) y FOV personalizable.
- [x] Cálculo astronómico de azimut y elevación solar según hora del día (Mañana, Mediodía, Tarde, Atardecer, Noche).
- [x] Conversión física de temperatura de color Kelvin ($2700\text{K} - 6500\text{K}$) a valores de iluminación RGB.
- [x] Presets de estilo de diseño arquitectónico: Moderno, Minimalista, Industrial, Nórdico, Clásico.
- [x] Variantes de diseño (Variante A vs Variante B) con **geometría estructural compartida** y overrides de acabados.
- [x] Motor de Render (`RenderEngine`): Calidades Draft, Medium, High, Ultra con Tone Mapping y SSAO.
- [x] Exportación a resoluciones HD 1080p, 2K 1440p y 4K UHD con modal interactivo de progreso en 4 fases.
- [x] Galería de renders por proyecto con comparador interactivo split-screen Antes / Después.
- [x] Modo Presentación a pantalla completa sin distracciones.
- [x] Suite de 35 tests automatizados para el sistema de render (`server/src/__tests__/v7-render-system.test.ts`).

---

### VERSIÓN 8.0.0 — AI DESIGN & INTERIORISM ENGINE [✓ TERMINADO]
- [x] Motor de IA de Diseño e Interiorismo (`AIDesignEngine`) basado en geometría real y normativas espaciales.
- [x] Arquitectura de proveedores desacoplada (`DesignAIProvider`): `MockDesignAIProvider` determinista y `OpenAiDesignProvider` (Structured Outputs JSON Schema).
- [x] Validación espacial geométrica estricta (`SpatialValidationEngine`): detección de colisiones, radio de puertas, zonas de paso libre (0.70m - 0.90m) e iluminación por ventanas.
- [x] Generación de 1 a 3 propuestas de interiorismo paramétricas con sugerencias de mobiliario, materiales PBR e iluminación.
- [x] Asistente Copilot de Diseño (`AICopilotBar`) con comandos en lenguaje natural convertidos en acciones estructuradas (`AIAction`).
- [x] Variantes de diseño (`DesignVariant`) con almacenamiento de overrides en PostgreSQL sin alterar ni duplicar destructivamente la planta base.
- [x] Historial persistente de generaciones IA y comparador interactivo de variantes.
- [x] Integración en el Editor 2D, Visor 3D y vista de detalle de proyecto con control de acceso RBAC.
- [x] Suite de tests automatizados de sistema V8 (`server/src/__tests__/v8-ai-design-system.test.ts`).

---

### VERSIÓN 9.0.0 — AI VISION & SMART RECOGNITION ENGINE [✓ TERMINADO]
- [x] Motor de visión artificial (`AIVisionEngine`) para análisis multimodal de fotografías reales, bocetos e imágenes de inspiración.
- [x] Detección de estancias (`RoomDetection`), mobiliario con bounding boxes (`FurnitureDetection`), materiales (`MaterialDetection`) y relaciones espaciales (`SpatialRelation`).
- [x] Jerarquía de dimensiones segura y flujo de revisión humana obligatoria: `DimensionSource.AI_ESTIMATED` asciende a `USER_CONFIRMED` tras la aprobación del usuario.
- [x] Motor de comparativa realidad vs modelo (`VisionDiffEngine` / `compareWithProject`) identificando coincidencias (`MATCH`), elementos nuevos (`NEW`) y ausentes (`MISSING`).
- [x] Extractor de perfiles de inspiración (`InspirationProfile`) y paletas cromáticas (`VisualPalette`) con conexión directa hacia el motor `AIDesignEngine (V8)`.
- [x] Centro de operaciones de galería de proyectos (`ProjectGalleryPage`) con visores de alta resolución (`VisionImageViewer`) y modales especializados.
- [x] Integración de base de datos PostgreSQL mediante modelo `ProjectImage` y endpoints seguros en `/api/ai/vision`.
- [x] Suite de 45 tests automatizados de sistema V9 (`server/src/__tests__/v9-vision-system.test.ts`).

---

### VERSIÓN 10.0.0 — GEMELO DIGITAL TÉCNICO & MEP [○ PLANIFICADO]
- [ ] Trazado de instalaciones de fontanería, electricidad y climatización (HVAC / MEP).
- [ ] Estimación automática de presupuestos de reforma y mediciones de materiales.
- [ ] Inventario de activos y mantenimiento preventivo del hogar.

