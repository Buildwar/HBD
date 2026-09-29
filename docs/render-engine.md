# Motor de Visualización Arquitectónica y Render (Render Engine) — V7.0.0

## 1. Visión General

El **Motor de Visualización Arquitectónica y Render** de HBD (V7.0.0) evoluciona la representación 3D paramétrica de la vivienda hacia un entorno de renderizado fotorrealista y personalización estética.

Permite transformar el modelo 3D con geometría real en escenas fotográficas de alta resolución con control exhaustivo de iluminación solar y artificial, temperaturas de color Kelvin, estilos de diseño arquitectónico y comparativas Antes / Después.

```
PLANO REAL -> GEOMETRÍA REAL -> MODELO 3D -> MATERIALES -> MOBILIARIO -> ILUMINACIÓN -> CÁMARA -> ESCENA -> RENDER -> IMAGEN
```

---

## 2. Arquitectura y Desacoplamiento

El sistema mantiene una arquitectura modular fuertemente desacoplada:

1. **`GeometryEngine`**: Cálculo de coordenadas, distancias euclidianas, áreas Shoelace en $m^2$, cotas y polígonos 2D.
2. **`FurnitureEngine` / `CollisionEngine`**: Catálogo paramétrico de mobiliario y validación física "¿Cabe aquí?" vía OBB y SAT.
3. **`ThreeDConversionEngine`**: Generación de mallas 3D volumétricas (muros, forjados, suelos, vanos y carpinterías).
4. **`SceneEngine` (`shared/src/utils/scene.engine.ts`)**:
   - Gestión de escenas con cámaras, iluminación, variantes de diseño y post-procesado.
   - Algoritmo de cálculo de azimut y elevación solar según hora del día.
   - Conversión de temperatura de color Kelvin (2700K - 6500K) a color RGB/Hex.
   - Generador de presets de estilo arquitectónico (Moderno, Minimalista, Industrial, Nórdico, Clásico).
5. **`RenderEngine` (`shared/src/utils/render.engine.ts`)**:
   - Presets de resolución: HD 1080p ($1920 \times 1080$), 2K 1440p ($2560 \times 1440$), 4K UHD ($3840 \times 2160$).
   - Perfiles de calidad de render: Draft, Medium, High, Ultra (con PCF Soft Shadows, SSAO, Tone Mapping y antialiasing SMAA/FXAA).
   - Validador previo al render y estimación de tiempo de procesamiento.

---

## 3. Iluminación y Sol Solar

### Horas del Día Paramétricas
- **Mañana (08:00)**: Elevación $22^\circ$, Azimut $95^\circ$, Luz solar cálida dorada (3200K), intensidad 1.1.
- **Mediodía (12:00)**: Elevación $68^\circ$, Azimut $180^\circ$, Luz cenital blanca pura (5500K), intensidad 1.5.
- **Tarde (16:00)**: Elevación $35^\circ$, Azimut $240^\circ$, Luz rasante cálida (4200K), intensidad 1.2.
- **Atardecer (20:00)**: Elevación $8^\circ$, Azimut $285^\circ$, Tonos anaranjados y rojizos (2700K), intensidad 0.9 con ambientación crepuscular.
- **Noche (23:00)**: Elevación $-15^\circ$, Luz lunar tenue fría (7500K), iluminación artificial encendida (lámparas de techo e indirectas a 3000K).

### Temperatura de Color (Kelvin)
El motor convierte físicamente la temperatura Kelvin en coordenadas cromáticas sRGB para iluminar fidedignamente los espacios interiores y exteriores:
- **2700K**: Blanco muy cálido (iluminación residencial acogedora).
- **3000K**: Blanco cálido suave (focos de acento y apliques).
- **4000K**: Blanco neutro (cocinas, baños y zonas de trabajo).
- **6500K**: Luz diurna / blanco frío (luz natural indirecta).

---

## 4. Presets de Estilo Arquitectónico

HBD V7 incluye 5 estilos predefinidos que reasignan materiales y atmósferas sin alterar la geometría:

| Estilo | Suelo | Paredes | Techo | Mobiliario Dominante | Acento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Moderno** | Porcelánico Gris | Gris Claro / Blanco | Blanco Puro | Nogal / Roble Oscuro | Negro Mate |
| **Minimalista** | Hormigón Pulido | Blanco Puro | Blanco | Roble Claro / Fresno | Blanco Mate |
| **Industrial** | Cemento Envejecido | Ladrillo / Cemento | Hormigón Visto | Madera Rústica | Acero / Negro |
| **Nórdico** | Pino Claro / Roble | Blanco Cálido | Blanco | Madera Clara | Sage / Mostaza |
| **Clásico** | Mármol Carrara | Beige / Crema | Molduras Blanco | Caoba / Nogal | Dorado Envejecido |

---

## 5. Variantes de Diseño (Variante A vs Variante B)

El sistema de variantes de diseño permite al usuario comparar dos propuestas de interiorismo sobre la **misma geometría estructural**:
- **Geometría Compartida**: Las paredes, puertas, ventanas y cotas permanecen invariables.
- **Overrides de Materiales**: Cada variante almacena de forma independiente las texturas de suelos, paredes y techos por estancia.
- **Configuración de Mobiliario**: Permite alternar la distribución o los acabados de los muebles.
- **Comparador Split-Screen Antes / Después**: Deslizador interactivo en la galería de renders para superponer y evaluar las dos variantes.

---

## 6. Proceso de Renderizado y Calidad

El pipeline de renderizado se ejecuta en 4 fases secuenciales con barra de progreso interactiva:

1. **Preparación de Geometría y Materiales** (20%): Aplicación de shaders PBR, mapas de rugosidad y oclusión.
2. **Cálculo de Iluminación y Sombras** (50%): Posicionamiento solar, mapa de sombras PCF de alta resolución y luces puntuales.
3. **Pase de Post-procesamiento** (80%): Oclusión ambiental (SSAO), mapeo tonal (ACESFilmic), bloom y viñeteado.
4. **Composición y Exportación** (100%): Muestreo final, captura en buffer de alta resolución y generación de archivo PNG / WebP.

---

## 7. Modo Presentación Inmersivo

Un modo a pantalla completa sin distracciones diseñado para mostrar el proyecto a clientes o visualizar la vivienda terminada:
- Ocultación automática de paneles de edición y herramientas.
- Navegación fluida en primera persona y órbita.
- Cambio ágil entre escenas guardadas mediante selector minimalista.
