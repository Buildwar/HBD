# HBD — Home Board Designer
## Motor de Planos Arquitectónicos & Geometría V4.0.0

### 1. Visión General del Motor
El Motor de Planos Arquitectónicos de HBD V4.0.0 es el núcleo funcional encargado de transformar planos residenciales (PDFs vectoriales/rasterizados, imágenes PNG, JPG, JPEG) en modelos digitales estructurados con precisión milimétrica.

```
PLANO (PDF / Imagen)
       ↓
DOCUMENT PARSER (Extracción de páginas y metadatos)
       ↓
SCALE DETECTOR (Lectura de cotas / Escala gráfica / Calibración 2 puntos)
       ↓
ELEMENT DETECTORS (Paredes, Habitaciones, Puertas, Ventanas, OCR Textos)
       ↓
GEOMETRY ENGINE (Fórmula de Gauss / Shoelace m², distancias, ángulos)
       ↓
VALIDATOR & CONFIDENCE (Puntuación de calidad, avisos de revisión)
       ↓
EDITOR 2D INTERACTIVO (Capas, opacidad de fondo, herramientas de dibujo)
       ↓
PERSISTENCIA MODELO DIGITAL (Base de datos PostgreSQL + Prisma)
```

---

### 2. Principio Rector: IA Desacoplada de la Geometría
Para garantizar el máximo rigor técnico en el diseño de viviendas, HBD sigue una regla estricta:
- **Los detectores (IA / Visión / OCR)**: Identifican elementos, contornos, orientaciones y tipologías.
- **`GeometryEngine`**: Ejecuta todos los cálculos métricos, superficies reales en $m^2$, distancias euclidianas, ángulos ortogonales e intersecciones.

#### Fórmula de Superficie de Gauss (Shoelace Algorithm)
Para cualquier polígono cerrado con $N$ vértices $(x_i, y_i)$:
$$\text{Área (píxeles}^2) = \frac{1}{2} \left| \sum_{i=0}^{N-1} (x_i y_{i+1} - x_{i+1} y_i) \right|$$
$$\text{Superficie Real } (m^2) = \frac{\text{Área (píxeles}^2)}{\text{FactorEscala}^2}$$

Donde $\text{FactorEscala} = \frac{\text{Distancia Píxeles}}{\text{Distancia Real Metros}}$ (ej. $1000\text{px} / 2.00\text{m} = 500\text{ px/m}$).

---

### 3. Pipeline Modular de Servicios

| Módulo | Archivo | Responsabilidad |
|---|---|---|
| **Document Parser** | `planParser.service.ts` | Extracción de metadatos, soporte multiformato PDF/Raster y normalización de resolución. |
| **Scale Detector** | `scaleDetector.service.ts` | Detección de ratios ("1:50", "1:100") y calibración manual por 2 puntos de referencia. |
| **Text Detector / OCR** | `textDetector.service.ts` | Extracción de nombres de estancias (Salón, Cocina, Dormitorio, Baño), cotas y superficies. |
| **Wall Detector** | `wallDetector.service.ts` | Extracción de muros perimetrales exteriores (0.25-0.30m) y tabiques interiores (0.10-0.15m). |
| **Room Detector** | `roomDetector.service.ts` | Detección de bucles cerrados, cálculo de polígono y asignación de tipo de habitación. |
| **Door & Window Detectors** | `doorDetector.service.ts`, `windowDetector.service.ts` | Posicionamiento sobre paredes, sentido de abatimiento (inward/outward/sliding) y vanos. |
| **Analysis Validator** | `analysisValidator.service.ts` | Verificación de topología, cálculo de puntuación global y niveles de confianza (Alta, Media, Baja). |
| **Master Engine** | `floorplanEngine.service.ts` | Orquestador completo del pipeline end-to-end. |

---

### 4. Editor 2D Interactivo (`FloorplanEditor2D`)

El editor 2D proporciona una interfaz profesional completa:
1. **Plano Original de Fondo**: Subyacente al espacio de trabajo con control de opacidad ajustable (0% a 100%).
2. **Paleta de Herramientas**:
   - `Seleccionar (V)`: Inspección y edición de elementos.
   - `Pared (W)`: Trazado interactivo con ajuste angular (0°, 45°, 90°) y longitud en tiempo real.
   - `Habitación (R)`: Definición de polígonos cerrados con cálculo dinámico de $m^2$.
   - `Puerta (D)` y `Ventana (F)`: Inserción directa de vanos sobre muros.
   - `Medir Cota (M)`: Medición punto a punto con acotación visual.
   - `Calibrar Escala (C)`: Selección de 2 puntos para calibración métrica exacta.
3. **Gestión de Capas**: Control de visibilidad independiente para Fondo, Paredes, Habitaciones, Puertas, Ventanas y Cotas.
4. **Panel de Propiedades**: Edición de grosores, alturas, tipologías, nombres y colores de estancias.
5. **Pila Deshacer / Rehacer**: Control total de versiones en memoria con indicador de autoguardado.

---

### 5. Autoría y Versión
- **Nombre Oficial**: HBD — Home Board Designer
- **Versión**: 4.0.0
- **Autor Oficial**: Adrián Palma
- **Copyright**: © 2026 Adrián Palma — HBD (Home Board Designer)
