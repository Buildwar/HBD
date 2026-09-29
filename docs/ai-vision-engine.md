# HBD — AI Vision & Smart Recognition Engine (V9.0.0)

**Autor:** Adrián Palma  
**Copyright:** © 2026 Adrián Palma — HBD (Home Board Designer)  
**Versión del Sistema:** 9.0.0  

---

## 1. Visión General y Arquitectura

El **AI Vision Engine** introduce en HBD capacidades avanzadas de visión artificial, análisis fotográfico, detección de objetos y mobiliario, extracción de materiales y paletas cromáticas, estimación de escalas métricas y discrepancias entre la realidad física y el modelo digital 3D.

### Flujo Arquitectónico Integral:
```
FOTO REAL / INSPIRACIÓN
        │
        ▼
   AI VISION ENGINE
   - Bounding Boxes
   - Detección de Categorías
   - Estimación de Dimensiones (AI_ESTIMATED)
   - Extracción de Materiales y Paletas
        │
        ▼
   REVISIÓN HUMANA OBLIGATORIA
   (Confirmar / Ajustar Medidas / Rechazar)
        │
        ├─────────────────────────────┬─────────────────────────────┐
        ▼                             ▼                             ▼
  MAPEO A MOBILIARIO          CONVERSIÓN A V8             COMPARADOR REAL VS 3D
  (DimensionSource asciende   (InspirationProfile ->      (VisionDiffEngine:
   a USER_CONFIRMED)           DesignPreferences)          MATCH / NEW / MISSING)
        │                             │                             │
        ▼                             ▼                             ▼
  MOTOR GEOMÉTRICO (V4)       MOTOR IA DISEÑO (V8)         VALIDACIÓN ESPACIAL (V5)
        │                             │                             │
        └─────────────────────────────┴─────────────────────────────┘
                                      │
                                      ▼
                            MOTOR 3D Y RENDER (V6 / V7)
```

---

## 2. Principios de Seguridad y Jerarquía de Dimensiones

Una regla de oro en HBD es que la visión artificial produce **estimaciones preliminares** a partir de proyecciones 2D. Por tanto:
1. **Nunca sobreescribe** geometría o mobiliario confirmado sin validación humana.
2. **Jerarquía estricta de fuentes de dimensión:**
   $$\text{USER\_CONFIRMED} > \text{MANUAL} > \text{CATALOG} > \text{AI\_ESTIMATED} > \text{ESTIMATED} > \text{UNKNOWN}$$
3. Al editar o confirmar manualmente una pieza detectada por IA, su fuente asciende a `USER_CONFIRMED` antes de incorporarse al plano de planta y someterse a la validación de colisiones del **SpatialValidationEngine (V5)**.

---

## 3. Componentes del Módulo

### 3.1 Proveedores de Visión (`VisionProvider`)
- **`MockVisionProvider`**: Proveedor determinista para entornos de desarrollo y pruebas automatizadas.
- **`OpenAiVisionProvider`**: Proveedor multimodal basado en GPT-4o / Vision con prompting estructurado y fallback de robustez.

### 3.2 Endpoints Backend (`/api/ai/vision`)
- `POST /api/ai/vision/upload`: Subida y almacenamiento de imágenes con validación de tipo y tamaño.
- `GET /api/ai/vision/projects/:projectId/images`: Galería de imágenes del proyecto por estancias y categorías.
- `POST /api/ai/vision/analyze/:imageId`: Ejecución de análisis de visión artificial estructurado.
- `POST /api/ai/vision/diff/:imageId`: Comparativa de discrepancias (Realidad vs Modelo 3D).
- `POST /api/ai/vision/review/:imageId`: Aplicación de revisión humana validada al plano del proyecto.
- `POST /api/ai/vision/inspiration/:imageId`: Extracción de perfil de estilo para conectar con el motor V8.

### 3.3 Componentes Frontend
- **`ProjectGalleryPage`**: Centro de mando de imágenes del proyecto con filtros por estancia y tipo.
- **`VisionImageViewer`**: Visor de alta resolución con soporte para zoom, pan y superposición de *bounding boxes* interactivas.
- **`VisionReviewModal`**: Modal de revisión humana con previsualización, ajuste de dimensiones y confirmación por ítems.
- **`VisionDiffModal`**: Comparador visual y tabular de coincidencias y elementos nuevos o faltantes.
- **`InspirationModal`**: Extractor de atmósfera, paleta cromática y materiales con botón directo "Diseñar con este estilo" hacia V8.

---

## 4. Auditoría de Versión y Cumplimiento

- **Identidad Oficial**: Adrián Palma
- **Copyright**: © 2026 Adrián Palma — HBD (Home Board Designer)
- **Centralización**: La versión 9.0.0 se muestra **exclusivamente** en `Configuración -> Acerca de`. Ningún menú, botón ni badge contiene textos obsoletos o versiones de fases anteriores.
