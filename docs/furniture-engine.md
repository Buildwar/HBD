# Motor de Mobiliario y Validación Espacial (HBD V5.0.0)

## 1. Visión General
El **Motor de Mobiliario y Validación Espacial** de HBD V5.0.0 permite responder con precisión geométrica a la pregunta fundamental: **"¿Cabe aquí?"**.

Flujo de datos:
```
PLANO → GEOMETRÍA → HABITACIONES → MOBILIARIO → COLOCACIÓN → DIMENSIONES → COLISIONES → ESPACIOS LIBRES → VALIDACIÓN → "¿CABE AQUÍ?"
```

---

## 2. Componentes del Motor

### 2.1. `FurnitureEngine` (`shared/src/utils/furniture.engine.ts`)
- Conversión métrica bidireccional (`m`, `cm`, `mm`).
- Validación de dimensiones físicas realistas.
- Cálculo de Bounding Box Orientado (**OBB**) aplicando rotación $\theta$ sobre coordenadas locales y globales.

### 2.2. `CollisionEngine` (`shared/src/utils/collision.engine.ts`)
- **Separating Axis Theorem (SAT)** para polígonos convexos orientados.
- Detección de colisiones contra segmentos de pared y cálculo de penetración en centímetros.
- Comprobación de contención poligonal de estancia (Ray Casting Point-in-Polygon).
- Detección de invasión de radios y arcos de abatimiento de puertas.
- Cálculo de distancias ortogonales mínimas a paredes (Márgenes Frontal, Trasero, Izquierdo, Derecho).

### 2.3. `SpatialValidationEngine` (`shared/src/utils/spatialValidation.engine.ts`)
Evalúa el mueble en su contexto espacial y genera un veredicto estructurado:
- **`VALID` (Verde / Compatible)**: El mueble cabe sin colisiones y mantiene distancias de paso recomendadas (>60 cm).
- **`WARNING` (Amarillo / Revisar)**: El mueble cabe físicamente pero invade zonas de paso reducido (30-60 cm) o se aproxima a zonas de abatimiento.
- **`INVALID` (Rojo / No compatible)**: El mueble colisiona con una pared, se sale de la habitación o bloquea directamente una puerta.

---

## 3. Categorías y Catálogo Genérico
HBD V5.0.0 incorpora 15 categorías residenciales con más de 30 piezas paramétricas base:
1. **Salón** (Sofás, Sillones, Muebles TV, Mesas de centro, Estanterías).
2. **Comedor** (Mesas rectangulares/redondas, Sillas, Aparadores).
3. **Dormitorio Principal** (Camas King/Queen/Doble, Mesitas de noche, Cómodas, Armarios).
4. **Dormitorio Secundario / Juvenil** (Camas individuales, Escritorios).
5. **Dormitorio Infantil** (Cunas, Cambiadores).
6. **Cocina** (Módulos bajos/altos, Islas, Frigoríficos, Hornos/Vitrocerámicas).
7. **Baño Principal** (Lavabos, Inodoros, Platos de ducha, Bañeras).
8. **Aseo** (Lavabos compactos, Inodoros compactos).
9. **Despacho / Estudio** (Escritorios ergonómicos, Sillas de oficina, Librerías).
10. **Recibidor / Pasillo** (Consolas, Zapateros, Percheros).
11. **Terraza / Balcón** (Conjuntos de exterior, Tumbonas).
12. **Lavadero / Tendedero** (Lavadoras, Secadoras, Fregaderos de servicio).
13. **Vestidor** (Módulos de armario abiertos/cerrados).
14. **Almacenaje / Trastero** (Estanterías metálicas, Armarios de resina).
15. **Elementos Auxiliares** (Plantas, Lámparas de pie, Espejos).

---

## 4. Editor 2D Interactivo
- **Herramienta Mobiliario**: Inserción directa desde la barra de herramientas o el cajón lateral.
- **Manipulación**: Arrastre fluido en canvas, rotaciones rápidas (0°, 45°, 90°, 180°, 270°) y rotación libre.
- **Edición en Tiempo Real**: Modificación de Ancho y Fondo con opción de bloqueo de proporción (🔒).
- **Cálculo de Holguras en Vivo**: Visualización de líneas guía punteadas con cotas en centímetros a las paredes más cercanas.
- **Diagnóstico "¿Cabe aquí?"**: Panel de propiedades reactivo que explica el motivo exacto del estado de validación.

---

## 5. Autoría y Licencia
- **Proyecto**: HBD — Home Board Designer
- **Versión**: 5.0.0
- **Autor oficial**: Adrián Palma
- **Copyright**: © 2026 Adrián Palma — HBD (Home Board Designer)
