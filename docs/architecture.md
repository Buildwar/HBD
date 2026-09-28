# Arquitectura del Sistema — HBD (Home Board Designer)

## 1. Visión General
**HBD — Home Board Designer** es una plataforma profesional para digitalizar viviendas a partir de planos arquitectónicos, interpretar automáticamente su geometría, calcular distancias y superficies, crear un modelo 2D editable, convertirlo en un modelo 3D y evolucionar hacia el **gemelo digital** de una vivienda.

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
VALIDACIÓN ESPACIAL ("¿Cabe aquí?" + Colisiones)
  ↓
MODELO 3D & MATERIALES (Three.js / WebGL)
  ↓
RENDERIZADO & GEMELO DIGITAL
```

---

## 2. Principio Fundamental de Desacoplamiento (IA vs Motor Geométrico)
- **Capa de Visión / IA**: Propone detecciones preliminares de paredes, habitaciones, cotas, textos y mobiliario.
- **Motor Geométrico**: Calcula con precisión milimétrica distancias reales, superficies poligonales ($m^2$), intersecciones, colisiones y márgenes libres.
- **Revisión del Usuario**: En caso de discrepancia, la interfaz presenta una pantalla de revisión con elementos marcados para confirmación o ajuste directo.

---

## 3. Topología de Módulos
```
hbd/
├── shared/           # Tipos TypeScript, constantes de autoría y DTOs comunes
├── server/           # Backend Node.js + Express + Prisma ORM + PostgreSQL + JWT
├── client/           # Frontend React 18/19 + Vite + Tailwind CSS + i18n
├── docs/             # Documentación exhaustiva y roadmap
├── uploads/          # Almacenamiento desacoplado de archivos físicos
└── docker-compose.*  # Orquestación para desarrollo local y Portainer
```

---

## 4. Seguridad y Roles (RBAC)
- **ADMIN**: Control total de usuarios, roles, configuraciones y proyectos.
- **DESIGNER**: Creación y edición completa de planos, geometría y mobiliario.
- **USER**: Creación y gestión de proyectos residenciales propios.
- **VIEWER**: Lectura y navegación interactiva de proyectos asignados.

---

## 5. Marca y Autoría Centralizada
La autoría del desarrollador (`apalma`), la versión del sistema (`1.0.0`) y el copyright se gestionan desde un punto único de configuración (`shared/src/config/app.constants.ts` y variables de entorno), evitando duplicidad y garantizando la coherencia en la sección **Configuración → Acerca de**.
