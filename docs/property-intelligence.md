# HBD — V23 / 1.23.0: Property Intelligence
## Inteligencia Integral del Inmueble y Evaluación Multidimensional

**Autor:** Adrián Palma  
**Versión del Software:** `1.23.0`  
**Fase del Roadmap:** `V23`  
**Copyright:** © 2026 Adrián Palma. Todos los derechos reservados.

---

## 1. Visión General y Objetivos

La versión **1.23.0 (Fase V23)** introduce **Property Intelligence**, la capa superior de análisis y comprensión integral del inmueble físico, desacoplándolo de los proyectos individuales.

```
PROPERTY (Inmueble Físico Independiente)
   │
   ├── Project A: Reforma Integral 2026
   ├── Project B: Escenario Alternativo Inversión
   └── Project C: Actualización Domótica / V21
   │
   ↓
PROPERTY INTELLIGENCE (Capa de Análisis Transversal)
   │
   ├── Perfil Espacial & Distribución (V4, V10)
   ├── Mobiliario & Gemelos de Catálogo (V5, V20)
   ├── Infraestructura Técnica & Smart Home (V21)
   ├── Planificación de Obra & Mediciones (V11)
   ├── Ejecución Real en Obra (V15)
   ├── Inversión, Presupuestos & ROI (V17)
   ├── Planificación de Compras (V18)
   ├── Inteligencia Visual & IA (V8, V9)
   ├── Proyección en Realidad Aumentada (V22)
   ├── Oportunidades de Optimización & Ahorro
   ├── Riesgos & Banderas de Revisión Técnica
   ├── Auditoría de Calidad del Dato
   └── Instantáneas Temporales (Snapshots)
```

---

## 2. Principio Fundamental: Property vs Project

- **`Property` (Inmueble):** Representa el activo inmobiliario físico real (dirección, tipología, año de construcción, superficie total, calificación energética, estado general).
- **`Project` (Proyecto):** Representa una intervención, diseño, reforma o escenario específico aplicado sobre el inmueble.
- Un inmueble puede albergar múltiples proyectos concurrentes o históricos sin colisión ni sobreescritura de datos.

---

## 3. Trazabilidad de Fuentes (`DataSourceType`) y Confianza (`ConfidenceLevel`)

Toda métrica, superficie, cota, coste o evaluación técnica declara explícitamente su procedencia:
- `OFFICIAL`: Cédula, catastro o documentación visada.
- `USER_PROVIDED`: Aportado directamente por el usuario.
- `DOCUMENT`: Extraído de escrituras, presupuestos o informes técnicos.
- `PLAN`: Calculado a partir de plano arquitectónico digitalizado.
- `IMAGE` / `VISION`: Detectado mediante IA de visión artificial.
- `CATALOG`: Dimensiones o precios certificados por tienda/fabricante.
- `MEASURED`: Medido in situ o mediante AR.
- `CALCULATED`: Obtenido mediante fórmulas matemáticas exactas.
- `AI_ESTIMATED`: Inferencia o sugerencia generada por IA (requiere revisión técnica).

Niveles de confianza: `CONFIRMED`, `ESTIMATED`, `CALCULATED`, `UNKNOWN`.

---

## 4. Motores Modulares en `@hbd/shared`

1. **`PropertyAnalysisEngine`:**
   - Desglose de superficies útiles y construidas.
   - Cálculo del ratio de circulación (`circulationRatio`) y almacenamiento (`storageRatio`).
   - Matriz de adyacencias funcionales entre estancias (ej. Cocina-Salón, Dormitorio-Baño).

2. **`PropertyOpportunityEngine`:**
   - Detección de mejoras: apertura de conceptos abiertos, armarios empotrados, climatización zonificada, red Wi-Fi mesh y carpinterías de alta eficiencia.
   - Clasificación por prioridad (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), costes estimados e impacto.

3. **`PropertyRiskEngine`:**
   - Identificación de riesgos en instalaciones obsoletas (pre-REBT 2002), posibles afecciones a muros de carga y condensación en zonas húmedas.
   - Marca obligatoria: `requiresProfessionalReview = true` para toda sospecha estructural o de seguridad.

4. **`PropertyDataQualityEngine`:**
   - Porcentaje de completitud del perfil del inmueble.
   - Conteo de campos confirmados, calculados, estimados y desconocidos.
   - Detección de campos clave ausentes y recomendaciones de mejora.

5. **`PropertySnapshotEngine`:**
   - Creación de instantáneas inmutables (`INITIAL_EXISTING`, `PROPOSED_DESIGN`, `DURING_RENOVATION`, `EXECUTED_FINAL`).
   - Comparador de estados con cálculo de variaciones dimensionales, económicas y de riesgos.

6. **`PropertyIntelligenceEngine` (Fachada Maestra):**
   - Consolidación transversal del informe completo de inteligencia del inmueble.

---

## 5. Endpoints REST (`/api/properties`)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/properties` | Lista todos los inmuebles |
| `POST` | `/api/properties` | Registra un nuevo inmueble |
| `GET` | `/api/properties/:id` | Detalle completo del inmueble con proyectos asociados |
| `PUT` | `/api/properties/:id` | Actualiza metadatos y parámetros del inmueble |
| `DELETE` | `/api/properties/:id` | Elimina un inmueble |
| `POST` | `/api/properties/:id/link-project` | Asocia un proyecto al inmueble |
| `POST` | `/api/properties/:id/unlink-project` | Desvincula un proyecto |
| `GET` | `/api/properties/:id/analysis` | Genera el informe consolidado de inteligencia |
| `GET` | `/api/properties/:id/data-quality` | Auditoría de completitud y calidad del dato |
| `GET` | `/api/properties/:id/opportunities` | Lista oportunidades de mejora |
| `POST` | `/api/properties/:id/opportunities` | Detecta y registra nuevas oportunidades |
| `GET` | `/api/properties/:id/risks` | Lista riesgos evaluados |
| `POST` | `/api/properties/:id/risks` | Evalúa y registra riesgos |
| `GET` | `/api/properties/:id/snapshots` | Historial de instantáneas temporales |
| `POST` | `/api/properties/:id/snapshots` | Crea una nueva instantánea del estado actual |
| `GET` | `/api/properties/:id/snapshots/compare` | Compara dos instantáneas temporales |
