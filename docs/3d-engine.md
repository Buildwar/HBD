# Motor 3D de Vivienda (HBD V6.0.0)

## 1. Visión General
El **Motor 3D de Vivienda** de HBD V6.0.0 convierte automáticamente la geometría 2D digitalizada (paredes, habitaciones, puertas, ventanas y mobiliario) en una representación tridimensional interactiva y navegable en tiempo real con WebGL y Three.js.

Flujo de transformación:
```
PLANO 2D → GEOMETRÍA → PAREDES → HABITACIONES → PUERTAS → VENTANAS → MOBILIARIO → MODELO 3D → NAVEGACIÓN → MATERIALES → ILUMINACIÓN
```

---

## 2. Principio de Derivación Pura (2D → 3D)
El modelo 3D se deriva directamente de la capa geométrica 2D mediante `ThreeDConversionEngine`. No existe una geometría duplicada que pueda desincronizarse.

### 2.1. Unidades y Coordenadas
- **Unidad del Mundo 3D**: $1\text{ unidad} = 1.0\text{ metro } (m)$.
- **Conversión de Espacio de Coordenadas**:
  - $X_{3D} = (X_{px} - \text{centerPxX}) / \text{pixelsPerMeter}$
  - $Y_{3D} = \text{elevación en metros}$ (suelo $0.0\text{ m}$, techo $2.50\text{ m}$)
  - $Z_{3D} = (Y_{px} - \text{centerPxY}) / \text{pixelsPerMeter}$
  - El plano digitalizado queda automáticamente centrado en el origen $(0, 0, 0)$ de la escena 3D.

---

## 3. Elementos Constructivos 3D

### 3.1. Paredes Volumétricas (`Wall3D`)
- Creadas a partir de las cotas reales de pared: longitud euclidiana, espesor ($0.15\text{ m} - 0.30\text{ m}$) y altura de planta ($2.50\text{ m}$).
- Diferenciación visual entre muros exteriores portantes y tabiques interiores de distribución.

### 3.2. Suelos y Techos (`Floor3D` / `Ceiling3D`)
- Triangulación de polígonos irregulares o rectangulares de habitaciones (`THREE.Shape` y `ShapeGeometry`).
- Asignación de materiales de suelo específicos por habitación (Madera roble, Parquet nogal, Baldosa porcelánica, Mármol blanco, Cemento pulido, Moqueta).
- Techo plano superior ubicado en la cota superior de la planta.

### 3.3. Puertas 3D (`Door3D`)
- Marco perimetral y hoja pivotante sobre eje bisagra.
- Estado interactivo con ángulo de abatimiento suave ($0^\circ$ cerrada, $85^\circ$ abierta).

### 3.4. Ventanas 3D (`Window3D`)
- Marco perimetral, antepecho (elevación sobre suelo $0.90\text{ m}$) y panel de cristal translúcido con transmisión óptica.

### 3.5. Mobiliario 3D Paramétrico (`Furniture3D`)
- Geometría procedural estructurada por categorías:
  - **Sofás / Salón**: Asiento base, respaldo ergonómico, reposabrazos izquierdo/derecho y cojines.
  - **Camas / Dormitorio**: Base de madera, colchón, cabecero tapizado y almohadas dobles.
  - **Mesas / Comedor**: Tablero superior biselado y 4 patas estilizadas.
  - **Sillas**: Asiento, respaldo y 4 patas cilíndricas.
  - **Armarios**: Cuerpo principal, paneles de puerta y tiradores.
  - **Genérico**: Bloque volumétrico de proporción exacta $W \times D \times H$.

---

## 4. Navegación, Cámaras y Modos de Vista

1. **Modo Órbita (`OrbitControls`)**:
   - Rotación libre alrededor del centro de la vivienda con botón izquierdo del ratón.
   - Desplazamiento (Pan) con botón derecho del ratón.
   - Zoom con rueda de desplazamiento.
2. **Modo Recorrido en Primera Persona (`Walkthrough WASD`)**:
   - Altura de ojos a cota $1.70\text{ m}$.
   - Controles de desplazamiento: [W] adelante, [S] atrás, [A] izquierda, [D] derecha.
   - Rotación y cabeceo con el ratón.
   - **Sistema de Prevención de Colisiones**: El usuario no puede atravesar paredes sólidas.
3. **Presets de Cámara Inmediatos**:
   - 🏠 Casa completa (Vista axonométrica general).
   - 📐 Vista superior (Cenital 2D/3D).
   - 🧊 Vista isométrica (Perspectiva a 45°).
   - 🛋️ Salón, 🛏️ Dormitorio, 🍳 Cocina, 🚿 Baño (Enfoque suave de estancias detectadas).

---

## 5. Iluminación y Materiales
- **Modo Día (☀️)**: Luz ambiental equilibrada + luz solar direccional cálida con sombras suaves arrojadas.
- **Modo Noche (🌙)**: Luz ambiental nocturna azulada + luz lunar tenue + puntos de luz cálidos decorativos en el centro de cada habitación.
- **Capas de Visibilidad**: Control granular para ocultar/mostrar Paredes, Suelos, Techos, Puertas, Ventanas, Mobiliario, Cotas 3D y Modo Estructura (Wireframe).

---

## 6. Sincronización Bidireccional (3D ↔ 2D)
- Al transformar (mover o rotar) un mueble en el entorno 3D mediante los gizmos, su posición se recalcula y se envía a la API (`/api/3d/sync-furniture/:placementId`).
- La validación espacial del motor "¿Cabe aquí?" se ejecuta en tiempo real para verificar compatibilidad espacial.
- Al alternar entre `[ 📐 Plano 2D ]` y `[ 🧊 Vista 3D ]`, los cambios se reflejan de inmediato.

---

## 7. Autoría y Licencia
- **Proyecto**: HBD — Home Board Designer
- **Versión**: 6.0.0
- **Autor oficial**: Adrián Palma
- **Copyright**: © 2026 Adrián Palma — HBD (Home Board Designer)
