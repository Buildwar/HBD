# HBD — V22 / 1.22.0: AR / Real Space Visualization
## Visualización en Realidad Aumentada y Proyección sobre el Espacio Físico Real

**Autor:** Adrián Palma  
**Versión del Software:** `1.22.0`  
**Fase del Roadmap:** `V22`  
**Copyright:** © 2026 Adrián Palma. Todos los derechos reservados.

---

## 1. Visión General y Objetivos

La versión **1.22.0 (Fase V22)** introduce la capacidad de **proyectar directamente el diseño virtual de HBD sobre la vivienda física real**, permitiendo a propietarios, arquitectos, instaladores y decoradores evaluar la escala, volumen, holguras, colisiones e interferencias antes de cualquier compra u obra física.

```
PLANO HBD 2D/3D (V10)
         +
GEMELOS DIGITALES DE CATÁLOGO (V20)
         +
INSTALACIONES Y SMART HOME (V21)
         +
ESCENARIOS Y REFORMAS (V12-V15)
         ↓
  CALIBRACIÓN MÉTRICA
         ↓
PROYECCIÓN AR / FOTO AR / COMPARATIVA ANTES-DESPUÉS
```

---

## 2. Arquitectura de Motores AR

HBD V22 implementa una arquitectura modular desacoplada en `@hbd/shared`:

### 2.1. `ARCapabilityEngine`
- Evalúa en tiempo de ejecución las capacidades de hardware y navegador (WebXR, sensores de cámara, giroscopio/acelerómetro, detección de planos, hit-testing).
- Selecciona de forma adaptativa el modo óptimo y gestiona fallbacks automáticos:
  1. `WEBXR_IMMERSIVE`: AR nativa 6DoF con detección de planos.
  2. `CAMERA_TRACKED`: Orientación mediante giroscopio sobre vídeo de cámara.
  3. `PHOTO_AR`: Superposición calibrada sobre fotografías estáticas.
  4. `AR_PREVIEW`: Simulador interactivo en canvas 3D con retícula perspectiva.

### 2.2. `ARCalibrationEngine`
- Convierte distancias en píxeles a metros reales sin depender de sensores LIDAR exclusivos.
- Soporta referencias estándar precargadas:
  - Puerta interior estándar EU/ES (`2.03 m`, calidad `HIGH`).
  - Ventana estándar (`1.20 m`, calidad `MEDIUM`).
  - Hoja A4 estandarizada (`0.297 m`, calidad `HIGH`).
  - Medida directa de plano o cota conocida (`HIGH`).
  - Mueble de catálogo con cota certificada (`MEDIUM`).
  - Calibración manual del usuario.

### 2.3. `ARAnchorEngine`
- Gestiona anclajes espaciales 3D para mobiliario e infraestructura técnica.
- Ajuste automático de plano (`FLOOR` Y=0, `CEILING` Y≥2.4m, `WALL` Z plano).
- Cálculo de distancias euclidianas 3D.
- Detección de colisiones e interferencias entre cajas de delimitación (bounding boxes).
- Comprobación de límites de habitación (`roomBounds`).

### 2.4. `ARMeasurementEngine`
- Mediciones punto a punto en tiempo real.
- Puntuación de calidad de medición (`HIGH`, `MEDIUM`, `LOW`, `ESTIMATED_UNKNOWN`) según el ratio de confianza.
- Formateo dinámico de unidades (`m` y `cm`).
- Validación de holgura y cabida (`checkFitsInMeasuredSpace`) con tolerancias.

### 2.5. `ARComparisonEngine`
- Comparación visual del estado físico actual (Antes) frente al proyecto virtual HBD (Después).
- Modos soportados:
  - `BEFORE_AFTER_SLIDER`: Deslizador dividido con interacción de arrastre 0-100%.
  - `SIDE_BY_SIDE`: Vista dividida lado a lado.
  - `OPACITY_OVERLAY`: Superposición transparente regulable 0-100% con modo malla (*wireframe*).

### 2.6. `ARVisualizationEngine` (Fachada Maestra)
- Orquesta el ciclo de vida completo de escenas AR, anclajes, calibraciones y mediciones.

---

## 3. Trazabilidad y Calidad de Modelos 3D

Para evitar falsas expectativas de fidelidad o precisión dimensional, cada elemento anclado en AR declara su procedencia (*provenance*):
- `OFFICIAL_3D_MODEL`: Modelo oficial verificado por el fabricante.
- `RETAIL_IMPORTED_GLTF`: Modelo GLTF/GLB importado de tienda o catálogo conectado (V20).
- `PARAMETRIC_GENERATED`: Geometría paramétrica generada a partir de cotas exactas.
- `AI_RECONSTRUCTED_3D`: Malla reconstruida mediante IA a partir de fotos.
- `PRIMITIVE_BOX_FALLBACK`: Caja delimitadora orientativa.

---

## 4. Endpoints de la API REST (`/api/ar`)

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/ar/detect-capabilities` | Evalúa hardware del cliente y retorna modo AR recomendado |
| `POST` | `/api/ar/calibrate` | Calcula ratio metro/píxel según referencia física conocida |
| `POST` | `/api/ar/validate-placement` | Valida colisiones e interferencias de anclajes AR |
| `POST` | `/api/ar/measure` | Calcula y registra medición 3D punto a punto con calidad |
| `GET` | `/api/ar/projects/:projectId/scenes` | Lista las escenas AR asociadas a un proyecto |
| `POST` | `/api/ar/projects/:projectId/scenes` | Crea una nueva escena AR |
| `GET` | `/api/ar/scenes/:sceneId` | Obtiene el detalle de una escena AR con anclajes |
| `PUT` | `/api/ar/scenes/:sceneId` | Actualiza parámetros, cámara o configuración comparativa |
| `POST` | `/api/ar/scenes/:sceneId/anchors` | Añade o actualiza un anclaje 3D en la escena |
| `DELETE` | `/api/ar/anchors/:anchorId` | Elimina un anclaje |
| `GET` | `/api/ar/projects/:projectId/captures` | Lista instantáneas y capturas AR del proyecto |
| `POST` | `/api/ar/projects/:projectId/captures` | Guarda una nueva instantánea AR |

---

## 5. Modelos de Base de Datos Prisma

- `ARScene`: Configuración de escena AR, modo, estado de tracking, cámara, iluminación y comparativa.
- `ARAnchor`: Elementos 3D proyectados (posición, rotación, escala, procedencia, confirmación y colisión).
- `ARScaleReference`: Marcadores y referencias de escala métrica.
- `ARMeasurement`: Mediciones espaciales punto a punto con nivel de calidad y confianza.
- `ARCapture`: Instantáneas fotográficas guardadas con pose de cámara y metadatos.
