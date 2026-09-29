# Arquitectura del Sistema — HBD (Home Board Designer)

## 1. Visión General
**HBD — Home Board Designer** es una plataforma profesional para digitalizar viviendas a partir de planos arquitectónicos, interpretar automáticamente su geometría, calcular distancias y superficies, crear un modelo 2D editable, convertirlo en un modelo 3D y evolucionar hacia el **gemelo digital** y la **visualización fotorrealista** de una vivienda.

```
PLANO ARCHIVO (PDF / Imagen)
  ↓
ANÁLISIS & OCR DE COTAS
  ↓
DETECCIÓN GEOMÉTRICA (Paredes, Puertas, Ventanas, Habitaciones)
  ↓
CALIBRACIÓN DE ESCALA (Píxeles → Metros)
  ↓
MODELO 2D EDITABLE (CAD simplificado)
  ↓
MEDICIÓN & DISTRIBUCIÓN DE MOBILIARIO
  ↓
VALIDACIÓN ESPACIAL ("¿Cabe aquí?" + Colisiones SAT)
  ↓
MODELO 3D & MATERIALES (Three.js / WebGL)
  ↓
ESCENAS & ESTILOS DE DISEÑO (Variantes A/B)
  ↓
MOTOR DE RENDER ARQUITECTÓNICO & FOTORREALISMO (HD / 2K / 4K)
  ↓
MOTOR DE IA DE DISEÑO E INTERIORISMO (AIDesignEngine + Copilot)
  ↓
MOTOR DE VISIÓN ARTIFICIAL & RECONOCIMIENTO (AIVisionEngine + Galería + Diff)
  ↓
GEMELO DIGITAL
```

---

## 2. Principio Fundamental de Desacoplamiento (Visión vs IA vs Geometría vs 3D)
- **Capa de Visión Artificial (`AIVisionEngine`)**: Analiza fotos reales y de inspiración, detecta objetos/mobiliario, clasifica estancias y extrae paletas y materiales con dimensiones preliminares `DimensionSource.AI_ESTIMATED`. Requiere revisión humana obligatoria antes de incorporar al plano.
- **Motor Geométrico (`GeometryEngine`)**: Calcula con precisión milimétrica distancias reales, superficies poligonales ($m^2$), intersecciones, colisiones y márgenes libres.
- **Motor de Validación Espacial (`SpatialValidationEngine`)**: Valida físicamente colocaciones, radios de puertas y zonas de paso (0.70m - 0.90m).
- **Motor de Conversión 3D (`ThreeDConversionEngine`)**: Genera mallas 3D estructurales a partir de la geometría 2D.
- **Motor de Escenas y Render (`SceneEngine` / `RenderEngine`)**: Gestiona cámaras, iluminación solar/Kelvin, variantes estéticas A/B, post-procesado y exportación de imágenes fotorrealistas.
- **Motor de IA de Diseño (`AIDesignEngine`)**: Genera propuestas paramétricas de interiorismo validadas sobre la geometría real sin permitir alucinaciones espaciales.

---

## 3. Topología de Módulos
```
hbd/
├── shared/           # Tipos TypeScript, constantes de autoría, motores y DTOs comunes
├── server/           # Backend Node.js + Express + Prisma ORM + PostgreSQL + JWT
├── client/           # Frontend React 18/19 + Vite + Tailwind CSS + Three.js + i18n
├── docs/             # Documentación exhaustiva y roadmap
├── uploads/          # Almacenamiento desacoplado de archivos físicos
└── docker-compose.*  # Orquestación para desarrollo local y Portainer
```

---

## 4. Seguridad y Roles (RBAC)
- **ADMIN**: Control total de usuarios, roles, configuraciones y proyectos.
- **DESIGNER**: Creación y edición completa de planos, geometría, mobiliario y escenas de render.
- **USER**: Creación y gestión de proyectos residenciales propios.
- **VIEWER**: Lectura y navegación interactiva de proyectos asignados.

---

## 5. Marca y Autoría Centralizada
La autoría oficial del desarrollador (`Adrián Palma`), la versión del sistema (`7.0.0`) y el copyright (`© 2026 Adrián Palma — HBD (Home Board Designer)`) se gestionan desde un punto único de configuración centralizada (`@hbd/shared` -> `APP_METADATA` y variables de entorno), garantizando coherencia en **Configuración → Acerca de**.

---

## 6. Motores Especializados
- **`GeometryEngine`**: Distancias euclidianas, áreas Shoelace en $m^2$, cotas y polígonos 2D.
- **`FurnitureEngine` / `CollisionEngine`**: Catálogo paramétrico de mobiliario y validación física "¿Cabe aquí?" vía OBB y SAT.
- **`ThreeDConversionEngine`**: Generación de mallas 3D volumétricas (muros, forjados, suelos, vanos y carpinterías).
- **`SceneEngine`**: Configuración de cámaras arquitectónicas, iluminación solar por azimut/elevación y estilos de diseño.
- **`RenderEngine`**: Pipeline de render fotorrealista (Draft, Medium, High, Ultra) y exportación a alta resolución (HD, 2K, 4K).
